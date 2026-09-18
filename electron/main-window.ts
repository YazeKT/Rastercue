import { app, BrowserWindow, shell } from "electron";
import { getPlatform } from "./utils/get-device-specs";
import { join } from "path";
import { ELECTRON_COMMANDS } from "../common/electron-commands";
import { fetchLocalStorage } from "./utils/config-variables";
import electronIsDev from "electron-is-dev";
import { format } from "url";

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
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
      webSecurity: false,
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

  mainWindow.loadURL(url);

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
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
