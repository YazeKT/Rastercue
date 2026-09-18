import { ipcRenderer, contextBridge, webUtils } from "electron";
import {
  getAppVersion,
  getDeviceSpecs,
  getPlatform,
} from "./utils/get-device-specs";
import { SEND_CHANNELS, INVOKE_CHANNELS, RECEIVE_CHANNELS } from './utils/security-policy';

const listeners = new Map<string, Map<(...args: any[]) => any, (...args: any[]) => any>>();
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
    const listener = (_event: unknown, args: unknown) => func(undefined, args);
    if (!listeners.has(command)) listeners.set(command, new Map());
    const previous = listeners.get(command)!.get(func);
    if (previous) ipcRenderer.removeListener(command, previous);
    listeners.get(command)!.set(func, listener);
    ipcRenderer.on(command, listener);
  },
  off: (command: string, func: (...args: any[]) => any) => {
    const listener = listeners.get(command)?.get(func);
    if (listener) ipcRenderer.removeListener(command, listener);
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
  setDesiredName: (name: string) => ipcRenderer.invoke('rastercue:setDesiredName', name),
  rename: (jobId: string, fileId: string, name: string) => ipcRenderer.invoke('rastercue:rename', jobId, fileId, name),
  open: (jobId: string, fileId: string) => ipcRenderer.invoke('rastercue:open', jobId, fileId),
  openFolder: (jobId?: string) => ipcRenderer.invoke('rastercue:openFolder', jobId),
  relocate: () => ipcRenderer.invoke('rastercue:relocate'),
  clear: (confirmed: boolean) => ipcRenderer.invoke('rastercue:clear', confirmed),
  onChanged: (callback: (snapshot: unknown) => void) => {
    const listener = (_event: unknown, snapshot: unknown) => callback(snapshot);
    ipcRenderer.on('rastercue:changed', listener);
    return () => ipcRenderer.removeListener('rastercue:changed', listener);
  },
});
contextBridge.exposeInMainWorld('rastercueUpdates', {
  check: () => ipcRenderer.invoke('rastercue-updates:check'),
});
