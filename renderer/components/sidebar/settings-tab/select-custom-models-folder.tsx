import React, { useState } from "react";
import { ELECTRON_COMMANDS } from "@common/electron-commands";
import { useAtomValue } from "jotai";
import { translationAtom } from "@/atoms/translations-atom";
import { progressAtom } from "@/atoms/user-settings-atom";

type CustomModelsFolderSelectProps = {
  customModelsPath: string;
  setCustomModelsPath: (arg: string) => void;
};

export function CustomModelsFolderSelect({
  customModelsPath,
  setCustomModelsPath,
}: CustomModelsFolderSelectProps) {
  const t = useAtomValue(translationAtom);
  const progress = useAtomValue(progressAtom);
  const [restoring, setRestoring] = useState(false);
  const [status, setStatus] = useState('');

  return (
    <div className="flex flex-col items-start gap-2">
      <p className="text-sm font-medium">{t("SETTINGS.CUSTOM_MODELS.TITLE")}</p>
      <p className="text-xs text-base-content/80">
        {t("SETTINGS.CUSTOM_MODELS.DESCRIPTION")}{" "}
        <a
          href="https://github.com/upscayl/custom-models/blob/main/README.md"
          className="link uppercase underline"
          target="_blank"
        >
          {t("SETTINGS.CUSTOM_MODELS.LINK_TITLE")}
        </a>
      </p>
      <p className="break-all text-sm text-base-content/60">{customModelsPath || 'Using the bundled model library'}</p>
      <button
        className="btn btn-primary"
        disabled={!!progress || restoring}
        onClick={async () => {
          const customModelPath = await window.electron.invoke(
            ELECTRON_COMMANDS.SELECT_CUSTOM_MODEL_FOLDER,
          );

          if (customModelPath !== null) {
            setCustomModelsPath(customModelPath);
            window.electron.send(
              ELECTRON_COMMANDS.GET_MODELS_LIST,
              customModelPath,
            );
          } else {
            setCustomModelsPath("");
          }
        }}
      >
        {t("SETTINGS.CUSTOM_MODELS.BUTTON_FOLDER")}
      </button>
      <button className="btn btn-sm" disabled={!!progress || restoring} onClick={async()=>{
        setRestoring(true);setStatus('');
        try {
          const folder = await window.electron.invoke('rastercue-models:bundled-folder');
          if(typeof folder!=='string'||!folder)throw new Error('Bundled model folder unavailable');
          setCustomModelsPath('');
          window.electron.send(ELECTRON_COMMANDS.GET_MODELS_LIST,folder);
          setStatus('Bundled model library selected. Your selected model was not changed.');
        } catch { setStatus('Could not load the bundled library. Retry or select a custom folder.'); }
        finally { setRestoring(false); }
      }}>{restoring?'Loading library…':'Use bundled model library'}</button>
      <p className="text-xs" role="status">{status}</p>
    </div>
  );
}
