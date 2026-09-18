import { atomWithStorage } from "jotai/utils";
import { ImageFormat } from "@/lib/valid-formats";

export interface WorkflowPreset {
  id: string;
  name: string;
  model: string;
  scale: string;
  format: ImageFormat;
  double: boolean;
  gpu: string;
  tile: number | null;
  tta: boolean;
  compression: number;
  metadata: boolean;
  noProcessing: boolean;
  overwrite: boolean;
  useWidth: boolean;
  width: number;
}

export const favouriteModelsAtom = atomWithStorage<string[]>(
  "rastercue.favouriteModels.v1",
  [],
);
export const workflowPresetsAtom = atomWithStorage<WorkflowPreset[]>(
  "rastercue.workflowPresets.v1",
  [],
);
