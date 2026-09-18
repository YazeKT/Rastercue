import { ELECTRON_COMMANDS } from "@common/electron-commands";
import { useEffect } from "react";
import useLogger from "./use-logger";

export const initCustomModels = () => {
  const logit = useLogger();

  useEffect(() => {
    let disposed = false;
    void (async () => {
      try {
        const customModelsPath = JSON.parse(localStorage.getItem("customModelsPath"));
        const folder = customModelsPath || await window.electron.invoke('rastercue-models:bundled-folder');
        if (!disposed && folder) {
          window.electron.send(ELECTRON_COMMANDS.GET_MODELS_LIST, folder);
          logit('Models folder:', folder);
        }
      } catch { logit('Warning: could not load model folder. Reopen Settings and select your model folder.'); }
    })();
    return () => { disposed = true; };
  }, []);
};
