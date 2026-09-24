export type StudioPhase = "validate" | "device" | "model" | "upscale" | "encode" | "verify";

export function readPercent(progress: string) {
  const match = progress.match(/(\d+(?:\.\d+)?)\s*%/);
  return match ? Math.min(100, Math.max(0, Number(match[1]))) : null;
}

export function studioPhase(progress: string): StudioPhase {
  const normalized = progress.toLowerCase();
  if (/verif|thumbnail|history|archive|complet|success|done/.test(normalized)) return "verify";
  if (/convert|encod|metadata|sav|scaling/.test(normalized)) return "encode";
  if (/\d+(?:\.\d+)?\s*%|upscal|process|pass/.test(normalized)) return "upscale";
  if (/model|weight|param/.test(normalized)) return "model";
  if (/device|gpu|vulkan|backend/.test(normalized)) return "device";
  return "validate";
}
