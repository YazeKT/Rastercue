export type RastercueFormat = "png" | "jpg" | "jpeg" | "jfif" | "webp" | "avif" | "tiff" | "tif";

export type FormatCapability = {
  id: RastercueFormat;
  label: string;
  extensions: readonly string[];
  import: boolean;
  export: boolean;
  nativeEngine: boolean;
  alpha: boolean;
  resolutionMetadata: boolean;
  note: string;
};

export const FORMAT_CAPABILITIES: readonly FormatCapability[] = [
  { id: "png", label: "PNG", extensions: ["png"], import: true, export: true, nativeEngine: true, alpha: true, resolutionMetadata: true, note: "Lossless artwork and transparency." },
  { id: "jpg", label: "JPEG", extensions: ["jpg", "jpeg", "jfif"], import: true, export: true, nativeEngine: true, alpha: false, resolutionMetadata: true, note: "Compact opaque photographs." },
  { id: "webp", label: "WebP", extensions: ["webp"], import: true, export: true, nativeEngine: true, alpha: true, resolutionMetadata: false, note: "Compact web delivery. Animated files are rejected." },
  { id: "avif", label: "AVIF", extensions: ["avif"], import: true, export: true, nativeEngine: false, alpha: true, resolutionMetadata: false, note: "Converted through a bounded lossless working image." },
  { id: "tiff", label: "TIFF", extensions: ["tif", "tiff"], import: true, export: true, nativeEngine: false, alpha: true, resolutionMetadata: true, note: "Single-page RGB/sRGB images only." },
] as const;

const byExtension = new Map(FORMAT_CAPABILITIES.flatMap(capability => capability.extensions.map(extension => [extension, capability] as const)));

export function formatCapability(value: string): FormatCapability | undefined {
  return byExtension.get(value.replace(/^\./, "").toLowerCase());
}

export function isSupportedImport(value: string): boolean {
  return formatCapability(value)?.import === true;
}

export function isSupportedExport(value: string): boolean {
  return formatCapability(value)?.export === true;
}

export const IMPORT_EXTENSIONS = Array.from(byExtension.keys());
export const EXPORT_FORMATS = ["png", "jpg", "webp", "avif", "tiff"] as const;
