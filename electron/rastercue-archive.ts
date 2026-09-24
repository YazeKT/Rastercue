import { BrowserWindow, dialog } from "electron";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import type { RastercueJob } from "../common/rastercue-types";

// Kept behind a tiny adapter so archive semantics stay testable and the
// processing engine remains completely untouched.
const archiver = require("archiver") as (format: string, options: Record<string, unknown>) => any;
const yauzl = require("yauzl") as any;

export type ArchivePayload = {
  role: "source" | "output" | "thumbnail" | "diagnostic";
  archivePath: string;
  originalName: string;
  bytes: number;
  sha256: string;
};

export type RastercueArchiveManifest = {
  schema: "rastercue.archive";
  version: 1;
  createdAt: string;
  job: {
    id: string;
    kind: RastercueJob["kind"];
    model: string;
    scale: string;
    startedAt: string;
    endedAt?: string;
    settings: RastercueJob["settings"];
  };
  payloads: ArchivePayload[];
};

const MAX_ENTRIES = 10_000;
const MAX_EXPANDED_BYTES = 250 * 1024 * 1024 * 1024;
const SAFE_ENTRY = /^(manifest\.json|files\/(source|output|thumbnail|diagnostic)\/[A-Za-z0-9._ -]+)$/;

async function digest(filePath: string) {
  const hash = crypto.createHash("sha256");
  const stat = await fs.promises.lstat(filePath);
  if (!stat.isFile() || stat.isSymbolicLink()) throw new Error("Archive payload must be a regular file.");
  await new Promise<void>((resolve, reject) => {
    const stream = fs.createReadStream(filePath);
    stream.on("data", chunk => hash.update(chunk));
    stream.on("error", reject);
    stream.on("end", resolve);
  });
  return { bytes: stat.size, sha256: hash.digest("hex") };
}

function safeName(value: string) {
  return path.basename(value).replace(/[^A-Za-z0-9._ -]/g, "_").slice(0, 180) || "image";
}

export async function createRastercueArchive(job: RastercueJob, target: string): Promise<RastercueArchiveManifest> {
  if (job.status !== "completed") throw new Error("Only completed jobs can be archived.");
  if (!target.toLowerCase().endsWith(".rastercue")) target += ".rastercue";
  if (fs.existsSync(target)) throw new Error("The archive already exists. Choose a new filename.");
  const files: Array<{ sourcePath: string; payload: ArchivePayload }> = [];
  for (const file of job.files) {
    for (const [role, item] of [["source", file.source], ["output", file.output]] as const) {
      if (!item || item.missing || !fs.existsSync(item.path)) throw new Error(`The ${role} file is missing and cannot be archived.`);
      const identity = await digest(item.path);
      const archivePath = `files/${role}/${file.id}-${safeName(item.path)}`;
      files.push({ sourcePath: item.path, payload: { role, archivePath, originalName: path.basename(item.path), ...identity } });
    }
  }
  const manifest: RastercueArchiveManifest = {
    schema: "rastercue.archive",
    version: 1,
    createdAt: new Date().toISOString(),
    job: { id: job.id, kind: job.kind, model: job.model, scale: job.scale, startedAt: job.startedAt, endedAt: job.endedAt, settings: job.settings },
    payloads: files.map(file => file.payload),
  };
  await fs.promises.mkdir(path.dirname(target), { recursive: true });
  const temporary = `${target}.partial`;
  const output = fs.createWriteStream(temporary, { flags: "wx" });
  const archive = archiver("zip", { store: true, forceZip64: true });
  const completion = new Promise<void>((resolve, reject) => {
    output.once("close", resolve);
    output.once("error", reject);
    archive.once("error", reject);
  });
  archive.pipe(output);
  archive.append(JSON.stringify(manifest, null, 2), { name: "manifest.json" });
  for (const file of files) archive.file(file.sourcePath, { name: file.payload.archivePath });
  try {
    await archive.finalize();
    await completion;
    await fs.promises.rename(temporary, target);
    return manifest;
  } catch (error) {
    output.destroy();
    await fs.promises.unlink(temporary).catch(() => undefined);
    throw error;
  }
}

function openZip(filePath: string): Promise<any> {
  return new Promise((resolve, reject) => yauzl.open(filePath, { lazyEntries: true, decodeStrings: true, validateEntrySizes: true }, (error: Error | null, zip: any) => error ? reject(error) : resolve(zip)));
}

function readEntry(zip: any, entry: any, limit = 2 * 1024 * 1024): Promise<Buffer> {
  return new Promise((resolve, reject) => zip.openReadStream(entry, (error: Error | null, stream: NodeJS.ReadableStream) => {
    if (error) return reject(error);
    const chunks: Buffer[] = []; let size = 0;
    stream.on("data", (chunk: Buffer) => { size += chunk.length; if (size > limit) (stream as any).destroy(new Error("Archive entry exceeds its safe limit.")); else chunks.push(chunk); });
    stream.on("error", reject); stream.on("end", () => resolve(Buffer.concat(chunks)));
  }));
}

export async function inspectRastercueArchive(filePath: string): Promise<RastercueArchiveManifest> {
  const zip = await openZip(filePath);
  return new Promise((resolve, reject) => {
    let entries = 0; let expanded = 0; let settled = false;
    const fail = (error: unknown) => { if (!settled) { settled = true; zip.close(); reject(error); } };
    zip.once("error", fail);
    zip.on("entry", async (entry: any) => {
      try {
        entries += 1; expanded += Number(entry.uncompressedSize || 0);
        if (entries > MAX_ENTRIES || expanded > MAX_EXPANDED_BYTES) throw new Error("Archive exceeds Rastercue safety limits.");
        if (!SAFE_ENTRY.test(entry.fileName) || entry.fileName.includes("..") || path.isAbsolute(entry.fileName)) throw new Error("Archive contains an unsafe path.");
        const unixMode = (entry.externalFileAttributes >>> 16) & 0xffff;
        if ((unixMode & 0o170000) === 0o120000) throw new Error("Archive contains a symbolic link.");
        if (entry.fileName !== "manifest.json") { zip.readEntry(); return; }
        const data = JSON.parse((await readEntry(zip, entry)).toString("utf8"));
        if (data?.schema !== "rastercue.archive" || data.version !== 1 || !Array.isArray(data.payloads)) throw new Error("Unsupported Rastercue archive manifest.");
        if (!data.payloads.every((payload: ArchivePayload) => SAFE_ENTRY.test(payload.archivePath) && /^[a-f0-9]{64}$/.test(payload.sha256) && Number.isSafeInteger(payload.bytes) && payload.bytes >= 0)) throw new Error("Archive manifest is invalid.");
        settled = true; zip.close(); resolve(data);
      } catch (error) { fail(error); }
    });
    zip.once("end", () => fail(new Error("Rastercue archive manifest is missing.")));
    zip.readEntry();
  });
}

export async function restoreRastercueArchive(filePath: string, destination: string): Promise<{ manifest: RastercueArchiveManifest; restored: string[] }> {
  const manifest = await inspectRastercueArchive(filePath);
  const expected = new Map(manifest.payloads.map(payload => [payload.archivePath, payload]));
  const restored: string[] = [];
  const root = path.resolve(destination);
  await fs.promises.mkdir(root, { recursive: true });
  const zip = await openZip(filePath);
  await new Promise<void>((resolve, reject) => {
    let count = 0; let expanded = 0;
    const fail = async (error: unknown) => { zip.close(); for (const file of restored) await fs.promises.unlink(file).catch(() => undefined); reject(error); };
    zip.once("error", fail);
    zip.on("entry", async (entry: any) => {
      try {
        count += 1; expanded += Number(entry.uncompressedSize || 0);
        if (count > MAX_ENTRIES || expanded > MAX_EXPANDED_BYTES) throw new Error("Archive exceeds Rastercue safety limits.");
        if (entry.fileName === "manifest.json") { zip.readEntry(); return; }
        const payload = expected.get(entry.fileName);
        if (!payload || entry.uncompressedSize !== payload.bytes) throw new Error("Archive payload does not match its manifest.");
        const roleFolder = path.join(root, payload.role);
        await fs.promises.mkdir(roleFolder, { recursive: true });
        const target = path.resolve(roleFolder, safeName(payload.originalName));
        if (!target.startsWith(roleFolder + path.sep) || fs.existsSync(target)) throw new Error(`Restore would overwrite ${path.basename(target)}.`);
        await new Promise<void>((done, failed) => zip.openReadStream(entry, (error: Error | null, input: NodeJS.ReadableStream) => {
          if (error) return failed(error);
          const hash = crypto.createHash("sha256"); const output = fs.createWriteStream(target, { flags: "wx" });
          input.on("data", chunk => hash.update(chunk)); input.on("error", failed); output.on("error", failed);
          output.on("close", () => hash.digest("hex") === payload.sha256 ? done() : failed(new Error("Restored file checksum does not match the archive manifest.")));
          input.pipe(output);
        }));
        restored.push(target); zip.readEntry();
      } catch (error) { void fail(error); }
    });
    zip.once("end", resolve); zip.readEntry();
  });
  return { manifest, restored };
}

export async function chooseAndCreateArchive(win: BrowserWindow, job: RastercueJob) {
  const selected = await dialog.showSaveDialog(win, { title: "Archive Rastercue job", defaultPath: `Rastercue-${job.id.slice(0, 8)}.rastercue`, filters: [{ name: "Rastercue archive", extensions: ["rastercue"] }] });
  if (selected.canceled || !selected.filePath) return null;
  return { path: selected.filePath, manifest: await createRastercueArchive(job, selected.filePath) };
}

export async function chooseAndRestoreArchive(win: BrowserWindow) {
  const selected = await dialog.showOpenDialog(win, { title: "Choose a Rastercue archive", properties: ["openFile"], filters: [{ name: "Rastercue archive", extensions: ["rastercue"] }] });
  if (selected.canceled) return null;
  const destination = await dialog.showOpenDialog(win, { title: "Choose an empty restore folder", properties: ["openDirectory", "createDirectory"] });
  if (destination.canceled) return null;
  return restoreRastercueArchive(selected.filePaths[0], destination.filePaths[0]);
}
