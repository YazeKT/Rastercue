import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, CircleHelp, Cpu, HardDrive, MemoryStick, MonitorCog, RefreshCw, XCircle } from "lucide-react";
import type { Availability, HardwareSnapshot, SoftwareInventory } from "@common/hardware-types";

const bytes = (value: number | null | undefined) => value == null ? "Not reported" : `${(value / 1024 ** 3).toFixed(value >= 10 * 1024 ** 3 ? 0 : 1)} GB`;
const statusIcon = (status: Availability) => status === "available" ? <CheckCircle2 aria-hidden="true" className="h-4 w-4 text-success" /> : status === "unavailable" ? <XCircle aria-hidden="true" className="h-4 w-4 text-error" /> : <CircleHelp aria-hidden="true" className="h-4 w-4 text-warning" />;
const Field = ({ label, value, title }: { label: string; value: string; title?: string }) => <div className="min-w-0"><dt className="text-[11px] font-medium uppercase tracking-wide opacity-60">{label}</dt><dd className="mt-1 break-words text-sm" title={title}>{value}</dd></div>;

export default function HardwareSoftwarePanel({ initialView = "hardware" }: { initialView?: "hardware" | "software" }) {
  const [view, setView] = useState<"hardware" | "software">(initialView);
  const [hardware, setHardware] = useState<HardwareSnapshot | null>(null);
  const [software, setSoftware] = useState<SoftwareInventory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = useCallback(async (refresh = false) => {
    setLoading(true); setError("");
    try {
      if (!window.rastercueHardware) throw new Error("Hardware inventory is unavailable in this build.");
      const [nextHardware, nextSoftware] = await Promise.all([window.rastercueHardware.detect({ refresh }), window.rastercueHardware.software({ refresh })]);
      setHardware(nextHardware); setSoftware(nextSoftware);
    } catch (reason) { setError(reason instanceof Error ? reason.message : String(reason)); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  return <section className="space-y-4" aria-labelledby="hardware-software-title">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div><h2 id="hardware-software-title" className="text-lg font-semibold">Hardware & software</h2><p className="mt-1 max-w-2xl text-sm opacity-75">Detected components and separately verified compute support. A detected GPU is not presented as compatible until the native engine initializes it.</p></div>
      <button className="btn btn-sm min-h-11 gap-2 focus-visible:ring-2 focus-visible:ring-primary" disabled={loading} onClick={() => void load(true)}><RefreshCw aria-hidden="true" className={`h-4 w-4 ${loading ? "motion-safe:animate-spin" : ""}`} />Re-detect</button>
    </div>
    <div className="compact-tabs" role="tablist" aria-label="Inventory view">
      <button role="tab" aria-selected={view === "hardware"} className={`${view === "hardware" ? "active " : ""}focus-visible:ring-2 focus-visible:ring-primary`} onClick={() => setView("hardware")}>Hardware</button>
      <button role="tab" aria-selected={view === "software"} className={`${view === "software" ? "active " : ""}focus-visible:ring-2 focus-visible:ring-primary`} onClick={() => setView("software")}>Software</button>
    </div>
    {loading && !hardware ? <div role="status" className="rounded-lg border border-base-content/15 bg-base-200 p-5">Detecting local hardware and testing the original engine…</div> : null}
    {error ? <p role="alert" className="rounded-lg border border-error/40 bg-error/10 p-4 text-sm text-error">{error}</p> : null}
    {view === "hardware" && hardware ? <div className="grid gap-4 lg:grid-cols-2">
      <article className="rounded-lg border border-base-content/15 bg-base-200 p-4"><div className="mb-4 flex items-center gap-2"><Cpu aria-hidden="true" className="h-5 w-5 text-primary"/><h3 className="font-semibold">System</h3></div><dl className="grid grid-cols-2 gap-4"><Field label="Processor" value={hardware.cpu.model}/><Field label="Cores / threads" value={`${hardware.cpu.physicalCores ?? "Not reported"} / ${hardware.cpu.logicalCores}`}/><Field label="Memory" value={bytes(hardware.memory.totalBytes)}/><Field label="Available now" value={bytes(hardware.memory.freeBytes)}/><Field label="Platform" value={`${hardware.platform} ${hardware.release}`}/><Field label="Architecture" value={hardware.cpu.architecture}/></dl></article>
      <article className="rounded-lg border border-base-content/15 bg-base-200 p-4"><div className="mb-4 flex items-center gap-2"><MonitorCog aria-hidden="true" className="h-5 w-5 text-primary"/><h3 className="font-semibold">Detected display hardware</h3></div><div className="space-y-3">{hardware.displayAdapters.length ? hardware.displayAdapters.map(adapter => <div key={adapter.id} className="rounded border border-base-content/10 bg-base-300/50 p-3"><div className="flex items-start justify-between gap-2"><p className="font-medium">{adapter.name}</p><span className="badge badge-sm capitalize">{adapter.vendor}</span></div><p className="mt-1 text-xs opacity-70">Driver {adapter.driverVersion || "not reported"} · Memory {bytes(adapter.memoryBytes)} · Source {adapter.source}</p></div>) : <p className="text-sm opacity-70">No display adapters were reported.</p>}</div></article>
      <article className="rounded-lg border border-base-content/15 bg-base-200 p-4 lg:col-span-2"><div className="mb-4 flex items-center gap-2"><HardDrive aria-hidden="true" className="h-5 w-5 text-primary"/><h3 className="font-semibold">Compute backends</h3></div><div className="grid gap-3 md:grid-cols-3">{hardware.backends.map(backend => <div key={backend.id} className="rounded border border-base-content/10 bg-base-300/50 p-3"><div className="flex items-center gap-2">{statusIcon(backend.availability)}<h4 className="font-medium">{backend.label}</h4></div><p className="mt-2 text-xs leading-5 opacity-75">{backend.reason}</p><p className="mt-2 text-[11px] uppercase tracking-wide opacity-60">{backend.availability}{backend.compatibilityBackend ? " · compatibility" : ""}</p></div>)}</div>
        <div className="mt-4 rounded border border-primary/30 bg-primary/10 p-3 text-sm"><strong>Recommendation:</strong> {hardware.recommendation.reason}<p className="mt-1 text-xs opacity-70">Actual device: {hardware.actualDeviceReason}</p></div>
        {hardware.engineDevices.length ? <div className="mt-4"><h4 className="text-sm font-semibold">Engine-verified Vulkan devices</h4><ul className="mt-2 grid gap-2 md:grid-cols-2">{hardware.engineDevices.map(device => <li key={device.id} className="rounded border border-success/30 p-3 text-sm"><span className="font-medium">Device {device.id}: {device.name}</span><span className="mt-1 block text-xs opacity-70">FP16 {device.capabilities.fp16 || "not reported"} · INT8 {device.capabilities.int8 || "not reported"} · subgroup {device.capabilities.subgroupSize || "not reported"}</span></li>)}</ul></div> : null}
      </article>
      {hardware.warnings.length ? <div className="rounded-lg border border-warning/40 bg-warning/10 p-4 text-sm lg:col-span-2"><h3 className="font-semibold">Detection notes</h3><ul className="mt-2 list-disc space-y-1 pl-5">{hardware.warnings.map(warning => <li key={warning}>{warning}</li>)}</ul></div> : null}
    </div> : null}
    {view === "software" && software ? <div className="grid gap-4 lg:grid-cols-2">
      <article className="rounded-lg border border-base-content/15 bg-base-200 p-4"><div className="mb-4 flex items-center gap-2"><MemoryStick aria-hidden="true" className="h-5 w-5 text-primary"/><h3 className="font-semibold">Application runtime</h3></div><dl className="grid grid-cols-2 gap-4"><Field label="Application" value={`${software.app.name} ${software.app.version}`}/><Field label="Channel" value={software.app.channel}/>{software.runtime.map(component => <Field key={component.id} label={component.label} value={component.version}/>)}</dl></article>
      <article className="rounded-lg border border-base-content/15 bg-base-200 p-4"><div className="mb-4 flex items-center gap-2">{statusIcon(software.engine.status)}<h3 className="font-semibold">Protected engine</h3></div><dl className="space-y-4"><Field label="Component" value={software.engine.label}/><Field label="Contract" value={software.engine.contract}/><Field label="SHA-256" value={software.engine.sha256 || "Unavailable"}/><Field label="Models" value={`${software.models.available} of ${software.models.bundled} known model pairs available`}/></dl></article>
      <article className="rounded-lg border border-base-content/15 bg-base-200 p-4 lg:col-span-2"><h3 className="mb-4 font-semibold">Local locations</h3><dl className="grid gap-4 md:grid-cols-3"><Field label="Application data" value={software.locations.userData} title={software.locations.userData}/><Field label="Logs" value={software.locations.logs} title={software.locations.logs}/><Field label="Models" value={software.locations.models} title={software.locations.models}/></dl></article>
    </div> : null}
  </section>;
}
