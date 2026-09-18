import prepareNext from "electron-next";
import { autoUpdater } from "electron-updater";
import log from "electron-log";
import { app, ipcMain, protocol, dialog, shell } from "electron";
import { ELECTRON_COMMANDS } from "../common/electron-commands";
import logit from "./utils/logit";
import openFolder from "./commands/open-folder";
import stop from "./commands/stop";
import selectFolder from "./commands/select-folder";
import selectFile from "./commands/select-file";
import getModelsList from "./commands/get-models-list";
import customModelsSelect from "./commands/custom-models-select";
import imageUpscayl from "./commands/image-upscayl";
import { createMainWindow, getMainWindow } from "./main-window";
import { registerRastercueHistory } from './rastercue-history';
import { registerRastercueUpdates } from './rastercue-updates';
import electronIsDev from "electron-is-dev";
import { execPath, modelsPath } from "./utils/get-resource-paths";
import batchUpscayl from "./commands/batch-upscayl";
import doubleUpscayl from "./commands/double-upscayl";
import { FEATURE_FLAGS } from "../common/feature-flags";
import settings from "electron-settings";
import pasteImage from "./commands/paste-image";
import path from "path";
import fs from "fs";
import { builtInModelAvailability } from './utils/model-availability';

// INITIALIZATION
app.setName('Rastercue');
app.setPath('userData', process.env.RASTERCUE_TEST_USER_DATA || path.join(app.getPath('appData'), 'Rastercue'));
log.transports.file.sync = false;
log.initialize({ preload: true });

app.on("ready", async () => {
  await prepareNext("./renderer");

  app.whenReady().then(() => {
    protocol.registerFileProtocol("file", (request, callback) => {
      const pathname = decodeURI(request.url.replace("file:///", ""));
      callback(pathname);
    });
    protocol.registerFileProtocol("public", (request, callback) => {
      const filePath = decodeURI(request.url.replace("public:///", ""));
      const asarPath = path.join(
        app.getAppPath(),
        "renderer",
        process.env.NODE_ENV === "development" ? "public" : "out",
        filePath,
      );
      const publicRoot = path.join(app.getAppPath(), 'renderer', process.env.NODE_ENV === 'development' ? 'public' : 'out');
      const relative = path.relative(publicRoot, asarPath);
      if (relative.startsWith('..') || path.isAbsolute(relative)) {
        callback({ error: -10 }); // ACCESS_DENIED: no traversal outside app assets.
        return;
      }
      callback(asarPath);
    });
    logit("🚃 App Path: ", app.getAppPath());
  });

  createMainWindow();
  const rastercueWindow = getMainWindow();
  if (rastercueWindow) {
    registerRastercueHistory(rastercueWindow);
    registerRastercueUpdates(rastercueWindow);
    if (process.platform === 'win32' && app.isPackaged && !fs.existsSync(path.join(process.env.SystemRoot || 'C:\\Windows', 'System32', 'vcomp140.dll'))) {
      void dialog.showMessageBox(rastercueWindow, {
        type: 'warning', title: 'Microsoft runtime required',
        message: 'Install the Microsoft Visual C++ x64 Redistributable before upscaling.',
        detail: 'Rastercue uses the unchanged native engine, which requires the release OpenMP runtime. Download it directly from Microsoft, then restart Rastercue. No Microsoft runtime DLLs are redistributed in this package.',
        buttons: ['Microsoft download page', 'Later'], defaultId: 0, cancelId: 1,
      }).then(({response}) => { if(response===0) return shell.openExternal('https://learn.microsoft.com/en-us/cpp/windows/latest-supported-vc-redist'); }).catch(console.error);
    }
  }

  log.info(
    "Rastercue version:",
    app.getVersion(),
    FEATURE_FLAGS.APP_STORE_BUILD ? "MAC-APP-STORE" : "FOSS",
  );
  log.info("🚀 UPSCAYL EXEC PATH: ", execPath);
  log.info("🚀 MODELS PATH: ", modelsPath);

  let closeAccess;
  const folderBookmarks = await settings.get("folder-bookmarks");
  if (FEATURE_FLAGS.APP_STORE_BUILD && folderBookmarks) {
    logit("🚨 Folder Bookmarks: ", folderBookmarks);
    try {
      closeAccess = app.startAccessingSecurityScopedResource(
        folderBookmarks as string,
      );
    } catch (error) {
      logit("📁 Folder Bookmarks Error: ", error);
    }
  }
});

// Quit the app once all windows are closed
app.on("window-all-closed", () => {
  app.quit();
});

// ! ENABLE THIS FOR MACOS APP STORE BUILD
if (FEATURE_FLAGS.APP_STORE_BUILD) {
  logit("🚀 APP STORE BUILD ENABLED");
  app.commandLine.appendSwitch("in-process-gpu");
}

// Only the isolated, top-level application frame may invoke engine or file
// commands. Keep the original handlers and their payloads unchanged.
const trustedRequest = (event: any) => {
  const win = getMainWindow();
  return !!win && event.sender === win.webContents && event.senderFrame === win.webContents.mainFrame;
};
const onTrusted = (channel: string, handler: (...args: any[]) => any) => ipcMain.on(channel, (event, ...args) => {
  if (trustedRequest(event)) handler(event, ...args);
});
const handleTrusted = (channel: string, handler: (...args: any[]) => any) => ipcMain.handle(channel, (event, ...args) => {
  if (!trustedRequest(event)) throw new Error('Untrusted application request.');
  return handler(event, ...args);
});

onTrusted(ELECTRON_COMMANDS.STOP, stop);
handleTrusted('rastercue-models:bundled-folder', () => modelsPath);

onTrusted(ELECTRON_COMMANDS.OPEN_FOLDER, openFolder);

handleTrusted(ELECTRON_COMMANDS.SELECT_FOLDER, selectFolder);

handleTrusted(ELECTRON_COMMANDS.SELECT_FILE, selectFile);

onTrusted(ELECTRON_COMMANDS.GET_MODELS_LIST, getModelsList);

handleTrusted(
  ELECTRON_COMMANDS.SELECT_CUSTOM_MODEL_FOLDER,
  customModelsSelect,
);

onTrusted(ELECTRON_COMMANDS.UPSCAYL, imageUpscayl);

onTrusted(ELECTRON_COMMANDS.FOLDER_UPSCAYL, batchUpscayl);

onTrusted(ELECTRON_COMMANDS.DOUBLE_UPSCAYL, doubleUpscayl);

onTrusted(ELECTRON_COMMANDS.PASTE_IMAGE, pasteImage);

handleTrusted("get-gpu-info", async () => {
  try {
    return await app.getGPUInfo("complete");
  } catch (error) {
    console.error("Failed to get GPU info:", error);
    return null;
  }
});

handleTrusted("get-app-version", () => {
  return `${app.getVersion()} ${
    FEATURE_FLAGS.APP_STORE_BUILD ? "MAC-APP-STORE" : "FOSS"
  }`;
});

handleTrusted('rastercue-models:availability', () => builtInModelAvailability(modelsPath));
