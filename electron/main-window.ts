import { app, BrowserWindow, shell, ipcMain } from "electron";
import { getPlatform } from "./utils/get-device-specs";
import { join } from "path";
import { ELECTRON_COMMANDS } from "../common/electron-commands";
import { fetchLocalStorage } from "./utils/config-variables";
import electronIsDev from "electron-is-dev";
import { format } from "url";
import { isSafeExternalURL, isTrustedDocument } from './utils/security-policy';

let mainWindow: BrowserWindow | undefined;

const createMainWindow = () => {
  console.log("📂 DIRNAME", __dirname);
  console.log("🚃 App Path: ", app.getAppPath());

  mainWindow = new BrowserWindow({
    icon: electronIsDev ? join(app.getAppPath(), "build", "icon.png") : join(app.getPath('exe'), '..', 'resources', '128x128.png'),
    title: 'Rastercue',
    width: 1366,
    height: 728,
    minHeight: 500,
    minWidth: 900,
    show: false,
    backgroundColor: "#14161B",
    webPreferences: {
      nodeIntegration: false,
      nodeIntegrationInWorker: false,
      contextIsolation: true,
      webSecurity: true,
      // The existing preload imports local modules and os. Context isolation
      // protects the renderer; bundling the preload is a separate sandbox task.
      sandbox: false,
      preload: join(__dirname, "preload.js"),
    },
    titleBarStyle: getPlatform() === "mac" ? "hiddenInset" : "default",
  });

  const url = electronIsDev
    ? "http://localhost:8000"
    : format({
        pathname: join(__dirname, "../../renderer/out/index.html"),
        protocol: "file:",
        slashes: true,
      });

  mainWindow.webContents.setWindowOpenHandler(({ url: target }) => {
    if (isSafeExternalURL(target)) void shell.openExternal(target).catch(console.error);
    return { action: "deny" };
  });
  const preventUntrustedNavigation = (event: { preventDefault: () => void }, target: string) => {
    if (!isTrustedDocument(target, url)) {
      event.preventDefault();
      if (isSafeExternalURL(target)) void shell.openExternal(target).catch(console.error);
    }
  };
  mainWindow.webContents.on('will-navigate', preventUntrustedNavigation);
  mainWindow.webContents.on('will-redirect', preventUntrustedNavigation);
  mainWindow.webContents.on('will-attach-webview', event => event.preventDefault());
  mainWindow.webContents.session.setPermissionRequestHandler((contents, permission, callback) => callback(contents === mainWindow?.webContents && permission === 'clipboard-sanitized-write'));
  mainWindow.webContents.session.setPermissionCheckHandler((contents, permission) => contents === mainWindow?.webContents && permission === 'clipboard-sanitized-write');
  // The taskbar is presentation only. Avoid thousands of synchronous native
  // shell updates for tiny engine tiles; reset/error/cancellation stays immediate.
  const updateTaskbar = mainWindow.setProgressBar.bind(mainWindow);
  let taskbarTimer: ReturnType<typeof setTimeout> | undefined;
  let taskbarValue = 0;
  let taskbarOptions: Parameters<BrowserWindow['setProgressBar']>[1];
  mainWindow.setProgressBar = (value, options) => {
    if (!Number.isFinite(value)) return;
    if (value < 0 || value >= 1) {
      if (taskbarTimer) clearTimeout(taskbarTimer);
      taskbarTimer = undefined; updateTaskbar(value, options); return;
    }
    taskbarValue = value; taskbarOptions = options;
    if (!taskbarTimer) taskbarTimer = setTimeout(() => {
      taskbarTimer = undefined;
      if (mainWindow && !mainWindow.isDestroyed()) updateTaskbar(taskbarValue, taskbarOptions);
    }, 150);
  };
  mainWindow.once('closed', () => { if (taskbarTimer) clearTimeout(taskbarTimer); });
  mainWindow.loadURL(url);
  // A main-process shortcut remains available even if renderer JavaScript is
  // busy. Dispatch the same trusted Stop command; never delete output files.
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.type === 'keyDown' && (input.control || input.meta) && input.key === '.') {
      event.preventDefault();
      if (mainWindow) ipcMain.emit(ELECTRON_COMMANDS.STOP, { sender: mainWindow.webContents, senderFrame: mainWindow.webContents.mainFrame });
    }
  });

  mainWindow.once("ready-to-show", () => {
    if (!mainWindow) return;
    mainWindow.show();
  });

  fetchLocalStorage();

  mainWindow.webContents.send(ELECTRON_COMMANDS.OS, getPlatform());

  mainWindow.setMenuBarVisibility(false);
};

const getMainWindow = () => {
  return mainWindow;
};

export { createMainWindow, getMainWindow };
