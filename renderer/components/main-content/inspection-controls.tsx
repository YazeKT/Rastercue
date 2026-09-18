import { useAtom } from "jotai";
import { inspectionAtom, inspectionBookmarksAtom } from "@/atoms/inspection-atom";
import { useState } from "react";
import { Bookmark, Trash2 } from "lucide-react";

export default function InspectionControls() {
  const [view, setView] = useAtom(inspectionAtom);
  const [bookmarks, setBookmarks] = useAtom(inspectionBookmarksAtom);
  const [name, setName] = useState("");
  const [bookmarkPage,setBookmarkPage]=useState(0);
  const zoom = view.fit ? view.fitZoom : view.zoom;
  return <div className="inspection-controls">
    <label htmlFor="inspection-zoom">Zoom (%)</label>
    <input id="inspection-zoom" type="number" min="5" max="1600" step="5"
      value={Math.round(zoom)} onChange={e => setView(v => ({ ...v, fit: false, zoom: Math.max(5, Math.min(1600, Number(e.target.value) || 5)) }))} />
    <div className="compact-actions">
      <button className="btn" onClick={() => setView(v => ({ ...v, fit: true, x: 0, y: 0 }))}>Fit</button>
      <button className="btn" onClick={() => setView(v => ({ ...v, fit: false, zoom: 100, x: 0, y: 0 }))}>100%</button>
      <button className="btn" onClick={() => setView(v => ({ ...v, fit: true, x: 0, y: 0 }))}>Reset</button>
    </div>
    <p className="setting-example">Fit shows the whole image. 100% shows one output pixel per interface pixel; system scaling affects physical display size.</p>
    <p className="setting-example">Scroll to zoom at the pointer. Drag the image to pan; drag the divider to compare.</p>
    <label htmlFor="bookmark-name">Inspection bookmarks</label>
    <div className="compact-actions">
      <input id="bookmark-name" maxLength={40} placeholder="e.g. Face or lettering" value={name} onChange={e => setName(e.target.value)} />
      <button className="btn" aria-label="Save inspection bookmark" disabled={!name.trim() || bookmarks.length >= 6}
        onClick={() => { setBookmarks(b => [...b, { name: name.trim(), view: { ...view, zoom, fit: false } }]); setName(""); }}><Bookmark size={16}/></button>
    </div>
    <p className="setting-example">Save up to six areas for this image. Bookmarks reset with a new image.</p>
    {bookmarks.slice(bookmarkPage*2,bookmarkPage*2+2).map((b, n) => {const i=bookmarkPage*2+n;return <div className="compact-actions" key={i}>
      <button className="btn bookmark-name" onClick={() => setView(b.view)}>{b.name}</button>
      <button className="btn" aria-label={"Remove " + b.name} onClick={() => setBookmarks(bs => bs.filter((_, n) => n !== i))}><Trash2 size={14}/></button>
    </div>})}
    {bookmarks.length>2&&<div className="compact-pagination"><button className="btn" disabled={bookmarkPage===0} onClick={()=>setBookmarkPage(p=>p-1)}>Previous</button><span>{bookmarkPage+1} / {Math.ceil(bookmarks.length/2)}</span><button className="btn" disabled={(bookmarkPage+1)*2>=bookmarks.length} onClick={()=>setBookmarkPage(p=>p+1)}>Next</button></div>}
  </div>;
}
