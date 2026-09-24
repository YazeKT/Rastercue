import { app, BrowserWindow, dialog, ipcMain, shell } from "electron";
import sharp from "sharp";
import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { pathToFileURL } from "url";
import { ELECTRON_COMMANDS as C } from "../common/electron-commands";
import { HistoryFile, HistoryFileInfo, HistorySnapshot, RastercueJob, JobSettings } from "../common/rastercue-types";
import { getComputeBackend } from "./utils/spawn-upscayl";
import { chooseAndCreateArchive, chooseAndRestoreArchive } from "./rastercue-archive";
import { createSupportBundle } from "./rastercue-support";

const IMAGE = /\.(png|jpe?g|jfif|webp|avif|tiff?)$/i;
const decode = (value: string) => path.resolve(decodeURIComponent(value));
export function validateOutputName(name: unknown): string {
  if (typeof name !== "string") throw new Error("Enter an output filename.");
  const clean = name.trim();
  if (!clean || clean.length > 180 || /[<>:"/\\|?*\x00-\x1f]/.test(clean) || /[. ]$/.test(clean) || /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(clean))
    throw new Error("Use a filename without reserved characters, trailing dots, or device names (maximum 180 characters).");
  return clean;
}

let active: RastercueJob | null = null;
let finalising = false;
export const isRastercueJobActive = () => active?.status === "running" || finalising;

/** Additive observer: engine commands and their completion payloads remain unchanged. */
export function registerRastercueHistory(win: BrowserWindow): void {
  let folder = path.join(app.getPath("userData"), "history");
  const pointer = path.join(app.getPath("userData"), "history-location.json");
  let records: RastercueJob[] = [];
  let desiredName = "";
  let persistenceError: string | undefined;
  let queue = Promise.resolve();
  let pendingDetails = Promise.resolve();
  let finishing = false;
  const send = win.webContents.send.bind(win.webContents);
  try {
    if (fs.existsSync(pointer)) {
      const selected = JSON.parse(fs.readFileSync(pointer, "utf8")).folder;
      if (typeof selected === "string" && path.isAbsolute(selected) && path.basename(selected) === "Rastercue-history") folder = selected;
    }
    fs.mkdirSync(folder, { recursive: true });
    let loaded = false;
    for (const name of ["history.json", "history.backup.json"]) {
      try {
        if (!fs.existsSync(path.join(folder, name))) continue;
        const data = JSON.parse(fs.readFileSync(path.join(folder, name), "utf8"));
        if (data.version !== 1 || !Array.isArray(data.records)) throw new Error("Unsupported history file");
        records = data.records.filter((r: RastercueJob) => /^[a-f0-9-]{36}$/.test(r.id) && Array.isArray(r.files) && Array.isArray(r.warnings) && typeof r.destination === "string" && path.isAbsolute(r.destination) && r.files.every(f => /^[a-f0-9-]{36}$/.test(f.id) && typeof f.source?.path === "string" && path.isAbsolute(f.source.path) && (!f.output || (typeof f.output.path === "string" && path.isAbsolute(f.output.path)))));
        loaded = true; break;
      } catch { persistenceError = "History could not be read; attempting the recoverable backup."; }
    }
    if (loaded) records.forEach(r => {
      if (r.status === "running") { r.status = "interrupted"; r.endedAt = new Date().toISOString(); r.durationMs = Date.now() - Date.parse(r.startedAt); r.warnings.push("Application closed before a completion event was received."); }
      r.files.forEach(f => {
        const legacy = path.join(folder, "thumbnails", `${r.id}-${f.id}.png`);
        const source = path.join(folder, "thumbnails", `${r.id}-${f.id}-source.png`);
        const output = path.join(folder, "thumbnails", `${r.id}-${f.id}-output.png`);
        f.thumbnail = fs.existsSync(legacy) ? pathToFileURL(legacy).href : undefined;
        f.sourceThumbnail = fs.existsSync(source) ? pathToFileURL(source).href : undefined;
        f.outputThumbnail = fs.existsSync(output) ? pathToFileURL(output).href : f.thumbnail;
      });
    });
  } catch (error) { persistenceError = `History unavailable: ${String(error)}`; }

  const snapshot = (): HistorySnapshot => ({ version: 1, folder, records, current: active || records[0] || null, persistenceError });
  const notify = () => { if (!win.isDestroyed()) send("rastercue:changed", snapshot()); };
  let progressTimer: ReturnType<typeof setTimeout> | undefined;
  const notifyProgress = () => {
    if (progressTimer) return;
    progressTimer = setTimeout(() => { progressTimer = undefined; notify(); }, 200);
  };
  win.once('closed', () => { if (progressTimer) clearTimeout(progressTimer); });
  const persist = () => {
    const targetFolder = folder;
    const data = JSON.stringify({ version: 1, records }, null, 2);
    queue = queue.then(async () => {
      try {
        await fs.promises.mkdir(targetFolder, { recursive: true });
        const target = path.join(targetFolder, "history.json");
        const temporary = path.join(targetFolder, "history.tmp.json");
        await fs.promises.writeFile(temporary, data, "utf8");
        if (fs.existsSync(target)) await fs.promises.copyFile(target, path.join(targetFolder, "history.backup.json"));
        await fs.promises.rename(temporary, target);
        persistenceError = undefined;
      } catch (error) { persistenceError = `Could not save history: ${String(error)}. Outputs remain intact.`; notify(); }
    });
    return queue;
  };
  void persist();

  async function info(filePath: string): Promise<HistoryFileInfo> {
    const result: HistoryFileInfo = { path: filePath, bytes: null, width: null, height: null, missing: true };
    try {
      const stat = await fs.promises.stat(filePath);
      if (!stat.isFile()) return result;
      result.bytes = stat.size; result.missing = false;
      // Read headers asynchronously, never decode a full designer image on
      // Electron's main thread (which also receives Stop).
      const size = await sharp(filePath).metadata();
      result.width = size.width ?? null; result.height = size.height ?? null;
    } catch { /* Missing and unsupported files are honest nulls. */ }
    return result;
  }
  async function thumbnail(job: RastercueJob, file: HistoryFile) {
    try {
      const thumbnailFolder = path.join(folder, "thumbnails");
      await fs.promises.mkdir(thumbnailFolder, { recursive: true });
      const sourceTarget = path.join(thumbnailFolder, `${job.id}-${file.id}-source.png`);
      await sharp(file.source.path).resize({ width: 192, height: 192, fit: 'inside', withoutEnlargement: true }).png().toFile(sourceTarget);
      file.sourceThumbnail = pathToFileURL(sourceTarget).href;
      if (file.output?.path) {
        const outputTarget = path.join(thumbnailFolder, `${job.id}-${file.id}-output.png`);
        await sharp(file.output.path).resize({ width: 192, height: 192, fit: 'inside', withoutEnlargement: true }).png().toFile(outputTarget);
        file.outputThumbnail = pathToFileURL(outputTarget).href;
        file.thumbnail = file.outputThumbnail;
      } else file.thumbnail = file.sourceThumbnail;
    } catch { /* Thumbnail failure never makes processing fail. */ }
  }
  async function renameOutput(job: RastercueJob, file: HistoryFile, rawName: string, duringCompletion = false) {
    if ((job.status !== "completed" && !(duringCompletion && job.status === "running")) || !file.output) throw new Error("Only a completed, managed output can be renamed.");
    const output = file.output.path;
    const stat = await fs.promises.lstat(output);
    if (!stat.isFile() || stat.isSymbolicLink()) throw new Error("The managed output is missing or is a symbolic link.");
    const outputRoot = await fs.promises.realpath(path.dirname(output));
    const destinationRoot = await fs.promises.realpath(job.destination);
    if (outputRoot !== destinationRoot || path.resolve(output) === path.resolve(file.source.path)) throw new Error("This file is outside the managed output folder.");
    const extension = path.extname(output);
    let name = validateOutputName(rawName);
    if (name.toLowerCase().endsWith(extension.toLowerCase())) name = name.slice(0, -extension.length);
    name = validateOutputName(name);
    const target = path.join(outputRoot, name + extension);
    if (path.resolve(target) === path.resolve(output)) return;
    // link is an exclusive create: unlike rename it cannot silently overwrite a collision.
    await fs.promises.link(output, target);
    try { await fs.promises.unlink(output); }
    catch (error) { await fs.promises.unlink(target).catch(() => undefined); throw error; }
    file.output = await info(target);
  }

  function begin(event: Electron.IpcMainEvent, payload: any, kind: RastercueJob["kind"]) {
    if (event.sender !== win.webContents || event.senderFrame !== win.webContents.mainFrame || !payload || typeof payload.outputPath !== "string") return;
    if (active?.status === "running") { active.status = "interrupted"; active.warnings.push("A new engine submission replaced the active history observation."); }
    let source: string, destination: string;
    try { source = decode(kind === "batch" ? payload.batchFolderPath : payload.imagePath); destination = decode(payload.outputPath); } catch { return; }
    const settings: JobSettings = {};
    for (const [key, value] of Object.entries(payload)) if (value === null || ["string", "number", "boolean"].includes(typeof value)) settings[key] = value as JobSettings[string];
    settings.backendId = getComputeBackend();
    const job: RastercueJob = { id: randomUUID(), kind, status: "running", startedAt: new Date().toISOString(), model: String(payload.model), scale: String(payload.scale), destination, settings, files: [], warnings: [], progress: "Starting…", desiredName: kind === "single" ? desiredName || undefined : undefined };
    desiredName = ""; active = job; finishing = false; records.unshift(job);
    pendingDetails = (async () => {
      let inputs = [source];
      if (kind === "batch") {
        try { inputs = (await fs.promises.readdir(source)).filter(n => IMAGE.test(n)).map(n => path.join(source, n)); }
        catch (error) { job.warnings.push(`Source details unavailable: ${String(error)}`); inputs = []; }
      }
      for (const input of inputs) job.files.push({ id: randomUUID(), source: await info(input) });
      await persist(); notify();
    })();
    void persist(); notify();
  }
  async function complete(job: RastercueJob, outputPath: string) {
    await pendingDetails;
    job.progress = "Verifying output…";
    const output = path.resolve(outputPath);
    if (job.kind === "batch") {
      job.destination = output;
      const names = await fs.promises.readdir(output).catch(() => [] as string[]);
      for (const file of job.files) {
        const match = names.find(n => IMAGE.test(n) && path.parse(n).name === path.parse(file.source.path).name);
        if (match) file.output = await info(path.join(output, match));
        else job.warnings.push(`No matching output was found for ${path.basename(file.source.path)}.`);
      }
    } else if (job.files[0]) {
      // Do not register paths outside the destination emitted for this observed job.
      if (path.dirname(output) === job.destination && output !== job.files[0].source.path) job.files[0].output = await info(output);
      else job.warnings.push("Completion path was outside the managed destination; it was not registered for renaming.");
      if (job.desiredName && job.files[0].output) {
        try { await renameOutput(job, job.files[0], job.desiredName, true); }
        catch (error) { job.warnings.push(`Output completed, but renaming failed: ${String(error)}. The original output is preserved; retry from History.`); }
      }
    }
    const validOutputs = job.files.filter(file => file.output && !file.output.missing && file.output.width && file.output.height);
    if (!validOutputs.length || (job.kind !== "batch" && validOutputs.length !== job.files.length)) throw new Error("The engine completion event did not contain a readable verified output.");
    for (const file of job.files) await thumbnail(job, file);
    job.status = "completed"; job.endedAt = new Date().toISOString(); job.durationMs = Date.now() - Date.parse(job.startedAt); job.progress = "Completed";
    await persist(); if (active === job) active = null; finishing = false; finalising = false; notify();
  }
  function observe(channel: string, payload: any) {
    const job = active;
    if (!job || job.status !== "running") return;
    if ([C.UPSCAYL_DONE, C.DOUBLE_UPSCAYL_DONE, C.FOLDER_UPSCAYL_DONE].includes(channel as any) && typeof payload === "string" && !finishing) {
      finishing = true; finalising = true;
      void complete(job, payload).catch(error => { job.warnings.push(`Output verification failed: ${String(error)}`); job.status = "failed"; job.progress = "Failed during output verification"; job.endedAt = new Date().toISOString(); job.durationMs = Date.now() - Date.parse(job.startedAt); active = null; finishing = false; finalising = false; void persist(); notify(); });
    } else if (channel === C.UPSCAYL_ERROR) {
      job.status = "failed"; job.progress = "Failed"; job.endedAt = new Date().toISOString(); job.durationMs = Date.now() - Date.parse(job.startedAt); job.warnings.push(String(payload)); active = null; void persist(); notify();
    } else if ([C.UPSCAYL_WARNING, C.METADATA_ERROR].includes(channel as any)) { job.warnings.push(String(payload)); void persist(); notify(); }
    else if ([C.UPSCAYL_PROGRESS, C.DOUBLE_UPSCAYL_PROGRESS, C.FOLDER_UPSCAYL_PROGRESS].includes(channel as any)) {
      const text = String(payload); const percentages = text.match(/\d+(?:\.\d+)?%/g);
      job.progress = percentages ? percentages[percentages.length - 1] : text.trim().slice(-120); notifyProgress();
    } else if (channel === C.SCALING_AND_CONVERTING) { job.progress = "Finishing image conversion…"; notify(); }
  }
  win.webContents.send = ((channel: string, ...args: any[]) => { send(channel, ...args); try { observe(channel, args[0]); } catch { /* Observer cannot disrupt engine delivery. */ } }) as typeof win.webContents.send;
  ipcMain.prependListener(C.UPSCAYL, (e, p) => begin(e, p, "single"));
  ipcMain.prependListener(C.DOUBLE_UPSCAYL, (e, p) => begin(e, p, "double"));
  ipcMain.prependListener(C.FOLDER_UPSCAYL, (e, p) => begin(e, p, "batch"));
  ipcMain.prependListener(C.STOP, e => {
    if (e.sender !== win.webContents || e.senderFrame !== win.webContents.mainFrame || !active || finishing) return;
    active.status = "cancelled"; active.progress = "Cancelled"; active.endedAt = new Date().toISOString(); active.durationMs = Date.now() - Date.parse(active.startedAt); active = null; void persist(); notify();
  });

  const owned = (jobId: string, fileId?: string) => {
    const job = records.find(r => r.id === jobId);
    if (!job) throw new Error("History job not found.");
    const file = fileId ? job.files.find(f => f.id === fileId) : undefined;
    if (fileId && !file) throw new Error("Managed file not found.");
    return { job, file };
  };
  const handle = (name: string, fn: (...args: any[]) => any) => ipcMain.handle(`rastercue:${name}`, (event, ...args) => {
    if (event.sender.id !== win.webContents.id || event.senderFrame !== win.webContents.mainFrame) throw new Error("Untrusted history request.");
    return fn(...args);
  });
  handle("list", async () => {
    for (const job of records) for (const file of job.files) { file.source.missing = !fs.existsSync(file.source.path); if (file.output) file.output.missing = !fs.existsSync(file.output.path); }
    return snapshot();
  });
  handle("current", () => active || records[0] || null);
  handle("getThumbnail", async (jobId: string, fileId: string, kind: "source" | "output") => {
    owned(jobId, fileId);
    if (kind !== "source" && kind !== "output") throw new Error("Unsupported thumbnail kind.");
    const thumbnailFolder = path.join(folder, "thumbnails");
    const exact = path.join(thumbnailFolder, `${jobId}-${fileId}-${kind}.png`);
    const legacy = path.join(thumbnailFolder, `${jobId}-${fileId}.png`);
    const target = fs.existsSync(exact) ? exact : fs.existsSync(legacy) ? legacy : null;
    if (!target) return null;
    const relative = path.relative(thumbnailFolder, target);
    if (relative.startsWith("..") || path.isAbsolute(relative)) throw new Error("Thumbnail is outside managed history storage.");
    const stat = await fs.promises.lstat(target);
    if (!stat.isFile() || stat.isSymbolicLink() || stat.size > 2 * 1024 * 1024) throw new Error("Managed thumbnail is invalid.");
    const bytes = await fs.promises.readFile(target);
    return `data:image/png;base64,${bytes.toString("base64")}`;
  });
  handle("setDesiredName", (name: string) => { desiredName = name.trim() ? validateOutputName(name) : ""; });
  handle("rename", async (jobId: string, fileId: string, name: string) => { const { job, file } = owned(jobId, fileId); await renameOutput(job, file!, name); await persist(); notify(); return snapshot(); });
  handle("open", async (jobId: string, fileId: string) => { const { file } = owned(jobId, fileId); if (!file?.output || !fs.existsSync(file.output.path)) throw new Error("Output file is missing."); const error = await shell.openPath(file.output.path); if (error) throw new Error(error); });
  handle("openFolder", async (jobId?: string) => { const target = jobId ? owned(jobId).job.destination : folder; const error = await shell.openPath(target); if (error) throw new Error(error); });
  handle("openLogs", async () => { const error = await shell.openPath(app.getPath('logs')); if (error) throw new Error(error); });
  handle("archive", async (jobId: string) => {
    if (isRastercueJobActive() || finishing) throw new Error("Wait for the current job before creating an archive.");
    const { job } = owned(jobId);
    const result = await chooseAndCreateArchive(win, job);
    if (result) { job.archivePath = result.path; await persist(); notify(); }
    return snapshot();
  });
  handle("restoreArchive", async () => {
    if (isRastercueJobActive() || finishing) throw new Error("Wait for the current job before restoring an archive.");
    const result = await chooseAndRestoreArchive(win);
    return result ? { restored: result.restored } : null;
  });
  handle("createSupportBundle", async (jobId?: string) => createSupportBundle(win, jobId ? owned(jobId).job : active || records[0] || undefined));
  handle("relocate", async () => {
    if (isRastercueJobActive() || finishing) throw new Error("Wait for the current job before moving history.");
    const selected = await dialog.showOpenDialog(win, { title: "Choose a parent folder for Rastercue history", properties: ["openDirectory", "createDirectory"] });
    if (selected.canceled) return snapshot();
    const target = path.join(selected.filePaths[0], "Rastercue-history");
    if (path.resolve(target) === path.resolve(folder)) return snapshot();
    if (fs.existsSync(target)) throw new Error("Rastercue-history already exists here. Choose another folder; existing files will not be overwritten.");
    await queue; await fs.promises.mkdir(target);
    try {
      const sourceFolder = folder;
      const relocatedThumbnails: Array<{ file: HistoryFile; thumbnail: string }> = [];
      for (const name of ["history.json", "history.backup.json"]) if (fs.existsSync(path.join(sourceFolder, name))) await fs.promises.copyFile(path.join(sourceFolder, name), path.join(target, name));
      await fs.promises.mkdir(path.join(target, "thumbnails"));
      for (const job of records) for (const file of job.files) {
        for (const suffix of ["", "-source", "-output"]) {
          const filename = `${job.id}-${file.id}${suffix}.png`;
          if (fs.existsSync(path.join(sourceFolder, "thumbnails", filename))) {
            await fs.promises.copyFile(path.join(sourceFolder, "thumbnails", filename), path.join(target, "thumbnails", filename));
            const uri = pathToFileURL(path.join(target, "thumbnails", filename)).href;
            if (suffix === "-source") file.sourceThumbnail = uri;
            else if (suffix === "-output") file.outputThumbnail = uri;
            else relocatedThumbnails.push({ file, thumbnail: uri });
          }
        }
      }
      const temporary = pointer + ".tmp";
      await fs.promises.writeFile(temporary, JSON.stringify({ folder: target })); await fs.promises.rename(temporary, pointer);
      relocatedThumbnails.forEach(({ file, thumbnail }) => { file.thumbnail = thumbnail; });
      folder = target; await persist(); notify(); return snapshot();
    } catch (error) { throw new Error(`History relocation failed. The original history is preserved: ${String(error)}`); }
  });
  handle("clear", async (confirmed: boolean) => {
    if (confirmed !== true) throw new Error("Confirm clearing history first.");
    if (isRastercueJobActive() || finishing) throw new Error("Wait for the current job before clearing history.");
    const previous = records; records = []; await persist();
    if (persistenceError) { records = previous; throw new Error(persistenceError); }
    // Replace backup too: deleted records must not reappear during recovery.
    await fs.promises.copyFile(path.join(folder, "history.json"), path.join(folder, "history.backup.json"));
    for (const job of previous) for (const file of job.files) if (/^[a-f0-9-]+$/.test(job.id) && /^[a-f0-9-]+$/.test(file.id)) for (const suffix of ["", "-source", "-output"]) await fs.promises.unlink(path.join(folder, "thumbnails", `${job.id}-${file.id}${suffix}.png`)).catch(() => undefined);
    notify(); return snapshot();
  });
}
