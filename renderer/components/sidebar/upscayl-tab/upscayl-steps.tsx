import { useAtom, useAtomValue } from "jotai";
import React, { useEffect, useMemo, useState } from "react";
import useLogger from "../../hooks/use-logger";
import { savedOutputPathAtom, progressAtom, rememberOutputFolderAtom, scaleAtom, customWidthAtom, useCustomWidthAtom, saveImageAsAtom } from "../../../atoms/user-settings-atom";
import { ELECTRON_COMMANDS } from "@common/electron-commands";
import { useToast } from "@/components/ui/use-toast";
import { SelectImageScale } from "../settings-tab/select-image-scale";
import { SelectImageFormat } from "../settings-tab/select-image-format";
import SelectModelDialog from "./select-model-dialog";
import { ImageFormat } from "@/lib/valid-formats";
import WorkflowPresets from "./workflow-presets";
interface IProps {
  selectImageHandler:()=>Promise<void>;selectFolderHandler:()=>Promise<void>;upscaylHandler:()=>Promise<void>;
  batchMode:boolean;setBatchMode:React.Dispatch<React.SetStateAction<boolean>>;imagePath:string;
  doubleUpscayl:boolean;setDoubleUpscayl:React.Dispatch<React.SetStateAction<boolean>>;
  dimensions:{width:number|null;height:number|null};
  setSaveImageAs:React.Dispatch<React.SetStateAction<ImageFormat>>;setGpuId:React.Dispatch<React.SetStateAction<string>>;
}
export default function UpscaylSteps({selectImageHandler,selectFolderHandler,upscaylHandler,batchMode,setBatchMode,imagePath,doubleUpscayl,setDoubleUpscayl,dimensions}:IProps) {
  const [scale,setScale]=useAtom(scaleAtom),[outputPath,setOutputPath]=useAtom(savedOutputPathAtom);
  const [progress,setProgress]=useAtom(progressAtom),[format,setFormat]=useAtom(saveImageAsAtom);
  const remember=useAtomValue(rememberOutputFolderAtom),customWidth=useAtomValue(customWidthAtom),custom=useAtomValue(useCustomWidthAtom);
  const [alphaWarning,setAlphaWarning]=useState(false);
  const [compact,setCompact]=useState(false),[page,setPage]=useState(0);
  useEffect(()=>{const update=()=>setCompact(window.innerHeight<650);update();window.addEventListener('resize',update);return()=>window.removeEventListener('resize',update);},[]);
  const {toast}=useToast(),log=useLogger();
  const result=useMemo(()=>{
    if(!dimensions.width||!dimensions.height)return "";
    const factor=Number(scale)**(doubleUpscayl?2:1);
    const width=custom?customWidth:dimensions.width*factor;
    return width+" × "+Math.round(width*dimensions.height/dimensions.width);
  },[dimensions,scale,doubleUpscayl,custom,customWidth]);
  async function chooseOutput(){
    const path=await window.electron.invoke(ELECTRON_COMMANDS.SELECT_FOLDER);
    if(path!==null){log("Setting Output Path:",path);setOutputPath(path);}else setOutputPath(null);
  }
  function start(){
    if(!outputPath){toast({description:"Choose an output folder before upscaling."});return;}
    if(format==="jpg"&&(batchMode||/\.(png|webp|gif|tiff?)$/i.test(imagePath))){setAlphaWarning(true);return;}
    void upscaylHandler();
  }
  return <section className="rastercue-steps">
    {compact&&<div className="compact-tabs" aria-label="Workflow pages"><button className={page===0?'active':''} onClick={()=>setPage(0)}>Input & model</button><button className={page===1?'active':''} onClick={()=>setPage(1)}>Output</button></div>}
    {(!compact||page===0)&&<>
    <WorkflowPresets/>
    <div className="compact-actions">
      <label className="compact-toggle"><input type="checkbox" checked={batchMode} disabled={!!progress} onChange={()=>{
        if(!remember)setOutputPath("");setProgress("");setBatchMode(v=>!v);
      }}/>Batch mode</label>
      {!batchMode&&<label className="compact-toggle"><input type="checkbox" checked={doubleUpscayl} disabled={!!progress} onChange={e=>setDoubleUpscayl(e.target.checked)}/>Double pass</label>}
    </div>
    <p className="setting-example">Batch: a folder. Double: two passes, e.g. 4× → 16×.</p>
    <div className="workflow-field"><label>Input {batchMode?"folder":"image"}</label>
      <button className="btn w-full" disabled={!!progress} onClick={batchMode?selectFolderHandler:selectImageHandler}>{batchMode?"Select folder":"Select image"}</button>
      <p className="setting-example path-label" title={imagePath}>{imagePath?imagePath.split(/[\\/]/).pop():"Example: choose a small photo or illustration."}</p>
    </div>
    <div className="workflow-field"><label>Upscaling model</label><SelectModelDialog/></div>
    </>}
    {(!compact||page===1)&&<>
    <div className="workflow-field"><SelectImageScale scale={scale} setScale={setScale} hideInfo/>
      <p className="setting-example">{result?dimensions.width+" × "+dimensions.height+" → "+result:"Example: 500px × 4 = 2000px."}</p>
    </div>
    <div className="workflow-field"><SelectImageFormat batchMode={batchMode} saveImageAs={format} setExportType={f=>setFormat(f as ImageFormat)}/>
      <p className="setting-example">{format==="jpg"?"JPG is compact but removes transparency. Use PNG for cutouts.":"PNG retains transparency; WebP supports compact delivery."}</p>
    </div>
    <div className="workflow-field"><label>Output destination</label><button className="btn w-full" disabled={!!progress} onClick={chooseOutput}>Choose output folder</button>
      <p className="setting-example path-label" title={outputPath||""}>{outputPath||"Example: your project delivery folder."}</p>
    </div>
    </>}
    <div className="workflow-submit">
      <p className="job-progress" role="status">{progress||"Ready when you are"}</p>
      {progress?<button className="btn w-full" onClick={()=>window.electron.send(ELECTRON_COMMANDS.STOP)}>Cancel job</button>
        :<button className="btn btn-primary w-full" onClick={start}>Start upscale</button>}
    </div>
    {alphaWarning&&<div className="format-warning" role="alert">
      <p>JPG cannot retain transparency. Transparent areas are placed on white using a temporary RGB input; your source stays unchanged. Choose PNG to retain transparency.</p>
      <div className="compact-actions"><button className="btn" onClick={()=>{setFormat("png");setAlphaWarning(false);}}>Choose PNG</button>
      <button className="btn" onClick={()=>{setAlphaWarning(false);void upscaylHandler();}}>Continue JPG</button></div>
      <button className="btn" onClick={()=>setAlphaWarning(false)}>Back</button>
    </div>}
  </section>;
}
