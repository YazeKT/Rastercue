import { useEffect, useState } from "react";
import type { HardwareSnapshot } from "@common/hardware-types";
import type { ComputeBackendId } from "@common/hardware-types";

type Selection = { backendId: ComputeBackendId; deviceId: string };

export function ComputeDeviceSelect({ value, onChange }: { value: Selection; onChange: (value: Selection) => void }) {
  const [hardware, setHardware] = useState<HardwareSnapshot | null>(null);
  const [error, setError] = useState("");
  useEffect(() => { window.rastercueHardware?.detect().then(setHardware).catch(reason => setError(String(reason))); }, []);
  return <label className="form-control w-full gap-2">
    <span className="label-text font-medium">Compute device</span>
    <select className="select select-bordered select-sm w-full" value={value.backendId === "cpu" ? "cpu" : `original-vulkan:${value.deviceId}`} onChange={event => {
      if (event.target.value === "cpu") onChange({ backendId: "cpu", deviceId: "" });
      else onChange({ backendId: "original-vulkan", deviceId: event.target.value.split(":")[1] || "" });
    }}>
      <option value="original-vulkan:">Auto · original Vulkan compatibility</option>
      {(hardware?.engineDevices || []).map(device => <option key={device.id} value={`original-vulkan:${device.id}`}>Vulkan device {device.id} · {device.name}</option>)}
      <option value="cpu" disabled={hardware?.backends.find(backend => backend.id === "cpu")?.availability !== "available"}>CPU only{hardware?.backends.find(backend => backend.id === "cpu")?.availability === "available" ? " · verified local runtime" : " · unavailable"}</option>
    </select>
    <span className="text-[11px] opacity-65">No GPU brand is blocked. CPU mode is a separate native inference backend; Rastercue never changes backend or device silently.</span>
    {error ? <span role="alert" className="text-xs text-error">{error}</span> : null}
  </label>;
}
