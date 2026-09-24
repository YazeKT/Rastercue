"use client";
import React, { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Gauge, Search, Star, SwatchBookIcon } from "lucide-react";
import { MODELS } from "@common/models-list";
import getModelScale from "@common/check-model-scale";
import { MODEL_CATALOG, getModelGuide } from "@common/model-catalog";
import { useAtom, useAtomValue } from "jotai";
import { selectedModelIdAtom } from "@/atoms/user-settings-atom";
import { customModelIdsAtom } from "@/atoms/models-list-atom";
import { favouriteModelsAtom } from "@/atoms/rastercue-workflows-atom";
import useTranslation from "@/components/hooks/use-translation";
import useModelAvailability from "@/components/hooks/use-model-availability";

type Category = "All" | "Photo" | "Illustration" | "Anime" | "Restoration" | "Fast" | "Available" | "Favourites";
type Sort = "recommended" | "name" | "performance";
const CATEGORIES: Category[] = ["All", "Photo", "Illustration", "Anime", "Restoration", "Fast", "Available", "Favourites"];
const recommended = ["upscayl-standard-4x", "digital-art-4x", "upscayl-lite-4x", "high-fidelity-4x"];

function categoriesFor(id: string) {
  const guide = getModelGuide(id);
  const text = `${id} ${guide.name} ${guide.use} ${guide.example}`.toLowerCase();
  const result = new Set<Category>();
  if (/photo|natural|realistic|general image/.test(text)) result.add("Photo");
  if (/digital art|illustrat|linework|flat colour/.test(text)) result.add("Illustration");
  if (/anime/.test(text)) result.add("Anime");
  if (/restore|repair|blur|compression|damaged|denois/.test(text)) result.add("Restoration");
  if (/lite|compact|small model|faster|high-speed/.test(text)) result.add("Fast");
  return result;
}

export default function SelectModelDialog() {
  const t = useTranslation();
  const [selected, setSelected] = useAtom(selectedModelIdAtom);
  const imported = useAtomValue(customModelIdsAtom);
  const [favourites, setFavourites] = useAtom(favouriteModelsAtom);
  const [open, setOpen] = useState(false), [focused, setFocused] = useState(selected);
  const [query, setQuery] = useState(""), [category, setCategory] = useState<Category>("All"), [sort, setSort] = useState<Sort>("recommended");
  const { builtIn, refresh } = useModelAvailability();
  const ids = useMemo(() => Array.from(new Set([...Object.keys(MODELS), ...MODEL_CATALOG.map((model) => model.id), ...imported])), [imported]);
  const available = (id: string) => id in MODELS ? builtIn?.[id] === true : imported.includes(id);
  const label = (id: string) => id in MODELS ? t(`APP.MODEL_SELECTION.MODELS.${id}.NAME` as any).replace("Upscayl ", "") : getModelGuide(id).name;
  const matches = useMemo(() => ids.filter((id) => {
    const text = `${id} ${label(id)} ${getModelGuide(id).use}`.toLowerCase();
    const categoryMatch = category === "All" || (category === "Available" && available(id)) || (category === "Favourites" && favourites.includes(id)) || categoriesFor(id).has(category);
    return categoryMatch && text.includes(query.trim().toLowerCase());
  }).sort((a, b) => {
    if (sort === "name") return label(a).localeCompare(label(b));
    if (sort === "performance") return Number(categoriesFor(b).has("Fast")) - Number(categoriesFor(a).has("Fast")) || label(a).localeCompare(label(b));
    const ai = recommended.indexOf(a), bi = recommended.indexOf(b);
    return (ai < 0 ? 999 : ai) - (bi < 0 ? 999 : bi) || label(a).localeCompare(label(b));
  }), [ids, category, query, sort, favourites, builtIn, t]);
  const model = getModelGuide(focused);
  const toggleFavourite = (id: string) => setFavourites(favourites.includes(id) ? favourites.filter((item) => item !== id) : [...favourites, id]);
  return <Dialog open={open} onOpenChange={(value) => { setOpen(value); if (value) { setFocused(selected); void refresh(); } }}>
    <DialogTrigger asChild><button className="btn btn-primary w-full justify-start border-border text-left"><SwatchBookIcon className="h-4 w-4 shrink-0"/><span className="truncate">{label(selected)}</span></button></DialogTrigger>
    <DialogContent className="model-library" aria-describedby="model-browser-description">
      <DialogHeader><DialogTitle>Model library</DialogTitle><DialogDescription id="model-browser-description">Choose by source type, inspect limitations and rights, then confirm the model. Rastercue never substitutes one silently.</DialogDescription></DialogHeader>
      <div className="model-toolbar">
        <label className="model-search"><Search aria-hidden="true"/><span className="sr-only">Search models</span><input aria-label="Search models" placeholder="Search name, source type or filename" value={query} onChange={(event) => setQuery(event.target.value)}/></label>
        <label className="model-sort"><span>Sort</span><select value={sort} onChange={(event) => setSort(event.target.value as Sort)}><option value="recommended">Recommended</option><option value="name">Name</option><option value="performance">Performance guidance</option></select></label>
      </div>
      <div className="model-categories" role="tablist" aria-label="Model categories">{CATEGORIES.map((item) => <button key={item} role="tab" aria-selected={category === item} className={category === item ? "active" : ""} onClick={() => setCategory(item)}>{item}</button>)}</div>
      <div className="model-library-body">
        <section className="model-card-list" aria-label="Models">
          {matches.length === 0 && <p className="model-empty">No matching models. Change the search or category.</p>}
          {matches.map((id) => {
            const guide = getModelGuide(id), isAvailable = available(id), isFocused = focused === id;
            return <article key={id} className={`model-card ${isFocused ? "selected" : ""}`}>
              <button className="model-card-main" onClick={() => setFocused(id)} aria-pressed={isFocused}>
                <span className="model-card-title">{label(id)}</span>
                <span className="model-card-meta">{getModelScale(id)}× · {isAvailable ? (id in MODELS ? "Bundled" : "Imported") : builtIn === null && id in MODELS ? "Checking" : "Unavailable"}</span>
                <span className="model-card-use">{guide.use}</span>
                <span className="model-card-performance"><Gauge aria-hidden="true"/>Not benchmarked on this device</span>
              </button>
              <button className="model-favourite" aria-label={`${favourites.includes(id) ? "Unfavourite" : "Favourite"} ${label(id)}`} aria-pressed={favourites.includes(id)} onClick={() => toggleFavourite(id)}><Star className={favourites.includes(id) ? "fill-current" : ""}/></button>
            </article>;
          })}
        </section>
        <article className="model-detail">
          <div className="model-detail-heading"><div><p className="section-label">{available(focused) ? "Available" : "Unavailable"} · {getModelScale(focused)}× native</p><h2>{label(focused)}</h2><p className="model-id">{model.id}</p></div><button className="btn btn-primary btn-sm" disabled={!available(focused)} onClick={() => { setSelected(focused); setOpen(false); }}>Use model</button></div>
          {!available(focused) && <p className="model-notice">{focused in MODELS ? builtIn === null ? "Availability could not be confirmed. Reopen the library to retry." : "This model is not bundled. Import a creator-authorized pair with matching filenames; Rastercue will not substitute another model." : "Choose a custom-model folder in Settings and import the matching model pair first."}</p>}
          <section className="model-performance-panel"><Gauge aria-hidden="true"/><div><strong>Performance on this hardware</strong><p>Not benchmarked on this device. No speed or memory estimate will be invented.</p></div></section>
          <div className="model-detail-grid">
            <section><h3>Overview</h3><p>{model.use}</p><p><strong>Try:</strong> {model.example}</p></section>
            <section><h3>Quality & limits</h3><p>{model.avoid}</p><p>{model.performance}</p></section>
            <section><h3>Rights</h3><p className={model.rights.startsWith("NON-COMMERCIAL") ? "text-warning" : ""}>{model.rights}</p></section>
            <section><h3>Evidence</h3><p>{model.evidence}</p><p className="mt-2"><strong>Creator:</strong> {model.creator}</p></section>
          </div>
          <section className="model-sources"><h3>Provenance sources</h3>{model.sources.map((source) => <a key={source} href={source} target="_blank" rel="noreferrer">{source.replace("https://", "")}</a>)}</section>
        </article>
      </div>
    </DialogContent>
  </Dialog>;
}
