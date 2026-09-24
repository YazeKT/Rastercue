import { viewTypeAtom, userStatsAtom } from "@/atoms/user-settings-atom";
import { useAtom, useAtomValue, useStore } from "jotai";
import * as settingsAtoms from "@/atoms/user-settings-atom";
import { customModelIdsAtom } from "@/atoms/models-list-atom";
import { MODELS } from "@common/models-list";
import { JobSettings } from "@common/rastercue-types";
import { useState } from "react";
import InspectionControls from "./inspection-controls";
import CurrentJobPanel from "@/components/rastercue/current-job-panel";
import HistoryDialog from "@/components/rastercue/history-dialog";
const duration=(ms:number)=>ms<60000?(ms/1000).toFixed(1)+"s":Math.floor(ms/60000)+"m "+Math.round(ms%60000/1000)+"s";
export default function MoreOptionsDrawer({resetImagePaths}: {
  zoomAmount?:string;setZoomAmount?:(arg:any)=>void;resetImagePaths:()=>void;
}) {
  const [tab,setTab]=useState(0),[history,setHistory]=useState(false);
  const [viewType,setViewType]=useAtom(viewTypeAtom);
  const stats=useAtomValue(userStatsAtom);
  const customIds=useAtomValue(customModelIdsAtom);
  const store=useStore();
  async function restore(saved:JobSettings) {
    if(store.get(settingsAtoms.progressAtom)){window.alert("Wait for the current job to finish before restoring settings.");return;}
    const model=String(saved.model||"");
    let available=false;
    try {available=model in MODELS ? (await window.electron.getBuiltInModels())[model]===true : customIds.includes(model);} catch {window.alert('Could not verify model availability. No settings were changed.');return;}
    if(store.get(settingsAtoms.progressAtom)){window.alert('Wait for the current job to finish. No settings were changed.');return;}
    if(!available){
      window.alert("This model is missing. Import it before restoring this job's settings. No settings were changed.");return;
    }
    store.set(settingsAtoms.selectedModelIdAtom,model);
    if(typeof saved.scale==="string")store.set(settingsAtoms.scaleAtom,saved.scale);
    if(["jpg","png","webp"].includes(String(saved.saveImageAs)))store.set(settingsAtoms.saveImageAsAtom,saved.saveImageAs as "jpg"|"png"|"webp");
    store.set(settingsAtoms.doubleUpscaylAtom,!!saved.doubleUpscayl);
    store.set(settingsAtoms.gpuIdAtom,saved.gpuId==null?"":String(saved.gpuId));
    if(["original-vulkan","rastercue-vulkan","cpu"].includes(String(saved.backendId)))store.set(settingsAtoms.computeBackendAtom,saved.backendId as "original-vulkan"|"rastercue-vulkan"|"cpu");
    store.set(settingsAtoms.compressionAtom,Number(saved.compression)||0);
    store.set(settingsAtoms.customWidthAtom,Number(saved.customWidth)||0);
    store.set(settingsAtoms.useCustomWidthAtom,!!saved.useCustomWidth);
    store.set(settingsAtoms.tileSizeAtom,saved.tileSize==null?null:Number(saved.tileSize));
    store.set(settingsAtoms.ttaModeAtom,!!saved.ttaMode);
    store.set(settingsAtoms.copyMetadataAtom,!!saved.copyMetadata);
    store.set(settingsAtoms.noImageProcessingAtom,!!saved.noImageProcessing);
    store.set(settingsAtoms.overwriteAtom,!!saved.overwrite);
    setHistory(false);
    window.alert("Processing settings restored. Input files and destination are unchanged. Review the controls before starting.");
  }
  const items=[["Total jobs",stats.totalUpscayls],["Batch jobs",stats.batchUpscayls],["Single images",stats.imageUpscayls],["Double upscale",stats.doubleUpscayls],["Average time",duration(stats.averageUpscaylTime)],["Last duration",duration(stats.lastUpscaylDuration)],["Last used",stats.lastUsedAt?new Date(stats.lastUsedAt).toLocaleString():"Not yet"]];
  return <aside className="rastercue-tools" aria-label="Inspection and job tools" onDoubleClick={e=>e.stopPropagation()}>
    <h2>Workspace tools</h2>
    <div className="compact-tabs" role="group" aria-label="Tools">
      {["Inspect","Job","Stats"].map((label,i)=><button key={label} aria-pressed={tab===i} className={tab===i?"active":""} onClick={()=>setTab(i)}>{label}</button>)}
    </div>
    <div className="rastercue-tool-content">
      {tab===0&&<>
        <InspectionControls/>
        <label className="compact-toggle"><input type="checkbox" checked={viewType==="lens"} onChange={e=>setViewType(e.target.checked?"lens":"slider")}/> Detail lens</label>
        <p className="setting-example">Adds a 2× lens over the comparison. Example: inspect a face without losing the slider.</p>
        <button className="btn w-full" onClick={resetImagePaths}>Clear preview</button>
      </>}
      {tab===1&&<CurrentJobPanel/>}
      {tab===2&&<dl className="compact-stats">{items.map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>}
    </div>
    <button className="btn" onClick={()=>setHistory(true)}>Open job history</button>
    <p className="setting-example">Saved locally. Your source images stay untouched.</p>
    <HistoryDialog open={history} onClose={()=>setHistory(false)} onRestore={restore}/>
  </aside>;
}
