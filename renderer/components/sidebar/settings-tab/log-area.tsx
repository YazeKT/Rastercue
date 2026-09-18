import React, { useEffect, useMemo, useRef, useState } from "react";
import { Maximize2, Minimize2, X, Copy, Download, Info, LoaderCircle, CircleCheck, TriangleAlert, CircleX } from "lucide-react";
import { useAtomValue } from "jotai";
import { logTimesAtom } from "@/atoms/log-atom";
export type LogSeverity="info"|"progress"|"success"|"warning"|"error";
const severityIcons={info:Info,progress:LoaderCircle,success:CircleCheck,warning:TriangleAlert,error:CircleX};
export function classifyLog(line:string):LogSeverity {
  if(/error|failed|failure|unsuccessfully|invalid|out of memory|permission denied/i.test(line))return "error";
  if(/warning|unsupported|deprecated|not found/i.test(line))return "warning";
  if(/success|completed|finished|done/i.test(line))return "success";
  if(/\d+(?:\.\d+)?%|processing|upscaling|pass \d|progress/i.test(line))return "progress";
  return "info";
}
function explanation(line:string) {
  if(/vkAllocateMemory|out of memory/i.test(line))return "Native memory allocation failed. Try closing memory-heavy applications and explicitly using a smaller tile setting. Driver/resource limits may also be involved; this is not a confirmed diagnosis.";
  if(/exited unsuccessfully/i.test(line))return "The native job did not finish successfully. No completed output is assumed. Check raw details and retry in a fresh destination.";
  if(/invalid gpu|invalid device/i.test(line))return "The requested GPU is unavailable. Try automatic GPU selection.";
  if(/permission denied|access denied/i.test(line))return "The file or folder is not writable. Choose another destination.";
  if(/\d+(?:\.\d+)?%/.test(line))return "The engine is processing the image.";
  if(/stopping|cancelled|canceled/i.test(line))return "Cancellation was requested.";
  if(/success|completed|finished/i.test(line))return "This operation reported completion.";
  return null;
}
export function LogArea({logData}: {logData:string[];copyOnClickHandler?:()=>void;isCopied?:boolean}) {
  const dialog=useRef<HTMLDialogElement>(null),list=useRef<HTMLDivElement>(null);
  const [query,setQuery]=useState(""),[severity,setSeverity]=useState("all");
  const [follow,setFollow]=useState(true),[max,setMax]=useState(false),[message,setMessage]=useState("");
  const times=useAtomValue(logTimesAtom);
  const rows=useMemo(()=>logData.map((raw,i)=>({raw,i,level:classifyLog(raw),time:times[i]?new Date(times[i]).toLocaleTimeString():"Time unavailable"}))
    .filter(r=>(severity==="all"||r.level===severity)&&r.raw.toLowerCase().includes(query.toLowerCase())),[logData,query,severity,times]);
  useEffect(()=>{if(follow&&list.current)list.current.scrollTop=list.current.scrollHeight;},[rows,follow]);
  async function copy(){try{await navigator.clipboard.writeText(rows.map(r=>r.raw).join("\n"));setMessage("Copied visible logs");}catch{setMessage("Copy unavailable. Select the text or export instead.");}}
  function download(){
    const url=URL.createObjectURL(new Blob([rows.map(r=>r.time+" ["+r.level+"] "+r.raw).join("\n")],{type:"text/plain"}));
    const a=document.createElement("a");a.href=url;a.download="Rastercue-logs-"+new Date().toISOString().replace(/[:.]/g,"-")+".txt";a.click();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  return <div className="rastercue-log-opener">
    <button className="btn w-full" onClick={()=>dialog.current?.showModal()}>Open readable logs <span className="text-xs">({logData.length})</span></button>
    <dialog ref={dialog} className={"rastercue-log-dialog "+(max?"maximized":"")} aria-labelledby="logs-title">
      <div className="log-heading"><h2 id="logs-title">Rastercue logs</h2><div className="compact-actions">
        <button className="btn" aria-label={max?"Restore log window":"Maximize log window"} onClick={()=>setMax(v=>!v)}>{max?<Minimize2 size={16}/>:<Maximize2 size={16}/>}</button>
        <button className="btn" aria-label="Close logs" onClick={()=>dialog.current?.close()}><X size={16}/></button>
      </div></div>
      <p className="setting-example">Local diagnostics. Colours describe message content—not the output stream. Timestamps record when Rastercue received each entry.</p>
      <div className="log-toolbar">
        <input aria-label="Search logs" placeholder="Search logs" value={query} onChange={e=>setQuery(e.target.value)}/>
        <select aria-label="Log severity" value={severity} onChange={e=>setSeverity(e.target.value)}>
          {["all","info","progress","success","warning","error"].map(s=><option key={s} value={s}>{s}</option>)}
        </select>
        <button className="btn" onClick={()=>setFollow(v=>!v)}>{follow?"Pause following":"Follow latest"}</button>
        <button className="btn" onClick={copy}><Copy size={14}/>Copy</button>
        <button className="btn" onClick={download}><Download size={14}/>Export</button>
      </div>
      <div className="log-lines" ref={list}>
        {!rows.length&&<p>No matching logs. Start a job or change the filters.</p>}
        {rows.map(r=>{const Icon=severityIcons[r.level];return <article className={"log-line log-"+r.level} key={r.i}>
          <div><time>{r.time}</time><strong><Icon size={12} aria-hidden="true"/>{r.level}</strong>{explanation(r.raw)&&<span>{explanation(r.raw)}</span>}</div>
          <pre>{r.raw}</pre>
        </article>;})}
      </div>
      <p role="status" className="setting-example">{message||"Drag the bottom-right corner to resize this window. Raw details remain selectable."}</p>
    </dialog>
  </div>;
}
