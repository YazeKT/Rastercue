export type RastercuePhase = "queued" | "validate" | "prepare" | "device" | "model" | "process" | "process-pass-2" | "encode" | "metadata" | "verify" | "history" | "archive" | "complete";
export type RastercueErrorSeverity = "warning" | "error" | "fatal";

export type RastercueErrorRecord = {
  code: string;
  phase: RastercuePhase;
  severity: RastercueErrorSeverity;
  summary: string;
  detail: string;
  confirmed: boolean;
  recovery: string[];
  retryable: boolean;
  reportEligible: boolean;
};

type ErrorRule = Omit<RastercueErrorRecord, "detail"> & { match: RegExp };

const RULES: readonly ErrorRule[] = [
  { code: "RC-GPU-OUT-OF-MEMORY", phase: "process", severity: "error", summary: "The selected graphics device ran out of memory.", confirmed: true, recovery: ["Retry with a smaller tile size.", "Close other GPU-heavy applications.", "Choose another verified device or retry on CPU."], retryable: true, reportEligible: false, match: /VK_ERROR_OUT_OF_DEVICE_MEMORY|failed to allocate.*device|out of device memory/i },
  { code: "RC-HOST-OUT-OF-MEMORY", phase: "process", severity: "error", summary: "Rastercue could not reserve enough system memory.", confirmed: true, recovery: ["Close memory-heavy applications.", "Use a smaller image or tile size.", "Verify that Windows virtual memory is available."], retryable: true, reportEligible: false, match: /VK_ERROR_OUT_OF_HOST_MEMORY|bad_alloc|out of host memory/i },
  { code: "RC-GPU-DEVICE", phase: "device", severity: "error", summary: "The selected compute device is unavailable.", confirmed: true, recovery: ["Run hardware detection again.", "Choose Auto or another verified device.", "Update the graphics driver from the device manufacturer."], retryable: true, reportEligible: false, match: /invalid gpu device|incompatible driver|VK_ERROR_INCOMPATIBLE_DRIVER|no vulkan device/i },
  { code: "RC-MODEL-MISSING", phase: "model", severity: "error", summary: "The selected model is incomplete or missing.", confirmed: true, recovery: ["Choose an available model.", "Restore the matching .param and .bin files.", "Check the model source and licence before reinstalling it."], retryable: true, reportEligible: false, match: /model.*(?:missing|not found)|failed to load.*(?:param|model)|\.param|\.bin/i },
  { code: "RC-INPUT-DECODE", phase: "validate", severity: "error", summary: "Rastercue could not read this image safely.", confirmed: true, recovery: ["Open the image in another editor to confirm it is valid.", "Export a flattened RGB/sRGB copy.", "Choose a supported single-frame format."], retryable: false, reportEligible: false, match: /unsupported image|input.*(?:decode|invalid)|corrupt image|Input file is missing/i },
  { code: "RC-OUTPUT-PERMISSION", phase: "encode", severity: "error", summary: "Rastercue cannot write to the selected destination.", confirmed: true, recovery: ["Choose a writable output folder.", "Use a new filename or disable overwrite.", "Check free space and workplace folder permissions."], retryable: true, reportEligible: false, match: /EACCES|EPERM|permission denied|disk full|ENOSPC|already exists/i },
];

export function classifyRastercueError(raw: unknown, phase: RastercuePhase = "process"): RastercueErrorRecord {
  const detail = String(raw instanceof Error ? raw.message : raw).slice(0, 4000);
  const rule = RULES.find(candidate => candidate.match.test(detail));
  if (rule) {
    const { match: _match, ...record } = rule;
    return { ...record, detail };
  }
  return {
    code: `RC-UNKNOWN-${phase.toUpperCase().replace(/[^A-Z0-9]+/g, "-")}`,
    phase,
    severity: "error",
    summary: "Rastercue stopped during this processing phase.",
    detail,
    confirmed: false,
    recovery: ["Review the phase and hardware shown in the report.", "Retry after checking the input, destination, model, and selected device.", "Create a redacted support bundle if the problem repeats."],
    retryable: true,
    reportEligible: true,
  };
}

export function redactDiagnosticText(value: string): string {
  return value
    .replace(/[A-Za-z]:\\(?:[^\s"'<>|]+\\)*[^\s"'<>|]*/g, "[local-path]")
    .replace(/\/(?:Users|home)\/[^\s/]+/gi, "/[user]")
    .replace(/(?:file:\/\/\/)[^\s]+/gi, "[local-file]")
    .slice(0, 12000);
}
