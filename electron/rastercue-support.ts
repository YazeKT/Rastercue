import { app, BrowserWindow, dialog } from "electron";
import fs from "fs";
import os from "os";
import path from "path";
import type { RastercueJob } from "../common/rastercue-types";
import { redactDiagnosticText } from "../common/rastercue-errors";

const archiver = require("archiver") as (format: string, options: Record<string, unknown>) => any;

function redactedJob(job?: RastercueJob) {
  if (!job) return null;
  const privateKeys = /(?:path|folder|destination|filename|name)$/i;
  return {
    id: job.id,
    kind: job.kind,
    status: job.status,
    startedAt: job.startedAt,
    endedAt: job.endedAt,
    durationMs: job.durationMs,
    model: job.model,
    scale: job.scale,
    progress: redactDiagnosticText(job.progress),
    settings: Object.fromEntries(Object.entries(job.settings).filter(([key]) => !privateKeys.test(key))),
    files: job.files.map(file => ({
      source: { bytes: file.source.bytes, width: file.source.width, height: file.source.height, missing: file.source.missing },
      output: file.output ? { bytes: file.output.bytes, width: file.output.width, height: file.output.height, missing: file.output.missing } : null,
    })),
    warnings: job.warnings.map(redactDiagnosticText),
  };
}

export async function createSupportBundle(win: BrowserWindow, job?: RastercueJob): Promise<string | null> {
  const selected = await dialog.showSaveDialog(win, {
    title: "Create redacted Rastercue support bundle",
    defaultPath: `Rastercue-support-${new Date().toISOString().slice(0, 10)}.zip`,
    filters: [{ name: "ZIP archive", extensions: ["zip"] }],
  });
  if (selected.canceled || !selected.filePath) return null;
  if (fs.existsSync(selected.filePath)) throw new Error("The support bundle already exists. Choose a new filename.");
  const report = {
    schema: "rastercue.support",
    version: 1,
    createdAt: new Date().toISOString(),
    privacy: "No images, filenames, absolute paths, usernames, clipboard data, or full command arguments are included.",
    application: { name: "Rastercue", version: app.getVersion(), packaged: app.isPackaged, platform: process.platform, architecture: process.arch },
    hardware: { cpu: os.cpus()[0]?.model || "Unknown", logicalProcessors: os.cpus().length, memoryBytes: os.totalmem(), osRelease: os.release() },
    job: redactedJob(job),
    contact: "kirstentrimaley@gmail.com",
  };
  const temporary = `${selected.filePath}.partial`;
  const output = fs.createWriteStream(temporary, { flags: "wx" });
  const archive = archiver("zip", { zlib: { level: 9 } });
  const completion = new Promise<void>((resolve, reject) => {
    output.once("close", resolve); output.once("error", reject); archive.once("error", reject);
  });
  archive.pipe(output);
  archive.append(JSON.stringify(report, null, 2), { name: "report.json" });
  archive.append("Review report.json before sharing. Send only when you choose to email support or attach it to a GitHub issue.\n", { name: "README.txt" });
  try {
    await archive.finalize(); await completion; await fs.promises.rename(temporary, selected.filePath);
    return selected.filePath;
  } catch (error) {
    output.destroy(); await fs.promises.unlink(temporary).catch(() => undefined); throw error;
  }
}
