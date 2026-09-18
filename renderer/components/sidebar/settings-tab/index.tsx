import SelectTheme from "./select-theme";
import { SaveOutputFolderToggle } from "./save-output-folder-toggle";
import { InputGpuId } from "./input-gpu-id";
import { CustomModelsFolderSelect } from "./select-custom-models-folder";
import { LogArea } from "./log-area";
import { SelectImageScale } from "./select-image-scale";
import { SelectImageFormat } from "./select-image-format";
import React, { useState } from "react";
import { useAtom, useAtomValue } from "jotai";
import { customModelsPathAtom, scaleAtom, progressAtom } from "@/atoms/user-settings-atom";
import { ELECTRON_COMMANDS } from "@common/electron-commands";
import { InputCompression } from "./input-compression";
import OverwriteToggle from "./overwrite-toggle";
import { ResetSettingsButton } from "./reset-settings-button";
import TurnOffNotificationsToggle from "./turn-off-notifications-toggle";
import { InputCustomResolution } from "./input-custom-resolution";
import { InputTileSize } from "./input-tile-size";
import LanguageSwitcher from "./language-switcher";
import { ImageFormat } from "@/lib/valid-formats";
import TTAModeToggle from "./tta-mode-toggle";
import CopyMetadataToggle from "./copy-metadata-toggle";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SupportPanel } from "./support-panel";
interface IProps {
  batchMode:boolean;saveImageAs:ImageFormat;setSaveImageAs:React.Dispatch<React.SetStateAction<ImageFormat>>;
  compression:number;setCompression:React.Dispatch<React.SetStateAction<number>>;
  gpuId:string;setGpuId:React.Dispatch<React.SetStateAction<string>>;
  logData:string[];show?:boolean;setShow?:React.Dispatch<React.SetStateAction<boolean>>;
  setDontShowCloudModal?:React.Dispatch<React.SetStateAction<boolean>>;
  open:boolean; onOpenChange:(open:boolean)=>void;
}
export default function SettingsTab({batchMode,compression,setCompression,gpuId,setGpuId,saveImageAs,setSaveImageAs,logData,open,onOpenChange}:IProps) {
  const [support,setSupport]=useState(false);
  const progress=useAtomValue(progressAtom);
  const [customModelsPath,setCustomModelsPath]=useAtom(customModelsPathAtom);
  const [scale,setScale]=useAtom(scaleAtom);
  const format=(f:string)=>setSaveImageAs(f as ImageFormat);
  const groups=[
    [
      [<SelectImageFormat batchMode={batchMode} saveImageAs={saveImageAs} setExportType={format}/>,"Choose the output file type. Example: JPG for photos, PNG for transparent artwork."],
      [<CopyMetadataToggle saveImageAs={saveImageAs} setExportType={format}/>,"Keeps supported source information. Example: retain a photo's camera details; shared files may reveal location metadata."],
      [<InputCompression compression={compression} handleCompressionChange={e=>setCompression(Number(e.target.value))}/>,"Controls the existing encoder's compression. Example: compare an exported copy before choosing stronger compression."],
      [<SaveOutputFolderToggle/>,"Reuses the destination you chose. Example: send every project export to your delivery folder."],
      [<OverwriteToggle/>,"Allows the existing single-job overwrite behaviour. Example: rerunning an image can replace the earlier output."],
    ],
    [
      [<SelectImageScale scale={scale} setScale={setScale}/>,"Sets enlargement. Example: 500 pixels at 4× becomes 2000 pixels before other sizing options."],
      [<InputCustomResolution/>,"Sets a target width while retaining proportions. Example: make a landscape image 2400 pixels wide."],
      [<InputGpuId gpuId={gpuId} handleGpuIdChange={e=>setGpuId(e.target.value)}/>,"Chooses the GPU used by the unchanged engine. Example: leave empty for automatic selection; use the ID shown in logs to choose a device."],
      [<InputTileSize/>,"Processes the image in smaller sections. Example: reduce tile size if the GPU runs out of memory; 0 selects automatic sizing."],
      [<TTAModeToggle/>,"Runs extra transformed passes and combines them. Example: compare a difficult texture with TTA enabled; expect a longer job."],
    ],
    [
      [<SelectTheme/>,"Changes interface colours only. Example: keep dark mode for a dim design workspace."],
      [<LanguageSwitcher/>,"Changes translated interface labels. Example: choose your preferred language without changing the image."],
      [<CustomModelsFolderSelect customModelsPath={customModelsPath} setCustomModelsPath={setCustomModelsPath}/>,"Loads paired custom model files from a folder. Example: select a folder containing matching .bin and .param files."],
      [<TurnOffNotificationsToggle/>,"Controls desktop notifications. Example: turn them off during a presentation."],
      [<ResetSettingsButton/>,"Restores application preferences, not images or job history. Example: reset after experimenting with processing settings."],
    ],
  ];
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="flex h-[90vh] max-h-[850px] w-[94vw] max-w-[1100px] flex-col gap-4 overflow-hidden bg-base-100 text-base-content">
    <DialogHeader><DialogTitle>Settings & support</DialogTitle><DialogDescription>All your preferences in one place. Changes are saved as you make them.</DialogDescription></DialogHeader>
    <div className="compact-tabs" role="group" aria-label="Settings groups">
      <button aria-pressed={!support} className={!support?"active":""} onClick={()=>setSupport(false)}>All settings</button>
      <button aria-pressed={support} className={support?"active":""} onClick={()=>setSupport(true)}>Support</button>
    </div>
    <div className="min-h-0 flex-1 overflow-y-auto pr-2">
      {support ? <SupportPanel onReplayGuide={()=>{onOpenChange(false);window.dispatchEvent(new Event('rastercue:show-guide'));}}/> : <div className="grid items-start gap-5 md:grid-cols-2 lg:grid-cols-3">
        {groups.map((controls,group)=><section key={group} className="space-y-5 rounded-lg border border-base-content/15 bg-base-200 p-4"><h2 className="border-b border-base-content/15 pb-3 text-lg font-semibold">{["Output","Processing","Application"][group]}</h2>{controls.map(([control,example],i)=><div className="setting-field" key={i}>{control}<p className="setting-example">{example}</p></div>)}</section>)}
      </div>}
    </div>
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-base-content/15 pt-3"><LogArea logData={logData}/><div className="flex gap-2">{progress?<button className="btn btn-sm" onClick={()=>window.electron.send(ELECTRON_COMMANDS.STOP)}>Cancel job</button>:null}<button className="btn btn-primary btn-sm" onClick={()=>onOpenChange(false)}>Back to workspace</button></div></div>
  </DialogContent></Dialog>;
}
