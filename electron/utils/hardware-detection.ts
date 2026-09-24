import os from "os";
import { Availability, ComputeBackendAvailability, DisplayAdapter, EngineDevice, HardwareVendor } from "../../common/hardware-types";

export function hardwareVendor(value: string): HardwareVendor {
  const text = value.toLowerCase();
  if (/\bintel\b|8086/.test(text)) return "intel";
  if (/\bamd\b|advanced micro devices|radeon|1002/.test(text)) return "amd";
  if (/\bnvidia\b|10de|geforce|quadro/.test(text)) return "nvidia";
  if (/\bapple\b/.test(text)) return "apple";
  if (/\bmicrosoft\b|1414/.test(text)) return "microsoft";
  return "unknown";
}

const finiteNumber = (value: unknown): number | null => {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
};

export function parseWindowsAdapters(output: string): DisplayAdapter[] {
  if (!output.trim()) return [];
  try {
    const decoded = JSON.parse(output.replace(/^\uFEFF/, ""));
    const rows = Array.isArray(decoded) ? decoded : [decoded];
    return rows.filter(Boolean).map((row: any, index: number) => ({
      id: row.PNPDeviceID || `windows-adapter-${index}`,
      name: String(row.Name || "Unknown display adapter"),
      vendor: hardwareVendor(`${row.Name || ""} ${row.PNPDeviceID || ""}`),
      driverVersion: row.DriverVersion ? String(row.DriverVersion) : null,
      memoryBytes: finiteNumber(row.AdapterRAM),
      pnpDeviceId: row.PNPDeviceID ? String(row.PNPDeviceID) : null,
      active: row.Status ? String(row.Status).toLowerCase() === "ok" : null,
      source: "windows-cim" as const,
    }));
  } catch { return []; }
}

export function parseLspciAdapters(output: string): DisplayAdapter[] {
  return output.split(/\r?\n/).filter(line => /vga compatible controller|3d controller|display controller/i.test(line)).map((line, index) => ({
    id: `lspci-${index}`,
    name: line.replace(/^.*?(VGA compatible controller|3D controller|Display controller)\s*:?\s*/i, "").replace(/\s+\[[0-9a-f]{4}:[0-9a-f]{4}]$/i, "").trim() || "Unknown display adapter",
    vendor: hardwareVendor(line), driverVersion: null, memoryBytes: null, pnpDeviceId: null, active: null, source: "lspci" as const,
  }));
}

export function parseEngineProbeOutput(output: string): EngineDevice[] {
  const devices = new Map<string, EngineDevice>();
  for (const match of output.matchAll(/^\[(\d+)\s+([^\]]+)]\s+(.+)$/gm)) {
    const [, id, name, detail] = match;
    const current = devices.get(id) || {
      id, name: name.trim(), vendor: hardwareVendor(name), api: "vulkan" as const,
      compatibility: "verified" as const, capabilities: { fp16: null, int8: null, subgroupSize: null },
    };
    const fp = detail.match(/fp16-p\/s\/a=([^\s]+)/);
    const int8 = detail.match(/int8-p\/s\/a=([^\s]+)/);
    const subgroup = detail.match(/subgroup=(\d+)/);
    if (fp) current.capabilities.fp16 = fp[1];
    if (int8) current.capabilities.int8 = int8[1];
    if (subgroup) current.capabilities.subgroupSize = Number(subgroup[1]);
    devices.set(id, current);
  }
  return [...devices.values()].sort((a, b) => Number(a.id) - Number(b.id));
}

export function electronAdapters(gpuInfo: any): DisplayAdapter[] {
  const devices = Array.isArray(gpuInfo?.gpuDevice) ? gpuInfo.gpuDevice : [];
  return devices.map((device: any, index: number) => {
    const identity = `${device.vendorString || ""} ${device.deviceString || ""} ${device.vendorId || ""}`;
    return {
      id: `electron-${device.vendorId ?? "unknown"}-${device.deviceId ?? index}`,
      name: String(device.deviceString || device.vendorString || "Unknown display adapter"),
      vendor: hardwareVendor(identity), driverVersion: device.driverVersion ? String(device.driverVersion) : null,
      memoryBytes: null, pnpDeviceId: null, active: device.active === undefined ? null : Boolean(device.active), source: "electron" as const,
    };
  });
}

export function dedupeAdapters(primary: DisplayAdapter[], fallback: DisplayAdapter[]): DisplayAdapter[] {
  if (!primary.length) return fallback;
  const names = new Set(primary.map(item => item.name.toLowerCase()));
  return [...primary, ...fallback.filter(item => !names.has(item.name.toLowerCase()))];
}

export function computeBackends(engineState: Availability, engineReason: string, devices: EngineDevice[], cpuState: Availability = "unavailable", cpuReason = "No genuine CPU inference runtime passed its local probe."): ComputeBackendAvailability[] {
  return [
    { id: "original-vulkan", label: "Original Upscayl Vulkan", kind: "vulkan", availability: engineState, deviceIds: devices.map(device => device.id), reason: engineReason, compatibilityBackend: true },
    { id: "rastercue-vulkan", label: "Rastercue refreshed Vulkan", kind: "vulkan", availability: "unavailable", deviceIds: [], reason: "No separate refreshed Vulkan engine has been bundled or verified in this build.", compatibilityBackend: false },
    { id: "cpu", label: "Rastercue CPU", kind: "cpu", availability: cpuState, deviceIds: cpuState === "available" ? ["cpu"] : [], reason: cpuReason, compatibilityBackend: false },
  ];
}

export function parsePhysicalCoreCount(value: string): number | null {
  const parsed = Number(value.trim());
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export function cpuSummary(physicalCores: number | null = null) {
  const cpus = os.cpus();
  return {
    model: cpus[0]?.model?.trim() || "Unknown CPU",
    logicalCores: cpus.length,
    physicalCores,
    architecture: os.arch(),
  };
}
