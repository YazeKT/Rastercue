import { useAtom, useSetAtom, useAtomValue } from "jotai";
import { inspectionAtom, inspectionBookmarksAtom } from "@/atoms/inspection-atom";
import { viewTypeAtom } from "@/atoms/user-settings-atom";
import { useEffect, useRef, useState } from "react";
import { ChevronsLeftRight } from "lucide-react";
import { fitZoom as calculateFitZoom, zoomAtPointer } from "@/lib/inspection-geometry";

export default function InspectionView({ source, output, setDimensions }: {
  source: string; output?: string; setDimensions?: (d: {width:number; height:number}) => void;
}) {
  const host = useRef<HTMLDivElement>(null);
  const [view, setView] = useAtom(inspectionAtom);
  const clearBookmarks = useSetAtom(inspectionBookmarksAtom);
  const lens = useAtomValue(viewTypeAtom) === "lens";
  const [size, setSize] = useState({ width: 1, height: 1 });
  const [pixels, setPixels] = useState({ width: 1, height: 1 });
  const [divider, setDivider] = useState(50);
  const [pointer, setPointer] = useState<{x:number;y:number}|null>(null);
  const gesture = useRef<{ mode: "pan"|"divider"; x: number; y:number; startX:number; startY:number }|null>(null);
  useEffect(() => {
    setView(v => ({ ...v, fit: true, x: 0, y: 0 }));
    clearBookmarks([]);
    setDivider(50);
  }, [source]);
  useEffect(() => {
    if (!host.current) return;
    const observer = new ResizeObserver(([entry]) => setSize({ width: entry.contentRect.width, height: entry.contentRect.height }));
    observer.observe(host.current);
    return () => observer.disconnect();
  }, []);
  const fitZoom = calculateFitZoom(size,pixels);
  useEffect(() => { setView(v => Math.abs(v.fitZoom-fitZoom)<0.01 ? v : ({...v,fitZoom})); }, [fitZoom]);
  const scale = (view.fit ? fitZoom : view.zoom) / 100;
  const width = pixels.width * scale, height = pixels.height * scale;
  const left = (size.width-width)/2 + view.x, top = (size.height-height)/2 + view.y;
  const imageStyle = { position: "absolute" as const, width, height, maxWidth: "none", left, top, pointerEvents: "none" as const };
  return <div ref={host} className="inspection-canvas" tabIndex={0} aria-label="Image inspection canvas"
    onDoubleClick={e => e.stopPropagation()}
    onKeyDown={e => {
      if (e.key === "0") setView(v => ({...v,fit:true,x:0,y:0}));
      if (e.key === "1") setView(v => ({...v,fit:false,zoom:100,x:0,y:0}));
      const movement = {ArrowLeft:[30,0],ArrowRight:[-30,0],ArrowUp:[0,30],ArrowDown:[0,-30]}[e.key];
      if(movement) {e.preventDefault();setView(v=>({...v,x:v.x+movement[0],y:v.y+movement[1]}));}
    }}
    onWheel={e => {
      e.preventDefault();
      const rect=host.current!.getBoundingClientRect();
      const px=e.clientX-rect.left-size.width/2, py=e.clientY-rect.top-size.height/2;
      const oldZoom=view.fit?fitZoom:view.zoom;
      const next=zoomAtPointer(oldZoom,oldZoom*Math.exp(-e.deltaY*0.002),view.x,view.y,px,py);
      setView(v=>({...v,fit:false,...next}));
    }}
    onPointerDown={e => {
      if(e.button!==0 || (e.target as HTMLElement).closest(".comparison-divider")) return;
      host.current!.setPointerCapture(e.pointerId);
      gesture.current={mode:"pan",x:e.clientX,y:e.clientY,startX:view.x,startY:view.y};
    }}
    onPointerMove={e => {
      const rect=host.current!.getBoundingClientRect();
      setPointer({x:e.clientX-rect.left,y:e.clientY-rect.top});
      const drag=gesture.current;
      if(!drag) return;
      if(drag.mode==="divider") setDivider(Math.max(0,Math.min(100,(e.clientX-rect.left)/rect.width*100)));
      else setView(v=>({...v,x:drag.startX+e.clientX-drag.x,y:drag.startY+e.clientY-drag.y}));
    }}
    onPointerUp={() => {gesture.current=null;}}
    onPointerCancel={() => {gesture.current=null;}}
    onLostPointerCapture={() => {gesture.current=null;}}
    onPointerLeave={() => setPointer(null)}>
    <img src={"file:///"+source} alt="Original" draggable={false} style={imageStyle}
      onLoad={e => {
        const d={width:e.currentTarget.naturalWidth,height:e.currentTarget.naturalHeight};
        setDimensions?.(d);
        setPixels(current => !output || current.width === 1 ? d : current);
      }}/>
    {output && <>
      <div className="comparison-after" style={{clipPath:"inset(0 0 0 "+divider+"%)"}}>
        <img src={"file:///"+output} alt="Upscaled" draggable={false} style={imageStyle}
          onLoad={e => setPixels({width:e.currentTarget.naturalWidth,height:e.currentTarget.naturalHeight})}/>
      </div>
      <button className="comparison-divider" style={{left:divider+"%"}} aria-label="Before and after divider"
        onPointerDown={e=>{
          e.stopPropagation();host.current!.setPointerCapture(e.pointerId);
          gesture.current={mode:"divider",x:0,y:0,startX:0,startY:0};
        }}
        onKeyDown={e=>{
          if(e.key==="ArrowLeft"||e.key==="ArrowRight") {e.preventDefault();e.stopPropagation();setDivider(d=>Math.max(0,Math.min(100,d+(e.key==="ArrowLeft"?-2:2))));}
        }}><span><ChevronsLeftRight size={20}/></span></button>
      <span className="image-label original-label">Before</span><span className="image-label output-label">After</span>
      {lens && pointer && <div className="inspection-lens" style={{
        left:pointer.x-70,top:pointer.y-70,
        backgroundImage:'url("file:///'+output+'")',backgroundRepeat:"no-repeat",
        backgroundSize:(width*2)+"px "+(height*2)+"px",
        backgroundPosition:(70-(pointer.x-left)*2)+"px "+(70-(pointer.y-top)*2)+"px"
      }}/>}
    </>}
    {!output && <span className="image-label waiting-label">Original · comparison available after upscaling</span>}
  </div>;
}
