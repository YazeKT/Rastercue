import React, { useEffect, useMemo, useState } from "react";
import RastercueLogo from "@/components/icons/rastercue-logo";
import { useAtomValue } from "jotai";
import { ELECTRON_COMMANDS } from "@common/electron-commands";
import useLogger from "../hooks/use-logger";
import { computeBackendAtom, gpuIdAtom, selectedModelIdAtom } from "@/atoms/user-settings-atom";
import { readPercent, studioPhase } from "@common/studio-progress";
import { CircleCheck, LoaderCircle } from "lucide-react";

const PHASES = [
  { id: "validate", title: "Validate", detail: "Check input and target" },
  { id: "device", title: "Device", detail: "Select the requested backend" },
  { id: "model", title: "Model", detail: "Load model files" },
  { id: "upscale", title: "Upscale", detail: "Create output pixels" },
  { id: "encode", title: "Encode", detail: "Convert, save, and write metadata" },
  { id: "verify", title: "Verify", detail: "Check output and history" },
] as const;

export default function ProgressBar({ progress, doubleUpscaylCounter, batchMode }: {
  progress: string; doubleUpscaylCounter: number; batchMode: boolean; resetImagePaths: () => void;
}) {
  const [batchProgress, setBatchProgress] = useState(0), [elapsed, setElapsed] = useState(0);
  const started = React.useRef(Date.now());
  const gpuId = useAtomValue(gpuIdAtom), model = useAtomValue(selectedModelIdAtom);
  const backendId = useAtomValue(computeBackendAtom);
  const logit = useLogger();
  useEffect(() => { if (progress.trim().replace(/\n/g, "").includes("Successful")) setBatchProgress((value) => value + 1); }, [progress]);
  useEffect(() => { const timer = setInterval(() => setElapsed(Math.round((Date.now() - started.current) / 1000)), 1000); return () => clearInterval(timer); }, []);
  const phase = studioPhase(progress), percent = readPercent(progress);
  const phaseIndex = PHASES.findIndex((item) => item.id === phase);
  const displayedProgress = useMemo(() => progress.trim() || "Starting…", [progress]);
  const stopHandler = () => { window.electron.send(ELECTRON_COMMANDS.STOP); logit("Stopping Upscayl"); };
  return <div className="progress-overlay" role="dialog" aria-modal="true" aria-labelledby="processing-title">
    <section className="progress-studio-card">
      <header className="progress-heading"><RastercueLogo className="spinner"/><div><p className="section-label">Rastercue processing</p><h2 id="processing-title">{batchMode ? `Upscaling batch${batchProgress ? ` · ${batchProgress} complete` : ""}` : "Upscaling image"}</h2></div><span className="elapsed-time">{elapsed}s</span></header>
      <ol className="phase-list" aria-label="Upscale phases">
        {PHASES.map((item, index) => { const complete = index < phaseIndex, active = index === phaseIndex; return <li key={item.id} className={active ? "active" : complete ? "complete" : ""} aria-current={active ? "step" : undefined}>
          <span className="phase-icon">{complete ? <CircleCheck aria-hidden="true"/> : active ? <LoaderCircle className="phase-spinner" aria-hidden="true"/> : index + 1}</span><span><strong>{item.title}</strong><small>{item.detail}</small></span>
        </li>; })}
      </ol>
      <div className="phase-progress" aria-live="polite"><div className="phase-progress-heading"><strong>{phase === "upscale" ? `Upscaling${doubleUpscaylCounter > 0 ? ` · Pass ${doubleUpscaylCounter}` : ""}` : PHASES[phaseIndex]?.title || "Preparing"}</strong><span>{percent == null ? "In progress" : `${percent.toFixed(percent % 1 ? 1 : 0)}%`}</span></div><div className="progress-track" role={percent == null ? undefined : "progressbar"} aria-valuemin={percent == null ? undefined : 0} aria-valuemax={percent == null ? undefined : 100} aria-valuenow={percent == null ? undefined : percent}><span className={percent == null ? "indeterminate" : ""} style={percent == null ? undefined : { transform: `scaleX(${percent / 100})` }}/></div><p title={displayedProgress}>{displayedProgress}</p></div>
      <dl className="progress-context"><div><dt>Model</dt><dd>{model}</dd></div><div><dt>Requested compute</dt><dd>{backendId === "cpu" ? "CPU only" : gpuId ? `Original Vulkan · device ${gpuId}` : "Original Vulkan · automatic device"}</dd></div></dl>
      <footer className="progress-actions"><p>Cancel asks the engine to stop. Already-written completed files are kept.</p><button onClick={stopHandler} className="btn btn-outline">Cancel job</button></footer>
    </section>
  </div>;
}
