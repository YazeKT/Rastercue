import { IpcRenderer } from "electron";
import { RastercueHardwareAPI } from "@common/hardware-types";

export interface IElectronAPI {
  on: (command, func?) => IpcRenderer;
  off: (command, func?) => IpcRenderer;
  send: <T>(command, func?: T) => IpcRenderer;
  invoke: (command, func?) => any;
  platform: "mac" | "win" | "linux";
  getSystemInfo: () => Promise<{
    platform: string | undefined;
    release: string;
    arch: string | undefined;
    model: string;
    cpuCount: number;
    gpu: Record<string, any>;
  }>;
  getAppVersion: () => Promise<string>;
  getFilePath: (file: File) => string;
  getBuiltInModels: () => Promise<Record<string, boolean>>;
}

declare global {
  interface Window {
    electron: IElectronAPI;
    rastercueHardware: RastercueHardwareAPI;
  }
}
