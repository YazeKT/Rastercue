import { ipcRenderer, contextBridge } from "electron";
import {
  getAppVersion,
  getDeviceSpecs,
  getPlatform,
} from "./utils/get-device-specs";

// 'ipcRenderer' will be available in index.js with the method 'window.electron'
contextBridge.exposeInMainWorld("electron", {
  send: (command: string, payload: any) => ipcRenderer.send(command, payload),
  on: (command: string, func: (...args: any) => any) =>
    ipcRenderer.on(command, (event, args) => {
      func(event, args);
    }),
  invoke: (command: string, payload: any) =>
    ipcRenderer.invoke(command, payload),
  platform: getPlatform(),
  getSystemInfo: async () => await getDeviceSpecs(),
  getAppVersion: async () => await getAppVersion(),
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
