import { translationAtom } from "@/atoms/translations-atom";
import { autoUpdateAtom } from "@/atoms/user-settings-atom";
import { useAtom, useAtomValue } from "jotai";

const AutoUpdateToggle = () => {
  const [autoUpdate, setAutoUpdate] = useAtom(autoUpdateAtom);
  const t = useAtomValue(translationAtom);

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium">{t("SETTINGS.AUTO_UPDATE.TITLE")}</p>
      <p className="text-xs text-base-content/80">
        {t("SETTINGS.AUTO_UPDATE.DESCRIPTION")}
      </p>
      <label className="flex items-center gap-3 text-xs">
        <input
          type="checkbox"
          className="toggle"
          checked={autoUpdate}
          onChange={(event) => setAutoUpdate(event.target.checked)}
        />
        Automatically download stable updates from GitHub
      </label>
    </div>
  );
};

export default AutoUpdateToggle;
