import { app, BrowserWindow, shell } from "electron";
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
  mainWindow.loadURL(url);

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
