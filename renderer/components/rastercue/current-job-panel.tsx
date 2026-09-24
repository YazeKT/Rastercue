import { useEffect, useState } from "react";
import { useAtom } from "jotai";
import { desiredOutputNameAtom, rastercueJobAtom } from "@/atoms/rastercue-job-atom";
import InfoPopover from "@/components/ui/info-popover";
import ThumbnailImage from "./thumbnail-image";

export const readableBytes = (bytes: number | null | undefined) => bytes == null ? "Not available yet" : bytes < 1024 ? `${bytes} B` : bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
const basename = (path?: string) => path?.split(/[\\/]/).pop() || "Image";
const extension = (path?: string) => path?.split(".").pop()?.toUpperCase() || "Unknown";
const dimensions = (width?: number | null, height?: number | null) => width && height ? `${width.toLocaleString()} × ${height.toLocaleString()} px` : "Not available yet";
export default function CurrentJobPanel() {
  const [job, setJob] = useAtom(rastercueJobAtom);
  const [name, setName] = useAtom(desiredOutputNameAtom);
  const [error, setError] = useState(""), [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!window.rastercue) return;
    window.rastercue.current().then(setJob).catch((reason) => setError(String(reason)));
    const unsubscribe = window.rastercue.onChanged((snapshot) => setJob(snapshot.current));
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => { unsubscribe(); clearInterval(timer); };
  }, [setJob]);
  const file = job?.files[0];
  const sourceBytes = job?.files.reduce((sum, item) => sum + (item.source.bytes || 0), 0);
  const outputBytes = job?.files.filter((item) => item.output?.bytes != null).reduce((sum, item) => sum + (item.output!.bytes || 0), 0);
  async function rename() {
    if (!job || !file?.output) return;
    try { const result = await window.rastercue.rename(job.id, file.id, name); setJob(result.current); setName(""); setError(""); }
    catch (reason) { setError(String(reason)); }
  }
  return <section className="current-job" aria-label="Current upscale job">
    <div className="field-heading"><h3>Current image</h3><div className="compact-actions"><span className={`job-status status-${job?.status || "ready"}`}>{job?.status || "Ready"}</span><InfoPopover label="Current image details">Sizes and previews come from the local job record. Rastercue verifies completed outputs before showing them here.</InfoPopover></div></div>
    {!job ? <p className="setting-example">Choose an image and start an upscale. Preview, dimensions and progress will appear here.</p> : <>
      <p className="current-job-name" title={file?.source.path}>{job.kind === "batch" ? `${job.files.length} images · Batch job` : basename(file?.source.path)}</p>
      <div className="job-thumbnails" aria-label="Original and output previews">
        <figure><div className="job-thumbnail">{file && !file.source.missing ? <ThumbnailImage jobId={job.id} fileId={file.id} kind="source" available={file.sourceThumbnail || file.thumbnail} alt="Original image thumbnail" fallback="Preview unavailable"/> : <span>Unavailable</span>}</div><figcaption>Original</figcaption></figure>
        <figure><div className="job-thumbnail">{file?.output && !file.output.missing ? <ThumbnailImage jobId={job.id} fileId={file.id} kind="output" available={file.outputThumbnail || file.thumbnail} alt="Upscaled output thumbnail" fallback="Preview unavailable"/> : <span>{job.status === "running" ? "Processing…" : "No output"}</span>}</div><figcaption>Output</figcaption></figure>
      </div>
      <dl className="job-details">
        <div><dt>Model</dt><dd title={job.model}>{job.model}</dd></div>
        <div><dt>Backend</dt><dd>{job.settings.backendId === "cpu" ? "Rastercue CPU" : job.settings.gpuId ? `Original Vulkan · device ${job.settings.gpuId}` : "Original Vulkan · automatic"}</dd></div>
        <div><dt>Target</dt><dd>{job.settings.useCustomWidth ? `${job.settings.customWidth}px wide` : `${job.scale}×${job.kind === "double" ? " · two passes" : ""}`}</dd></div>
        <div><dt>Phase</dt><dd title={job.progress}>{job.progress || "Starting…"}</dd></div>
        <div><dt>Elapsed</dt><dd>{Math.max(0, Math.round((job.durationMs ?? (now - Date.parse(job.startedAt))) / 1000))} seconds</dd></div>
      </dl>
      <div className="image-spec-grid">
        <section><h4>Original</h4><p>{dimensions(file?.source.width, file?.source.height)}</p><p>{readableBytes(sourceBytes || file?.source.bytes)} · {extension(file?.source.path)}</p></section>
        <section><h4>Output</h4><p>{dimensions(file?.output?.width, file?.output?.height)}</p><p>{outputBytes ? readableBytes(outputBytes) : "Pending"} · {file?.output ? extension(file.output.path) : "—"}</p></section>
      </div>
    </>}
    <label className="output-name"><span>Output filename</span><input value={name} placeholder="Example: campaign-hero" onChange={(event) => { setName(event.target.value); setError(""); }} onBlur={() => window.rastercue?.setDesiredName(name).catch((reason) => setError(String(reason)))} disabled={job?.status === "running"}/><small>Single images only. The source is never renamed.</small></label>
    {job?.status === "completed" && file?.output && job.kind !== "batch" && <button className="btn btn-sm w-full" disabled={!name.trim()} onClick={rename}>Rename completed output</button>}
    {!!job?.warnings.length && <p className="job-warning" title={job.warnings.join("\n")}>{job.warnings[job.warnings.length - 1]}</p>}
    {error && <p role="alert" className="text-error break-words" title={error}>{error}</p>}
  </section>;
}
