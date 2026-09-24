import { useAtom, useAtomValue } from "jotai";
import React, { useMemo, useState } from "react";
import useLogger from "../../hooks/use-logger";
import {
  savedOutputPathAtom, progressAtom, rememberOutputFolderAtom, scaleAtom,
  customWidthAtom, useCustomWidthAtom, saveImageAsAtom,
} from "../../../atoms/user-settings-atom";
import { ELECTRON_COMMANDS } from "@common/electron-commands";
import { useToast } from "@/components/ui/use-toast";
import { SelectImageScale } from "../settings-tab/select-image-scale";
import { SelectImageFormat } from "../settings-tab/select-image-format";
import SelectModelDialog from "./select-model-dialog";
import { ImageFormat } from "@/lib/valid-formats";
import WorkflowPresets from "./workflow-presets";
import InfoPopover from "@/components/ui/info-popover";

interface IProps {
  selectImageHandler:()=>Promise<void>; selectFolderHandler:()=>Promise<void>; upscaylHandler:()=>Promise<void>;
  batchMode:boolean; setBatchMode:React.Dispatch<React.SetStateAction<boolean>>; imagePath:string;
  doubleUpscayl:boolean; setDoubleUpscayl:React.Dispatch<React.SetStateAction<boolean>>;
  dimensions:{width:number|null;height:number|null};
  setSaveImageAs:React.Dispatch<React.SetStateAction<ImageFormat>>; setGpuId:React.Dispatch<React.SetStateAction<string>>;
}

export default function UpscaylSteps({selectImageHandler,selectFolderHandler,upscaylHandler,batchMode,setBatchMode,imagePath,doubleUpscayl,setDoubleUpscayl,dimensions}:IProps) {
  const [scale,setScale]=useAtom(scaleAtom),[outputPath,setOutputPath]=useAtom(savedOutputPathAtom);
  const [progress,setProgress]=useAtom(progressAtom),[format,setFormat]=useAtom(saveImageAsAtom);
  const [customWidth]=useAtom(customWidthAtom),[useCustomWidth]=useAtom(useCustomWidthAtom);
  const remember=useAtomValue(rememberOutputFolderAtom);
  const [alphaWarning,setAlphaWarning]=useState(false);
  const {toast}=useToast(),log=useLogger();
  const result=useMemo(()=>{
    if(!dimensions.width||!dimensions.height)return "";
    const factor=Number(scale)**(doubleUpscayl?2:1);
    const width=useCustomWidth?customWidth:dimensions.width*factor;
    return width+" × "+Math.round(width*dimensions.height/dimensions.width);
  },[dimensions,scale,doubleUpscayl,useCustomWidth,customWidth]);
  async function chooseOutput(){
    const path=await window.electron.invoke(ELECTRON_COMMANDS.SELECT_FOLDER);
    if(path!==null){log("Setting Output Path:",path);setOutputPath(path);}else setOutputPath(null);
  }
  function start(){
    if(!outputPath){toast({description:"Choose an output folder before upscaling."});return;}
    if(useCustomWidth&&(!customWidth||customWidth<1)){toast({description:"Enter a valid custom pixel width in Settings."});return;}
    if(format==="jpg"&&(batchMode||/\.(png|webp|gif|tiff?)$/i.test(imagePath))){setAlphaWarning(true);return;}
    void upscaylHandler();
  }
  return <section className="rastercue-steps">
    <div className="workflow-section-label">Input</div>
      <WorkflowPresets/>
      <div className="compact-actions">
        <label className="compact-toggle"><input type="checkbox" checked={batchMode} disabled={!!progress} onChange={()=>{if(!remember)setOutputPath("");setProgress("");setBatchMode(v=>!v);}}/>Batch mode</label>
        {!batchMode&&<label className="compact-toggle"><input type="checkbox" checked={doubleUpscayl} disabled={!!progress} onChange={e=>setDoubleUpscayl(e.target.checked)}/>Double pass</label>}
        <InfoPopover label="Job mode">Batch processes a folder. Double pass runs the selected model twice and can require much more time and memory.</InfoPopover>
      </div>
      <div className="workflow-field"><div className="field-heading"><label>Input {batchMode?"folder":"image"}</label><InfoPopover label="Input">Rastercue never overwrites the source. Choose one image, or enable Batch mode to select a folder.</InfoPopover></div>
        <button className="btn w-full" disabled={!!progress} onClick={batchMode?selectFolderHandler:selectImageHandler}>{batchMode?"Select folder":"Select image"}</button>
        <p className="setting-example path-label" title={imagePath}>{imagePath?imagePath.split(/[\\/]/).pop():"No input selected"}</p>
      </div>
      <div className="workflow-field"><div className="field-heading"><label>Upscaling model</label><InfoPopover label="Upscaling model">Models suit different source material. Open the library to compare intended use, limitations, availability and rights.</InfoPopover></div><SelectModelDialog/></div>
    <div className="workflow-section-label">Output</div>
      <div className="workflow-field">
        <div className="field-heading"><span>Pixel scale</span><InfoPopover label="Pixel scale">Multiplies the source pixel dimensions. Double pass applies the scale twice.</InfoPopover></div><SelectImageScale scale={scale} setScale={setScale} hideInfo/>
        <p className="setting-example">{result?`${dimensions.width} × ${dimensions.height} → ${result} px`:"Choose an image to preview output dimensions."}</p>
      </div>
      <div className="workflow-field"><div className="field-heading"><span>Export format</span><InfoPopover label="Export format">PNG retains transparency. JPG is compact but has no alpha channel. WebP suits digital delivery. AVIF and single-page RGB/sRGB TIFF use a bounded PNG working image around the preserved engine.</InfoPopover></div><SelectImageFormat batchMode={batchMode} saveImageAs={format} setExportType={f=>setFormat(f as ImageFormat)}/></div>
      <div className="workflow-field"><div className="field-heading"><label>Output destination</label><InfoPopover label="Output destination">Completed files are written here. Rastercue keeps the selected source unchanged.</InfoPopover></div><button className="btn w-full" disabled={!!progress} onClick={chooseOutput}>Choose output folder</button>
        <p className="setting-example path-label" title={outputPath||""}>{outputPath||"No output folder selected"}</p>
      </div>
    <div className="workflow-submit">
      <p className="job-progress" role="status" aria-live="polite">{progress||"Ready when you are"}</p>
      {progress?<button className="btn w-full" onClick={()=>window.electron.send(ELECTRON_COMMANDS.STOP)}>Cancel job</button>:<button className="btn btn-primary w-full" onClick={start}>Start upscale</button>}
    </div>
    {alphaWarning&&<div className="format-warning" role="alert"><p>JPG cannot retain transparency. Transparent areas are placed on white using a temporary RGB input; your source stays unchanged. Choose PNG to retain transparency.</p><div className="compact-actions"><button className="btn" onClick={()=>{setFormat("png");setAlphaWarning(false);}}>Choose PNG</button><button className="btn" onClick={()=>{setAlphaWarning(false);void upscaylHandler();}}>Continue JPG</button></div><button className="btn" onClick={()=>setAlphaWarning(false)}>Back</button></div>}
  </section>;
}
