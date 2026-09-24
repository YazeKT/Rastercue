import { translationAtom } from "@/atoms/translations-atom";
import { useAtomValue } from "jotai";
import React from "react";
import { progressAtom } from '@/atoms/user-settings-atom';

export function ResetSettingsButton({
  hideLabel = false,
}: {
  hideLabel?: boolean;
}) {
  const t = useAtomValue(translationAtom);
  const progress = useAtomValue(progressAtom);
  return (
    <div className="flex flex-col items-start gap-2">
      {!hideLabel && (
        <p className="text-sm font-medium">
          {t("SETTINGS.RESET_SETTINGS.BUTTON_TITLE")}
        </p>
      )}
      <button
        className="btn btn-primary"
        disabled={!!progress}
        onClick={async () => {
          if (progress) return;
          if (!confirm('Reset processing preferences? History, presets, favourite models and statistics will be kept.')) return;
          for (const key of ['selectedModelId','doubleUpscayl','gpuId','computeBackend','saveImageAs','scale','rememberOutputFolder','savedOutputPath','noImageProcessing','compression','overwrite','ttaMode','customWidth','useCustomWidth','tileSize','copyMetadata']) localStorage.removeItem(key);
          location.reload();
        }}
      >
        {t("SETTINGS.RESET_SETTINGS.BUTTON_TITLE")}
      </button>
    </div>
  );
}
