import { useEffect, useState } from "react";
import { useAtom } from "jotai";
import { desiredOutputNameAtom, rastercueJobAtom } from "@/atoms/rastercue-job-atom";

export const readableBytes = (bytes: number | null | undefined) => bytes == null ? "Not available yet" : bytes < 1024 ? `${bytes} B` : bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
export default function CurrentJobPanel() {
  const [job, setJob] = useAtom(rastercueJobAtom);
  const [name, setName] = useAtom(desiredOutputNameAtom);
  const [error, setError] = useState("");
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!window.rastercue) return;
    window.rastercue.current().then(setJob).catch(e => setError(String(e)));
    const unsubscribe = window.rastercue.onChanged(s => setJob(s.current));
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => { unsubscribe(); clearInterval(timer); };
  }, [setJob]);
  const file = job?.files[0];
  const sourceBytes = job?.files.reduce((sum, f) => sum + (f.source.bytes || 0), 0);
  const outputBytes = job?.files.filter(f => f.output?.bytes != null).reduce((sum, f) => sum + (f.output!.bytes || 0), 0);
  async function rename() {
    if (!job || !file?.output) return;
    try { const result = await window.rastercue.rename(job.id, file.id, name); setJob(result.current); setName(""); setError(""); }
    catch (e) { setError(String(e)); }
  }
  return <section className="space-y-3 text-xs" aria-label="Current upscale job">
    <div className="flex items-center justify-between"><h3 className="font-semibold text-sm">Current job</h3><span className="rounded bg-base-300 px-2 py-1 capitalize">{job?.status || "Ready"}</span></div>
    {!job ? <p className="opacity-65">Choose an image and start an upscale. Its sizes and progress will appear here.</p> : <>
      <p className="truncate font-medium" title={file?.source.path}>{job.kind === "batch" ? `${job.files.length} images · Batch job` : file?.source.path.split(/[\\/]/).pop() || "Loading file details…"}</p>
      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2">
        <dt className="opacity-60">Model</dt><dd className="truncate" title={job.model}>{job.model}</dd>
        <dt className="opacity-60">Scale</dt><dd>{job.settings.useCustomWidth ? `${job.settings.customWidth}px wide` : `${job.scale}×${job.kind === "double" ? " · two passes" : ""}`}</dd>
        <dt className="opacity-60">Progress</dt><dd className="truncate" title={job.progress}>{job.progress || "Starting…"}</dd>
        <dt className="opacity-60">Elapsed</dt><dd>{Math.max(0, Math.round((job.durationMs ?? (now - Date.parse(job.startedAt))) / 1000))} seconds</dd>
        <dt className="opacity-60">Before</dt><dd>{readableBytes(sourceBytes || file?.source.bytes)}{file?.source.width ? <span className="block opacity-60">{file.source.width} × {file.source.height}px</span> : null}</dd>
        <dt className="opacity-60">After</dt><dd>{outputBytes ? readableBytes(outputBytes) : "Not available yet"}{file?.output?.width ? <span className="block opacity-60">{file.output.width} × {file.output.height}px</span> : null}</dd>
      </dl>
      <p className="truncate opacity-65" title={file?.output?.path || job.destination}>{file?.output?.path || job.destination}</p>
    </>}
    <label className="block space-y-1"><span className="font-medium">Output filename</span><input className="input input-bordered input-sm w-full" value={name} placeholder="Example: campaign-hero" onChange={e => { setName(e.target.value); setError(""); }} onBlur={() => window.rastercue?.setDesiredName(name).catch(e => setError(String(e)))} disabled={job?.status === "running"} /><span className="block text-[11px] opacity-60">Single images only. The selected format stays unchanged; the source is never renamed.</span></label>
    {job?.status === "completed" && file?.output && job.kind !== "batch" && <button className="btn btn-sm w-full" disabled={!name.trim()} onClick={rename}>Rename completed output</button>}
    {job?.warnings.length > 0 && <p className="line-clamp-2 rounded bg-amber-400/10 p-2 text-amber-300" title={job.warnings.join("\n")}>{job.warnings[job.warnings.length - 1]}</p>}
    {error && <p role="alert" className="line-clamp-2 text-error break-words" title={error}>{error}</p>}
  </section>;
}
