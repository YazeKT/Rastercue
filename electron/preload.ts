import { ipcRenderer, contextBridge, webUtils } from "electron";
import {
  getAppVersion,
  getDeviceSpecs,
  getPlatform,
} from "./utils/get-device-specs";
import { SEND_CHANNELS, INVOKE_CHANNELS, RECEIVE_CHANNELS } from './utils/security-policy';
import { progressDelivery } from './utils/progress-delivery';
import { ELECTRON_COMMANDS as C } from '../common/electron-commands';
import { RastercueHardwareAPI } from '../common/hardware-types';

const listeners = new Map<string, Map<(...args: any[]) => any, (...args: any[]) => any>>();
const cleanup = new Map<(...args: any[]) => any, () => void>();
const requireChannel = (channels: Set<string>, command: string) => {
  if (!channels.has(command)) throw new Error('Unsupported application IPC channel');
};

// 'ipcRenderer' will be available in index.js with the method 'window.electron'
contextBridge.exposeInMainWorld("electron", {
  send: (command: string, payload: any) => {
    requireChannel(SEND_CHANNELS, command);
    ipcRenderer.send(command, payload);
  },
  on: (command: string, func: (...args: any[]) => any) => {
    requireChannel(RECEIVE_CHANNELS, command);
    const delivery = progressDelivery(func, [C.LOG, C.UPSCAYL_PROGRESS, C.DOUBLE_UPSCAYL_PROGRESS, C.FOLDER_UPSCAYL_PROGRESS].includes(command as any));
    const listener = delivery.receive;
    cleanup.set(listener, delivery.cancel);
    if (!listeners.has(command)) listeners.set(command, new Map());
    const previous = listeners.get(command)!.get(func);
    if (previous) { ipcRenderer.removeListener(command, previous); cleanup.get(previous)?.(); cleanup.delete(previous); }
    listeners.get(command)!.set(func, listener);
    ipcRenderer.on(command, listener);
  },
  off: (command: string, func: (...args: any[]) => any) => {
    const listener = listeners.get(command)?.get(func);
    if (listener) ipcRenderer.removeListener(command, listener);
    if (listener) { cleanup.get(listener)?.(); cleanup.delete(listener); }
    listeners.get(command)?.delete(func);
  },
  invoke: (command: string, payload: any) => {
    requireChannel(INVOKE_CHANNELS, command);
    return ipcRenderer.invoke(command, payload);
  },
  platform: getPlatform(),
  getSystemInfo: async () => await getDeviceSpecs(),
  getAppVersion: async () => await getAppVersion(),
  getFilePath: (file: File) => webUtils.getPathForFile(file),
  getBuiltInModels: () => ipcRenderer.invoke('rastercue-models:availability'),
});

contextBridge.exposeInMainWorld('rastercue', {
  list: () => ipcRenderer.invoke('rastercue:list'),
  current: () => ipcRenderer.invoke('rastercue:current'),
  getThumbnail: (jobId: string, fileId: string, kind: 'source' | 'output') => ipcRenderer.invoke('rastercue:getThumbnail', jobId, fileId, kind),
  setDesiredName: (name: string) => ipcRenderer.invoke('rastercue:setDesiredName', name),
  rename: (jobId: string, fileId: string, name: string) => ipcRenderer.invoke('rastercue:rename', jobId, fileId, name),
  open: (jobId: string, fileId: string) => ipcRenderer.invoke('rastercue:open', jobId, fileId),
  openFolder: (jobId?: string) => ipcRenderer.invoke('rastercue:openFolder', jobId),
  openLogs: () => ipcRenderer.invoke('rastercue:openLogs'),
  relocate: () => ipcRenderer.invoke('rastercue:relocate'),
  clear: (confirmed: boolean) => ipcRenderer.invoke('rastercue:clear', confirmed),
  archive: (jobId: string) => ipcRenderer.invoke('rastercue:archive', jobId),
  restoreArchive: () => ipcRenderer.invoke('rastercue:restoreArchive'),
  createSupportBundle: (jobId?: string) => ipcRenderer.invoke('rastercue:createSupportBundle', jobId),
  onChanged: (callback: (snapshot: unknown) => void) => {
    const listener = (_event: unknown, snapshot: unknown) => callback(snapshot);
    ipcRenderer.on('rastercue:changed', listener);
    return () => ipcRenderer.removeListener('rastercue:changed', listener);
  },
});
contextBridge.exposeInMainWorld('rastercueUpdates', {
  check: () => ipcRenderer.invoke('rastercue-updates:check'),
});

const rastercueHardware: RastercueHardwareAPI = {
  detect: options => ipcRenderer.invoke('rastercue-hardware:detect', options),
  software: options => ipcRenderer.invoke('rastercue-hardware:software', options),
  selectBackend: backendId => ipcRenderer.invoke('rastercue-hardware:select-backend', backendId),
};
contextBridge.exposeInMainWorld('rastercueHardware', rastercueHardware);
