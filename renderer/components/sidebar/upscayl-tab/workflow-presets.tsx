"use client";
import { useState } from "react";
import { useAtom, useAtomValue } from "jotai";
import {
  workflowPresetsAtom,
  WorkflowPreset,
} from "@/atoms/rastercue-workflows-atom";
import { customModelIdsAtom } from "@/atoms/models-list-atom";
import { MODELS } from "@common/models-list";
import useModelAvailability from '@/components/hooks/use-model-availability';
import {
  compressionAtom,
  copyMetadataAtom,
  customWidthAtom,
  doubleUpscaylAtom,
  gpuIdAtom,
  noImageProcessingAtom,
  overwriteAtom,
  saveImageAsAtom,
  scaleAtom,
  selectedModelIdAtom,
  tileSizeAtom,
  ttaModeAtom,
  useCustomWidthAtom,
} from "@/atoms/user-settings-atom";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function WorkflowPresets() {
  const [presets, setPresets] = useAtom(workflowPresetsAtom);
  const imported = useAtomValue(customModelIdsAtom);
  const [model, setModel] = useAtom(selectedModelIdAtom);
  const [scale, setScale] = useAtom(scaleAtom);
  const [format, setFormat] = useAtom(saveImageAsAtom);
  const [double, setDouble] = useAtom(doubleUpscaylAtom);
  const [gpu, setGpu] = useAtom(gpuIdAtom);
  const [tile, setTile] = useAtom(tileSizeAtom);
  const [tta, setTta] = useAtom(ttaModeAtom);
  const [compression, setCompression] = useAtom(compressionAtom);
  const [metadata, setMetadata] = useAtom(copyMetadataAtom);
  const [noProcessing, setNoProcessing] = useAtom(noImageProcessingAtom);
  const [overwrite, setOverwrite] = useAtom(overwriteAtom);
  const [useWidth, setUseWidth] = useAtom(useCustomWidthAtom);
  const [width, setWidth] = useAtom(customWidthAtom);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [open, setOpen] = useState(false);
  const { builtIn, refresh } = useModelAvailability();
  const available = (id: string) => id in MODELS ? builtIn?.[id] === true : imported.includes(id);
  const save = () => {
    const cleaned = name.trim();
    if (!cleaned) {
      setMessage("Enter a preset name first.");
      return;
    }
    if (presets.some((p) => p.name.toLowerCase() === cleaned.toLowerCase())) {
      setMessage(
        "That name already exists. Choose another name or delete the old preset.",
      );
      return;
    }
    setPresets([
      ...presets,
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        name: cleaned.slice(0, 80),
        model,
        scale,
        format,
        double,
        gpu,
        tile,
        tta,
        compression,
        metadata,
        noProcessing,
        overwrite,
        useWidth,
        width,
      },
    ]);
    setName("");
    setMessage("Saved current settings. No job was started.");
  };
  const apply = async (preset: WorkflowPreset) => {
    const actual = preset.model in MODELS ? await refresh() : null;
    if (preset.model in MODELS ? !actual?.[preset.model] : !available(preset.model)) {
      setMessage(
        `Model ${preset.model} is unavailable. Choose an available model or import a creator-authorized custom pair. No settings changed and no substitute was selected.`,
      );
      return;
    }
    setModel(preset.model);
    setScale(preset.scale);
    setFormat(preset.format);
    setDouble(preset.double);
    setGpu(preset.gpu);
    setTile(preset.tile);
    setTta(preset.tta);
    setCompression(preset.compression);
    setMetadata(preset.metadata);
    setNoProcessing(preset.noProcessing);
    setOverwrite(preset.overwrite);
    setUseWidth(preset.useWidth);
    setWidth(preset.width);
    setMessage(
      `Applied “${preset.name}”. Review your settings before starting.`,
    );
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="btn btn-ghost btn-sm w-full justify-start">
          Workflow presets
        </button>
      </DialogTrigger>
      <DialogContent className="flex max-h-[85vh] flex-col">
        <DialogTitle>Workflow presets</DialogTitle>
        <DialogDescription>
          Save your current model, output and processing settings. Applying a
          preset never starts a job or changes the output folder.
        </DialogDescription>
        <div className="flex gap-2">
          <input
            aria-label="Preset name"
            className="input input-sm input-bordered min-w-0 flex-1"
            maxLength={80}
            placeholder="e.g. Clean product photos"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button className="btn btn-primary btn-sm" onClick={save}>
            Save current
          </button>
        </div>
        <div className="min-h-0 space-y-2 overflow-y-auto">
          {presets.length === 0 && (
            <p className="py-4 text-sm opacity-70">
              No presets yet. Configure a workflow, name it above, then save it.
            </p>
          )}
          {presets.map((preset) => (
            <div key={preset.id} className="rounded border border-border p-3">
              <p className="break-words font-semibold">{preset.name}</p>
              <p className="my-1 break-all text-xs opacity-70">
                {preset.model} · {preset.scale}× · {preset.format.toUpperCase()}
                {preset.double ? " · two passes" : ""}
              </p>
              {!available(preset.model) && (
                <p className="text-xs text-warning">
                  Model missing — import it before applying.
                </p>
              )}
              <details className="my-2 text-xs">
                <summary>Review saved processing settings</summary>
                <p className="mt-2 leading-relaxed">
                  GPU: {preset.gpu || "automatic"}; tile:{" "}
                  {preset.tile || "automatic"}; TTA: {preset.tta ? "on" : "off"}
                  ; compression: {preset.compression}; metadata:{" "}
                  {preset.metadata ? "copy" : "off"}; processing:{" "}
                  {preset.noProcessing ? "disabled" : "enabled"}; overwrite:{" "}
                  {preset.overwrite ? "on" : "off"}; custom width:{" "}
                  {preset.useWidth ? preset.width : "off"}.
                </p>
              </details>
              <div className="flex gap-2">
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => apply(preset)}
                >
                  Apply
                </button>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => {
                    if (
                      window.confirm(
                        `Delete preset “${preset.name}”? Image files are not affected.`,
                      )
                    )
                      setPresets(presets.filter((p) => p.id !== preset.id));
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
        <p role="status" className="text-sm text-primary">
          {message}
        </p>
      </DialogContent>
    </Dialog>
  );
}
