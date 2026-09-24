import { app } from "electron";
import isDev from "electron-is-dev";
import { dirname, join, resolve } from "path";
import { getPlatform } from "./get-device-specs";

const appRootDir = app.getAppPath();
const binariesPath = isDev
  ? join(appRootDir, "resources", getPlatform()!, "bin")
  : join(dirname(appRootDir), "bin");

export const cpuExecPath = resolve(join(binariesPath, process.platform === "win32" ? "rastercue-cpu.exe" : "rastercue-cpu"));
