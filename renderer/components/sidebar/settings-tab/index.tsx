import SelectTheme from "./select-theme";
import { SaveOutputFolderToggle } from "./save-output-folder-toggle";
import { InputGpuId } from "./input-gpu-id";
import { CustomModelsFolderSelect } from "./select-custom-models-folder";
import { LogArea } from "./log-area";
import { SelectImageScale } from "./select-image-scale";
import { SelectImageFormat } from "./select-image-format";
import React, { useEffect, useRef, useState } from "react";
import { useAtom } from "jotai";
import { customModelsPathAtom, scaleAtom } from "@/atoms/user-settings-atom";
import { InputCompression } from "./input-compression";
import OverwriteToggle from "./overwrite-toggle";
import { ResetSettingsButton } from "./reset-settings-button";
import TurnOffNotificationsToggle from "./turn-off-notifications-toggle";
import { InputCustomResolution } from "./input-custom-resolution";
import { InputTileSize } from "./input-tile-size";
import LanguageSwitcher from "./language-switcher";
import { ImageFormat } from "@/lib/valid-formats";
import AutoUpdateToggle from "./auto-update-toggle";
import TTAModeToggle from "./tta-mode-toggle";
import CopyMetadataToggle from "./copy-metadata-toggle";
import AboutDialog from "@/components/rastercue/about-dialog";
interface IProps {
  batchMode:boolean;saveImageAs:ImageFormat;setSaveImageAs:React.Dispatch<React.SetStateAction<ImageFormat>>;
  compression:number;setCompression:React.Dispatch<React.SetStateAction<number>>;
  gpuId:string;setGpuId:React.Dispatch<React.SetStateAction<string>>;
  logData:string[];show?:boolean;setShow?:React.Dispatch<React.SetStateAction<boolean>>;
  setDontShowCloudModal?:React.Dispatch<React.SetStateAction<boolean>>;
}
export default function SettingsTab({batchMode,compression,setCompression,gpuId,setGpuId,saveImageAs,setSaveImageAs,logData}:IProps) {
  const [group,setGroup]=useState(0),[page,setPage]=useState(0),[perPage,setPerPage]=useState(2);
  const body=useRef<HTMLDivElement>(null);
  const [customModelsPath,setCustomModelsPath]=useAtom(customModelsPathAtom);
  const [scale,setScale]=useAtom(scaleAtom);
  useEffect(()=>{
    if(!body.current)return;
    const observer=new ResizeObserver(([e])=>setPerPage(e.contentRect.height<420?1:2));
    observer.observe(body.current);return()=>observer.disconnect();
  },[]);
  useEffect(()=>setPage(0),[group,perPage]);
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
      [<AutoUpdateToggle/>,"Checks Rastercue releases when enabled. Example: disable automatic updates while working offline."],
      [<ResetSettingsButton/>,"Restores application preferences, not images or job history. Example: reset after experimenting with processing settings."],
      [<AboutDialog/>,"Read Rastercue's changelog and upstream licences. Example: check model-rights notices before a paid design job."],
    ],
  ];
  const controls=groups[group],count=Math.ceil(controls.length/perPage);
  return <section className="rastercue-settings">
    <div className="compact-tabs" role="group" aria-label="Settings groups">
      {["Output","Processing","Application"].map((label,i)=><button key={label} aria-pressed={group===i} className={group===i?"active":""} onClick={()=>setGroup(i)}>{label}</button>)}
    </div>
    <div className="rastercue-settings-body" ref={body}>
      {controls.slice(page*perPage,page*perPage+perPage).map(([control,example],i)=><div className="setting-field" key={group+"-"+page+"-"+i}>{control}<p className="setting-example">{example}</p></div>)}
    </div>
    <div className="compact-pagination">
      <button className="btn" disabled={page===0} onClick={()=>setPage(p=>p-1)}>Previous</button>
      <span>{page+1} / {count}</span>
      <button className="btn" disabled={page>=count-1} onClick={()=>setPage(p=>p+1)}>Next</button>
    </div>
    <LogArea logData={logData}/>
  </section>;
}
