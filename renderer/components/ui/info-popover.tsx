import { Info } from "lucide-react";
import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

export default function InfoPopover({ label, children }: { label: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [pinned, setPinned] = useState(false);
  return <Popover open={open} onOpenChange={(next) => { setOpen(next); if (!next) setPinned(false); }}>
    <PopoverTrigger asChild>
      <button
        type="button"
        className="info-button"
        aria-label={`About ${label}`}
        aria-expanded={open}
        onPointerEnter={() => { if (!pinned) setOpen(true); }}
        onPointerLeave={() => { if (!pinned) setOpen(false); }}
        onFocus={() => setOpen(true)}
        onBlur={() => { if (!pinned) setOpen(false); }}
        onClick={() => { setPinned((value) => !value); setOpen(true); }}
      ><Info aria-hidden="true" /></button>
    </PopoverTrigger>
    <PopoverContent
      align="start"
      side="right"
      className={`w-64 text-xs leading-relaxed duration-0 data-[state=closed]:animate-none data-[state=open]:animate-none ${pinned ? "pointer-events-auto" : "pointer-events-none"}`}
      onOpenAutoFocus={(event) => event.preventDefault()}
    >
      <p className="font-semibold">{label}</p>
      <div className="mt-1 opacity-80">{children}</div>
      <p className="mt-2 text-[10px] opacity-55">Click the info button to keep this open. Press Escape to close.</p>
    </PopoverContent>
  </Popover>;
}
