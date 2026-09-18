import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import RastercueLogo from '../icons/rastercue-logo';
import LanguageSwitcher from '../sidebar/settings-tab/language-switcher';
import SelectTheme from '../sidebar/settings-tab/select-theme';

const completionKey = 'rastercueGettingStarted.v1';
const steps = [
  ['Welcome to Rastercue', 'Your local image-upscaling workspace by Yaze Media, built on Upscayl’s proven engine.', 'This short guide covers selecting, upscaling and inspecting images. Replay it at any time from Settings → Support.'],
  ['Choose your image & model', 'Select an image on the left, or choose batch mode for a folder. Open the model library for guidance, limits and licence notices.', 'Example: start with Standard for a photograph or Digital Art for an illustration. Check model rights before client work.'],
  ['Set your output', 'Choose the scale, format and destination before starting. Settings opens one large panel with all your preferences.', 'Example: 500 × 500 pixels at 4× becomes 2000 × 2000. Choose PNG for transparency, or JPG for an opaque photo.'],
  ['Start, follow & stop', 'Click Upscale to begin. Follow progress and Current Job on the right. Stop requests cancellation; files already written are kept.', 'Example: stop a batch after a few images. Completed outputs stay in the destination; a partially written file is not a verified finished image.'],
  ['Inspect & keep a record', 'Move the before/after divider, use wheel zoom and drag to pan. Check sizes in Current Job and revisit jobs through History.', 'Example: inspect hair, text or edges to compare detail. Support contains this guide, licences, GitHub links and update controls.'],
];
export function OnboardingDialog() {
  const [open,setOpen]=useState(false);
  const [step,setStep]=useState(0);
  useEffect(()=>{
    // Preserve the original welcome acknowledgement; version the new guided tour independently.
    try { setOpen(localStorage.getItem(completionKey)!=='completed'); } catch { setOpen(true); }
    const replay=()=>{setStep(0);setOpen(true);};
    window.addEventListener('rastercue:show-guide',replay);
    return()=>window.removeEventListener('rastercue:show-guide',replay);
  },[]);
  const finish=()=>{
    try { localStorage.setItem(completionKey,'completed');localStorage.setItem('rastercueWelcomeSeen','true'); } catch { /* Allow use if preference storage is unavailable. */ }
    setOpen(false);
  };
  const [title,description,example]=steps[step];
  return <Dialog open={open} onOpenChange={value=>value?setOpen(true):finish()}><DialogContent className="w-[92vw] max-w-2xl max-h-[90vh] overflow-y-auto bg-base-100 text-base-content">
    <DialogHeader><div className="flex items-center gap-3"><RastercueLogo className="w-10 h-10 text-primary"/><span className="text-xs uppercase tracking-widest opacity-70">Getting started · {step+1} of {steps.length}</span></div><DialogTitle>{title}</DialogTitle><DialogDescription>{description}</DialogDescription></DialogHeader>
    <ol className="flex gap-2" aria-label="Guide progress">{steps.map(([label],index)=><li key={label} className={`h-1.5 flex-1 rounded ${index<=step?'bg-primary':'bg-base-content/20'}`} aria-current={index===step?'step':undefined}><span className="sr-only">{label}</span></li>)}</ol>
    <p className="rounded-lg border border-primary/30 bg-base-200 p-4 text-sm">{example}</p>
    {step===0?<div className="grid gap-4 sm:grid-cols-2"><LanguageSwitcher/><SelectTheme/></div>:null}
    <p className="text-xs opacity-75">Images and history remain local. No telemetry or automatic image uploads. Disable GitHub update checks in Support for offline work.</p>
    <div className="flex flex-wrap items-center justify-between gap-3"><button className="btn btn-sm btn-ghost" onClick={finish}>Skip guide</button><div className="flex gap-2"><button className="btn btn-sm" disabled={step===0} onClick={()=>setStep(previous=>previous-1)}>Back</button>{step===steps.length-1?<button className="btn btn-sm btn-primary" onClick={finish}>Open workspace</button>:<button className="btn btn-sm btn-primary" onClick={()=>setStep(previous=>previous+1)}>Next</button>}</div></div>
  </DialogContent></Dialog>;
}
