export type HardwareVendor = "intel" | "amd" | "nvidia" | "apple" | "microsoft" | "unknown";
export type Availability = "available" | "unavailable" | "unknown";
export type ComputeBackendId = "original-vulkan" | "rastercue-vulkan" | "cpu";

export interface CpuInfo {
  model: string;
  logicalCores: number;
  physicalCores: number | null;
  architecture: string;
}

export interface MemoryInfo {
  totalBytes: number;
  freeBytes: number;
}

export interface DisplayAdapter {
  id: string;
  name: string;
  vendor: HardwareVendor;
  driverVersion: string | null;
  memoryBytes: number | null;
  pnpDeviceId: string | null;
  active: boolean | null;
  source: "windows-cim" | "system-profiler" | "lspci" | "electron";
}

export interface EngineDevice {
  id: string;
  name: string;
  vendor: HardwareVendor;
  api: "vulkan";
  compatibility: "verified";
  capabilities: {
    fp16: string | null;
    int8: string | null;
    subgroupSize: number | null;
  };
}

export interface ComputeBackendAvailability {
  id: ComputeBackendId;
  label: string;
  kind: "vulkan" | "cpu";
  availability: Availability;
  deviceIds: string[];
  reason: string;
  compatibilityBackend: boolean;
}

export interface ComputeRecommendation {
  backendId: ComputeBackendId | null;
  deviceId: string | null;
  confidence: "verified" | "unverified";
  reason: string;
}

export interface HardwareSnapshot {
  schemaVersion: 1;
  detectedAt: string;
  platform: string;
  release: string;
  cpu: CpuInfo;
  memory: MemoryInfo;
  displayAdapters: DisplayAdapter[];
  engineDevices: EngineDevice[];
  backends: ComputeBackendAvailability[];
  recommendation: ComputeRecommendation;
  actualDevice: null;
  actualDeviceReason: string;
  warnings: string[];
}

export interface SoftwareComponent {
  id: string;
  label: string;
  version: string;
  status: Availability;
  detail?: string;
}

export interface SoftwareInventory {
  schemaVersion: 1;
  collectedAt: string;
  app: { name: string; version: string; channel: string; packaged: boolean };
  runtime: SoftwareComponent[];
  engine: {
    label: string;
    path: string;
    sha256: string | null;
    status: Availability;
    contract: string;
  };
  models: { bundled: number; available: number };
  locations: { userData: string; logs: string; models: string };
}

export interface RastercueHardwareAPI {
  detect(options?: { refresh?: boolean }): Promise<HardwareSnapshot>;
  software(options?: { refresh?: boolean }): Promise<SoftwareInventory>;
  selectBackend(backendId: ComputeBackendId): Promise<{ backendId: ComputeBackendId }>;
}
