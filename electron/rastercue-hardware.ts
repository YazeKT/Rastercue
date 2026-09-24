import { app, ipcMain } from "electron";
import { execFile, spawn } from "child_process";
import { createHash } from "crypto";
import fs from "fs";
import os from "os";
import path from "path";
import { ComputeBackendId, HardwareSnapshot, SoftwareInventory } from "../common/hardware-types";
import { execPath, modelsPath } from "./utils/get-resource-paths";
import { builtInModelAvailability } from "./utils/model-availability";
import { computeBackends, cpuSummary, dedupeAdapters, electronAdapters, parseEngineProbeOutput, parseLspciAdapters, parsePhysicalCoreCount, parseWindowsAdapters } from "./utils/hardware-detection";
import { setComputeBackend } from "./utils/spawn-upscayl";
import { cpuExecPath } from "./utils/get-cpu-resource-path";

const CACHE_MS = 60_000;
let hardwareCache: { at: number; value: HardwareSnapshot } | undefined;
let softwareCache: { at: number; value: SoftwareInventory } | undefined;
const originalExecPath = process.platform === "win32" && fs.existsSync(`${execPath}.exe`) ? `${execPath}.exe` : execPath;

function run(command: string, args: string[], timeout = 12_000): Promise<{ stdout: string; stderr: string; timedOut: boolean; error?: string }> {
  return new Promise(resolve => {
    let stdout = "", stderr = "", settled = false;
    const child = spawn(command, args, { windowsHide: true, stdio: ["ignore", "pipe", "pipe"] });
    const append = (current: string, data: Buffer) => (current + data.toString()).slice(-1024 * 1024);
    child.stdout.on("data", data => { stdout = append(stdout, data); });
    child.stderr.on("data", data => { stderr = append(stderr, data); });
    const finish = (value: { timedOut: boolean; error?: string }) => { if (!settled) { settled = true; clearTimeout(timer); resolve({ stdout, stderr, ...value }); } };
    const timer = setTimeout(() => { child.kill(); finish({ timedOut: true, error: "Probe timed out." }); }, timeout);
    child.once("error", error => finish({ timedOut: false, error: error.message }));
    child.once("close", () => finish({ timedOut: false }));
  });
}

function execText(command: string, args: string[], timeout = 8_000): Promise<string> {
  return new Promise(resolve => execFile(command, args, { windowsHide: true, timeout, maxBuffer: 1024 * 1024 }, (error, stdout) => resolve(error ? "" : String(stdout))));
}

async function detectSystemAdapters() {
  let output = "";
  if (process.platform === "win32") {
    output = await execText("powershell.exe", ["-NoLogo", "-NoProfile", "-NonInteractive", "-Command", "Get-CimInstance Win32_VideoController | Select-Object Name,AdapterRAM,DriverVersion,PNPDeviceID,Status | ConvertTo-Json -Compress"]);
    return parseWindowsAdapters(output);
  }
  if (process.platform === "darwin") {
    output = await execText("system_profiler", ["SPDisplaysDataType", "-json"]);
    try {
      const rows = JSON.parse(output)?.SPDisplaysDataType || [];
      return rows.map((row: any, index: number) => ({ id: `system-profiler-${index}`, name: row.sppci_model || "Unknown display adapter", vendor: /apple/i.test(row.sppci_model || "") ? "apple" : "unknown", driverVersion: null, memoryBytes: null, pnpDeviceId: null, active: null, source: "system-profiler" as const }));
    } catch { return []; }
  }
  output = await execText("lspci", ["-mm"]);
  return parseLspciAdapters(output);
}

async function detectPhysicalCores(): Promise<number | null> {
  if (process.platform === "win32") {
    return parsePhysicalCoreCount(await execText("powershell.exe", ["-NoLogo", "-NoProfile", "-NonInteractive", "-Command", "(Get-CimInstance Win32_Processor | Measure-Object -Property NumberOfCores -Sum).Sum"]));
  }
  if (process.platform === "darwin") return parsePhysicalCoreCount(await execText("sysctl", ["-n", "hw.physicalcpu"]));
  const output = await execText("lscpu", ["-p=Core,Socket"]);
  if (!output) return null;
  const cores = new Set(output.split(/\r?\n/).filter(line => line && !line.startsWith("#")));
  return cores.size || null;
}

async function probeOriginalEngine() {
  if (!fs.existsSync(originalExecPath)) return { devices: [], state: "unavailable" as const, reason: "The original Upscayl engine binary is missing from this build." };
  const ids = Array.from({ length: 8 }, (_, index) => String(index));
  const missingInput = path.join(os.tmpdir(), `rastercue-device-probe-${process.pid}-${Date.now()}.png`);
  const missingOutput = `${missingInput}.out.png`;
  const result = await run(originalExecPath, ["-i", missingInput, "-o", missingOutput, "-g", ids.join(","), "-t", ids.map(() => "0").join(","), "-j", ids.map(() => "1:1:1").join(","), "-v"]);
  const devices = parseEngineProbeOutput(`${result.stdout}\n${result.stderr}`);
  if (devices.length) return { devices, state: "available" as const, reason: `${devices.length} Vulkan device${devices.length === 1 ? "" : "s"} initialized by the original engine probe.` };
  if (result.timedOut) return { devices, state: "unknown" as const, reason: "The original engine device probe timed out; compatibility was not confirmed." };
  return { devices, state: "unavailable" as const, reason: result.error || "The original engine could not initialize a Vulkan device." };
}

async function probeCpuEngine() {
  if (process.platform !== "win32") return { state: "unavailable" as const, reason: "The Rastercue CPU backend is currently packaged for Windows x64 only." };
  if (!fs.existsSync(cpuExecPath)) return { state: "unavailable" as const, reason: "The genuine CPU inference runtime is missing from this build." };
  const result = await run(cpuExecPath, ["--probe-json"], 8_000);
  try {
    const probe = JSON.parse(result.stdout.trim());
    if (!result.timedOut && !result.error && probe.backend === "cpu" && probe.vulkan === false && probe.runtime === "ncnn") {
      return { state: "available" as const, reason: `Native NCNN CPU inference probe passed with ${probe.threads || os.cpus().length} logical threads and no Vulkan backend.` };
    }
  } catch { /* A malformed probe is unavailable, never assumed compatible. */ }
  return { state: result.timedOut ? "unknown" as const : "unavailable" as const, reason: result.error || "The native CPU inference probe did not return a valid CPU-only contract." };
}

export async function detectHardware(refresh = false): Promise<HardwareSnapshot> {
  if (!refresh && hardwareCache && Date.now() - hardwareCache.at < CACHE_MS) return hardwareCache.value;
  const warnings: string[] = [];
  const [gpuInfo, systemAdapters, engine, cpuEngine, physicalCores] = await Promise.all([
    app.getGPUInfo("complete").catch(error => { warnings.push(`Electron graphics detection failed: ${error instanceof Error ? error.message : String(error)}`); return null; }),
    detectSystemAdapters().catch(error => { warnings.push(`Operating-system graphics detection failed: ${error instanceof Error ? error.message : String(error)}`); return []; }),
    probeOriginalEngine(),
    probeCpuEngine(),
    detectPhysicalCores().catch(() => null),
  ]);
  const displayAdapters = dedupeAdapters(systemAdapters, electronAdapters(gpuInfo));
  if (!displayAdapters.length) warnings.push("No display adapters were reported by the operating system or Electron.");
  const originalReason = engine.reason;
  const snapshot: HardwareSnapshot = {
    schemaVersion: 1, detectedAt: new Date().toISOString(), platform: process.platform, release: os.release(),
    cpu: cpuSummary(physicalCores), memory: { totalBytes: os.totalmem(), freeBytes: os.freemem() },
    displayAdapters, engineDevices: engine.devices,
    backends: computeBackends(engine.state, originalReason, engine.devices, cpuEngine.state, cpuEngine.reason),
    recommendation: engine.devices.length ? { backendId: "original-vulkan", deviceId: engine.devices[0].id, confidence: "verified", reason: `Use ${engine.devices[0].name}; the original engine initialized it successfully.` } : cpuEngine.state === "available" ? { backendId: "cpu", deviceId: null, confidence: "verified", reason: "No compatible Vulkan device was verified. Use the genuine native CPU backend; processing will be slower." } : { backendId: null, deviceId: null, confidence: "unverified", reason: "No compute backend passed a local compatibility probe. Keep current processing settings until a device is verified." },
    actualDevice: null,
    actualDeviceReason: "The protected processing commands do not yet emit a machine-readable actual-device event. Rastercue will not infer this from the selected ID.",
    warnings,
  };
  hardwareCache = { at: Date.now(), value: snapshot };
  return snapshot;
}

async function sha256(filename: string): Promise<string | null> {
  if (!fs.existsSync(filename)) return null;
  return new Promise(resolve => {
    const hash = createHash("sha256");
    const stream = fs.createReadStream(filename);
    stream.on("data", data => hash.update(data));
    stream.once("error", () => resolve(null));
    stream.once("end", () => resolve(hash.digest("hex")));
  });
}

export async function softwareInventory(refresh = false): Promise<SoftwareInventory> {
  if (!refresh && softwareCache && Date.now() - softwareCache.at < CACHE_MS) return softwareCache.value;
  const modelState = builtInModelAvailability(modelsPath);
  const engineHash = await sha256(originalExecPath);
  const cpuHash = await sha256(cpuExecPath);
  const value: SoftwareInventory = {
    schemaVersion: 1, collectedAt: new Date().toISOString(),
    app: { name: app.getName(), version: app.getVersion(), channel: app.isPackaged ? "packaged" : "development", packaged: app.isPackaged },
    runtime: [
      { id: "electron", label: "Electron", version: process.versions.electron || "Unavailable", status: process.versions.electron ? "available" : "unknown" },
      { id: "chromium", label: "Chromium", version: process.versions.chrome || "Unavailable", status: process.versions.chrome ? "available" : "unknown" },
      { id: "node", label: "Node.js", version: process.versions.node, status: "available" },
      { id: "v8", label: "V8", version: process.versions.v8, status: "available" },
      { id: "rastercue-cpu", label: "Rastercue NCNN CPU", version: cpuHash ? cpuHash.slice(0, 12) : "Unavailable", status: cpuHash ? "available" : "unavailable", detail: cpuHash || undefined },
    ],
    engine: { label: "Original Upscayl NCNN Vulkan compatibility engine", path: originalExecPath, sha256: engineHash, status: engineHash ? "available" : "unavailable", contract: "Protected legacy CLI arguments; Vulkan inference only." },
    models: { bundled: Object.keys(modelState).length, available: Object.values(modelState).filter(Boolean).length },
    locations: { userData: app.getPath("userData"), logs: app.getPath("logs"), models: modelsPath },
  };
  softwareCache = { at: Date.now(), value };
  return value;
}

export function registerRastercueHardware(trusted: (event: Electron.IpcMainInvokeEvent) => boolean): void {
  const handle = (channel: string, action: (refresh: boolean) => Promise<unknown>) => ipcMain.handle(channel, (event, options?: { refresh?: boolean }) => {
    if (!trusted(event)) throw new Error("Untrusted application request.");
    return action(options?.refresh === true);
  });
  handle("rastercue-hardware:detect", detectHardware);
  handle("rastercue-hardware:software", softwareInventory);
  ipcMain.handle("rastercue-hardware:select-backend", async (event, backendId: ComputeBackendId) => {
    if (!trusted(event)) throw new Error("Untrusted application request.");
    if (!["original-vulkan", "cpu"].includes(backendId)) throw new Error("Unsupported compute backend.");
    if (backendId === "cpu" && (await probeCpuEngine()).state !== "available") throw new Error("The genuine CPU backend did not pass its local runtime probe. No job was started.");
    setComputeBackend(backendId);
    return { backendId };
  });
}
