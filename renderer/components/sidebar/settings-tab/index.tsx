import SelectTheme from "./select-theme";
import { SaveOutputFolderToggle } from "./save-output-folder-toggle";
import { CustomModelsFolderSelect } from "./select-custom-models-folder";
import { LogArea } from "./log-area";
import { SelectImageScale } from "./select-image-scale";
import { SelectImageFormat } from "./select-image-format";
import React, { useEffect, useRef, useState } from "react";
import { useAtom, useAtomValue } from "jotai";
import { customModelsPathAtom, scaleAtom, progressAtom } from "@/atoms/user-settings-atom";
import type { ComputeBackendId } from "@common/hardware-types";
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
import HardwareSoftwarePanel from "@/components/rastercue/hardware-software-panel";
import InfoPopover from "@/components/ui/info-popover";
import { ComputeDeviceSelect } from "./compute-device-select";
interface IProps {
  batchMode:boolean;saveImageAs:ImageFormat;setSaveImageAs:React.Dispatch<React.SetStateAction<ImageFormat>>;
  compression:number;setCompression:React.Dispatch<React.SetStateAction<number>>;
  gpuId:string;setGpuId:React.Dispatch<React.SetStateAction<string>>;
  backendId:ComputeBackendId;setBackendId:React.Dispatch<React.SetStateAction<ComputeBackendId>>;
  logData:string[];show?:boolean;setShow?:React.Dispatch<React.SetStateAction<boolean>>;
  setDontShowCloudModal?:React.Dispatch<React.SetStateAction<boolean>>;
  open:boolean; onOpenChange:(open:boolean)=>void;
}
export default function SettingsTab({batchMode,compression,setCompression,gpuId,setGpuId,backendId,setBackendId,saveImageAs,setSaveImageAs,logData,open,onOpenChange}:IProps) {
  type SectionId="overview"|"hardware"|"output"|"processing"|"application"|"support";
  const [section,setSection]=useState<SectionId>("overview");
  const scrollRef=useRef<HTMLDivElement>(null);
  const sectionRefs=useRef<Record<SectionId,HTMLElement|null>>({overview:null,hardware:null,output:null,processing:null,application:null,support:null});
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
      [<ComputeDeviceSelect value={{backendId,deviceId:gpuId}} onChange={selection=>{setBackendId(selection.backendId);setGpuId(selection.deviceId);}}/>,"Selects the protected Vulkan path or genuine CPU inference explicitly. Rastercue never switches compute backends without your choice."],
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
  const names=["Output & metadata","Processing","Application"];
  const keys=["output","processing","application"] as const;
  const navItems:[SectionId,string][]=[['overview','Overview'],['hardware','Hardware & software'],['output','Output & metadata'],['processing','Processing'],['application','Application'],['support','Support & about']];
  const scrollToSection=(id:SectionId)=>{
    setSection(id);
    sectionRefs.current[id]?.scrollIntoView({behavior:'smooth',block:'start'});
  };
  useEffect(()=>{
    if(!open)return;
    const root=scrollRef.current;
    if(!root)return;
    const observer=new IntersectionObserver((entries)=>{
      const visible=entries.filter(entry=>entry.isIntersecting).sort((a,b)=>{
        const distanceA=Math.abs(a.boundingClientRect.top-root.getBoundingClientRect().top);
        const distanceB=Math.abs(b.boundingClientRect.top-root.getBoundingClientRect().top);
        return distanceA-distanceB;
      });
      const id=visible[0]?.target.getAttribute('data-settings-section') as SectionId|undefined;
      if(id)setSection(id);
    },{root,rootMargin:'-8% 0px -72% 0px',threshold:[0,0.01,0.2]});
    navItems.forEach(([id])=>{const target=sectionRefs.current[id];if(target)observer.observe(target);});
    return()=>observer.disconnect();
  },[open]);
  const renderGroup=(group:number,id:SectionId)=><section ref={node=>{sectionRefs.current[id]=node;}} data-settings-section={id} id={`settings-${id}`} className="scroll-mt-4 space-y-5 border-t border-base-content/15 pt-7"><header><h2 className="text-xl font-semibold">{names[group]}</h2><p className="mt-1 text-sm opacity-65">Changes save automatically and apply to the next job.</p></header><div className="grid gap-3 lg:grid-cols-2">{groups[group].map(([control,example],i)=><div className="setting-field relative rounded-xl border border-base-content/15 bg-base-200 p-4 pr-12" key={i}>{control}<div className="absolute right-3 top-3"><InfoPopover label={`${names[group]} help`}>{example}</InfoPopover></div></div>)}</div></section>;
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="flex h-[92vh] max-h-[900px] w-[96vw] max-w-[1180px] flex-col gap-4 overflow-hidden bg-base-100 text-base-content">
    <DialogHeader><DialogTitle>Settings & support</DialogTitle><DialogDescription>Hardware, processing, storage, appearance, updates, and support in one workspace.</DialogDescription></DialogHeader>
    <div className="grid min-h-0 flex-1 gap-4 md:grid-cols-[190px_minmax(0,1fr)]">
      <nav className="flex gap-2 overflow-x-auto border-b border-base-content/15 pb-3 md:flex-col md:overflow-y-auto md:border-b-0 md:border-r md:pb-0 md:pr-4" aria-label="Settings sections">{navItems.map(([id,label])=><button key={id} className={`min-h-11 whitespace-nowrap rounded-lg px-3 text-left text-sm font-medium transition ${section===id?'bg-primary text-primary-content':'hover:bg-base-200 focus-visible:ring-2 focus-visible:ring-primary'}`} aria-current={section===id?'location':undefined} onClick={()=>scrollToSection(id)}>{label}</button>)}</nav>
      <div ref={scrollRef} className="min-h-0 scroll-smooth overflow-y-auto pr-2" tabIndex={0} aria-label="Settings content">
        <div className="space-y-8 pb-8">
          <section ref={node=>{sectionRefs.current.overview=node;}} data-settings-section="overview" id="settings-overview" className="scroll-mt-4 space-y-5"><div><h2 className="text-xl font-semibold">Studio setup at a glance</h2><p className="mt-1 max-w-2xl text-sm opacity-70">Review the verified compute path first, then tune output and processing. Rastercue preserves the original Upscayl Vulkan path as its compatibility baseline.</p></div><div className="grid gap-3 lg:grid-cols-2">{keys.map((key,index)=><button key={key} className="rounded-xl border border-base-content/15 bg-base-200 p-5 text-left transition hover:border-primary/60 focus-visible:ring-2 focus-visible:ring-primary" onClick={()=>scrollToSection(key)}><span className="text-lg font-semibold">{names[index]}</span><span className="mt-2 block text-sm opacity-65">{groups[index].length} settings · scroll to review</span></button>)}<button className="rounded-xl border border-primary/30 bg-primary/10 p-5 text-left transition hover:border-primary focus-visible:ring-2 focus-visible:ring-primary" onClick={()=>scrollToSection('hardware')}><span className="text-lg font-semibold">Hardware & software</span><span className="mt-2 block text-sm opacity-70">Detected hardware, engine-verified Vulkan devices, versions, and hashes</span></button></div></section>
          <section ref={node=>{sectionRefs.current.hardware=node;}} data-settings-section="hardware" id="settings-hardware" className="scroll-mt-4 border-t border-base-content/15 pt-7"><HardwareSoftwarePanel/></section>
          {renderGroup(0,'output')}{renderGroup(1,'processing')}{renderGroup(2,'application')}
          <section ref={node=>{sectionRefs.current.support=node;}} data-settings-section="support" id="settings-support" className="scroll-mt-4 border-t border-base-content/15 pt-7"><SupportPanel onReplayGuide={()=>{onOpenChange(false);window.dispatchEvent(new Event('rastercue:show-guide'));}}/></section>
        </div>
      </div>
    </div>
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-base-content/15 pt-3"><LogArea logData={logData}/><div className="flex gap-2">{progress?<button className="btn btn-sm" onClick={()=>window.electron.send(ELECTRON_COMMANDS.STOP)}>Cancel job</button>:null}<button className="btn btn-primary btn-sm" onClick={()=>onOpenChange(false)}>Back to workspace</button></div></div>
  </DialogContent></Dialog>;
}
