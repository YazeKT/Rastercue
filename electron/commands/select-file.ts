import { MessageBoxOptions, app, dialog } from "electron";
import path from "path";
import { getMainWindow } from "../main-window";
import { savedImagePath, setSavedImagePath } from "../utils/config-variables";
import logit from "../utils/logit";
import settings from "electron-settings";
import { FEATURE_FLAGS } from "../../common/feature-flags";
import { IMPORT_EXTENSIONS, isSupportedImport } from "../../common/format-capabilities";

const selectFile = async () => {
  const mainWindow = getMainWindow();

  const { canceled, filePaths, bookmarks } = await dialog.showOpenDialog({
    properties: ["openFile"],
    title: "Select Image",
    defaultPath: savedImagePath,
    securityScopedBookmarks: true,
    message: "Select Image to Upscale",
    filters: [
      {
        name: "Images",
        extensions: [...IMPORT_EXTENSIONS, ...IMPORT_EXTENSIONS.map(extension => extension.toUpperCase())],
      },
    ],
  });

  if (FEATURE_FLAGS.APP_STORE_BUILD && bookmarks && bookmarks.length > 0) {
    console.log("🚨 Setting Bookmark: ", bookmarks);
    settings.set("file-bookmarks", bookmarks[0]);
  }

  if (canceled) {
    logit("🚫 File Operation Cancelled");
    return null;
  } else {
    setSavedImagePath(filePaths[0]);

    let isValid = false;
    // READ SELECTED FILES
    filePaths.forEach((file) => {
      // log.log("Files in Folder: ", file);
      if (isSupportedImport(path.extname(file))) {
        isValid = true;
      }
    });

    if (!isValid) {
      logit("❌ Invalid File Detected");
      const options: MessageBoxOptions = {
        type: "error",
        title: "Invalid File",
        message:
          "Choose a supported single-image PNG, JPEG, WebP, AVIF, or single-page TIFF file.",
      };
      if (!mainWindow) return null;
      dialog.showMessageBoxSync(mainWindow, options);
      return null;
    }

    logit("📄 Selected File Path: ", filePaths[0]);
    // CREATE input AND upscaled FOLDER
    return filePaths[0];
  }
};

export default selectFile;
