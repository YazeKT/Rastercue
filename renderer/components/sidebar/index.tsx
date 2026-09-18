"use client";
import { useState } from "react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import {
  batchModeAtom,
  compressionAtom,
  dontShowCloudModalAtom,
  noImageProcessingAtom,
  savedOutputPathAtom,
  overwriteAtom,
  progressAtom,
  scaleAtom,
  customWidthAtom,
  useCustomWidthAtom,
  tileSizeAtom,
  selectedModelIdAtom,
  doubleUpscaylAtom,
  gpuIdAtom,
  saveImageAsAtom,
  userStatsAtom,
  ttaModeAtom,
  copyMetadataAtom,
} from "../../atoms/user-settings-atom";
import useLogger from "../hooks/use-logger";
import {
  BatchUpscaylPayload,
  DoubleUpscaylPayload,
  ImageUpscaylPayload,
} from "@common/types/types";
import { useToast } from "@/components/ui/use-toast";
import UpscaylSteps from "./upscayl-tab/upscayl-steps";
import SettingsTab from "./settings-tab";
import { logAtom } from "@/atoms/log-atom";
import { ELECTRON_COMMANDS } from "@common/electron-commands";
import useTranslation from "../hooks/use-translation";
import RastercueLogo from "@/components/icons/rastercue-logo";
import { desiredOutputNameAtom } from "@/atoms/rastercue-job-atom";
import { MODELS } from '@common/models-list';

const Sidebar = ({
  setUpscaledImagePath,
  batchFolderPath,
  setUpscaledBatchFolderPath,
  dimensions,
  imagePath,
  selectImageHandler,
  selectFolderHandler,
}: {
  setUpscaledImagePath: React.Dispatch<React.SetStateAction<string>>;
  batchFolderPath: string;
  setUpscaledBatchFolderPath: React.Dispatch<React.SetStateAction<string>>;
  dimensions: {
    width: number | null;
    height: number | null;
  };
  imagePath: string;
  selectImageHandler: () => Promise<void>;
  selectFolderHandler: () => Promise<void>;
}) => {
  const t = useTranslation();
  const logit = useLogger();
  const { toast } = useToast();

  // LOCAL STATES
  // TODO: Add electron handler for os
  const [selectedModelId, setSelectedModelId] = useAtom(selectedModelIdAtom);
  const [doubleUpscayl, setDoubleUpscayl] = useAtom(doubleUpscaylAtom);
  const [gpuId, setGpuId] = useAtom(gpuIdAtom);
  const [saveImageAs, setSaveImageAs] = useAtom(saveImageAsAtom);

  const [selectedTab, setSelectedTab] = useState(0);
  const [showCloudModal, setShowCloudModal] = useState(false);

  // ATOMIC STATES
  const overwrite = useAtomValue(overwriteAtom);
  const outputPath = useAtomValue(savedOutputPathAtom);
  const [compression, setCompression] = useAtom(compressionAtom);
  const setProgress = useSetAtom(progressAtom);
  const [batchMode, setBatchMode] = useAtom(batchModeAtom);
  const logData = useAtomValue(logAtom);
  const [scale] = useAtom(scaleAtom);
  const setDontShowCloudModal = useSetAtom(dontShowCloudModalAtom);
  const noImageProcessing = useAtomValue(noImageProcessingAtom);
  const customWidth = useAtomValue(customWidthAtom);
  const useCustomWidth = useAtomValue(useCustomWidthAtom);
  const tileSize = useAtomValue(tileSizeAtom);
  const setUserStats = useSetAtom(userStatsAtom);
  const ttaMode = useAtomValue(ttaModeAtom);
  const [copyMetadata] = useAtom(copyMetadataAtom);
  const desiredOutputName = useAtomValue(desiredOutputNameAtom);

  const upscaylHandler = async () => {
    if (selectedModelId in MODELS) {
      try {
        const availability = await window.electron.getBuiltInModels();
        if (!availability[selectedModelId]) {
          toast({ title: 'Selected model is not bundled', description: 'Choose an available model, or import a creator-authorized pair as a distinct custom model. No model was substituted and no job started.' });
          return;
        }
      } catch {
        toast({ title: 'Could not verify selected model', description: 'Reopen the model library and try again. No job started.' });
        return;
      }
    }
    try {
      await window.rastercue?.setDesiredName(batchMode ? "" : desiredOutputName);
    } catch (error) {
      toast({ description: String(error) });
      return;
    }
    logit("🔄 Resetting Upscaled Image Path");
    setUpscaledImagePath("");
    setUpscaledBatchFolderPath("");
    if (imagePath !== "" || batchFolderPath !== "") {
      setProgress(t("APP.PROGRESS.WAIT_TITLE"));
      // Double Upscayl
      if (doubleUpscayl) {
        window.electron.send<DoubleUpscaylPayload>(
          ELECTRON_COMMANDS.DOUBLE_UPSCAYL,
          {
            imagePath,
            outputPath,
            model: selectedModelId,
            gpuId: gpuId.length === 0 ? null : gpuId,
            saveImageAs,
            scale,
            noImageProcessing,
            compression: compression.toString(),
            customWidth: customWidth > 0 ? customWidth.toString() : null,
            useCustomWidth,
            tileSize,
            ttaMode,
            copyMetadata,
          },
        );
        setUserStats((prev) => ({
          ...prev,
          totalUpscayls: prev.totalUpscayls + 1,
          lastUsedAt: new Date().getTime(),
          doubleUpscayls: prev.doubleUpscayls + 1,
          imageUpscayls: prev.imageUpscayls + 1,
        }));
        logit("🏁 DOUBLE_UPSCAYL");
      } else if (batchMode) {
        // Batch Upscayl
        setDoubleUpscayl(false);
        window.electron.send<BatchUpscaylPayload>(
          ELECTRON_COMMANDS.FOLDER_UPSCAYL,
          {
            batchFolderPath,
            outputPath,
            model: selectedModelId,
            gpuId: gpuId.length === 0 ? null : gpuId,
            saveImageAs,
            scale,
            noImageProcessing,
            compression: compression.toString(),
            customWidth: customWidth > 0 ? customWidth.toString() : null,
            useCustomWidth,
            tileSize,
            ttaMode,
            copyMetadata,
          },
        );
        setUserStats((prev) => ({
          ...prev,
          totalUpscayls: prev.totalUpscayls + 1,
          lastUsedAt: new Date().getTime(),
          batchUpscayls: prev.doubleUpscayls + 1,
        }));
        logit("🏁 FOLDER_UPSCAYL");
      } else {
        // Single Image Upscayl
        window.electron.send<ImageUpscaylPayload>(ELECTRON_COMMANDS.UPSCAYL, {
          imagePath,
          outputPath,
          model: selectedModelId,
          gpuId: gpuId.length === 0 ? null : gpuId,
          saveImageAs,
          scale,
          overwrite,
          noImageProcessing,
          compression: compression.toString(),
          customWidth: customWidth > 0 ? customWidth.toString() : null,
          useCustomWidth,
          tileSize,
          ttaMode,
          copyMetadata,
        });
        setUserStats((prev) => ({
          ...prev,
          totalUpscayls: prev.totalUpscayls + 1,
          lastUsedAt: new Date().getTime(),
          imageUpscayls: prev.imageUpscayls + 1,
        }));
        logit("🏁 UPSCAYL");
      }
    } else {
      toast({
        title: t("ERRORS.NO_IMAGE_ERROR.TITLE"),
        description: t("ERRORS.NO_IMAGE_ERROR.DESCRIPTION"),
      });
      logit("🚫 No valid image selected");
    }
  };

  return (
    <>
      {/* TOP LOGO WHEN SIDEBAR IS HIDDEN */}
      <div
        className="rastercue-sidebar"
      >

        {window.electron.platform === "mac" && (
          <div className="mac-titlebar pt-8"></div>
        )}

        <header className="rastercue-brand"><RastercueLogo className="h-8 w-8"/><div><h1>Rastercue</h1><p>Image upscaling workspace</p></div></header>
        <div className="compact-tabs" role="group" aria-label="Workspace">
          {["Upscale", "Settings"].map((label,i)=><button key={label} aria-pressed={selectedTab===i} className={selectedTab===i?"active":""} onClick={()=>setSelectedTab(i)}>{label}</button>)}
        </div>

        {selectedTab === 0 && (
          <UpscaylSteps
            selectImageHandler={selectImageHandler}
            selectFolderHandler={selectFolderHandler}
            upscaylHandler={upscaylHandler}
            batchMode={batchMode}
            setBatchMode={setBatchMode}
            imagePath={imagePath}
            doubleUpscayl={doubleUpscayl}
            setDoubleUpscayl={setDoubleUpscayl}
            dimensions={dimensions}
            setGpuId={setGpuId}
            setSaveImageAs={setSaveImageAs}
          />
        )}

        {selectedTab === 1 && (
          <SettingsTab
            batchMode={batchMode}
            compression={compression}
            setCompression={setCompression}
            gpuId={gpuId}
            setGpuId={setGpuId}
            saveImageAs={saveImageAs}
            setSaveImageAs={setSaveImageAs}
            logData={logData}
            show={showCloudModal}
            setShow={setShowCloudModal}
            setDontShowCloudModal={setDontShowCloudModal}
          />
        )}
        <footer className="rastercue-credit"><a href="https://github.com/YazeKT" target="_blank" rel="noreferrer">Yaze Media</a></footer>
      </div>
    </>
  );
};

export default Sidebar;
