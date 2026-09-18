"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Star, SwatchBookIcon } from "lucide-react";
import { MODELS } from "@common/models-list";
import getModelScale from "@common/check-model-scale";
import { MODEL_CATALOG, getModelGuide } from "@common/model-catalog";
import { useAtom, useAtomValue } from "jotai";
import { selectedModelIdAtom } from "@/atoms/user-settings-atom";
import { customModelIdsAtom } from "@/atoms/models-list-atom";
import { favouriteModelsAtom } from "@/atoms/rastercue-workflows-atom";
import useTranslation from "@/components/hooks/use-translation";
import useModelAvailability from '@/components/hooks/use-model-availability';

const SelectModelDialog = () => {
  const t = useTranslation();
  const [selected, setSelected] = useAtom(selectedModelIdAtom);
  const imported = useAtomValue(customModelIdsAtom);
  const [favourites, setFavourites] = useAtom(favouriteModelsAtom);
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(selected);
  const [query, setQuery] = useState("");
  const [onlyFavourites, setOnlyFavourites] = useState(false);
  const { builtIn, refresh } = useModelAvailability();
  const ids = Array.from(
    new Set([
      ...Object.keys(MODELS),
      ...MODEL_CATALOG.map((m) => m.id),
      ...imported,
    ]),
  );
  const available = (id: string) => id in MODELS ? builtIn?.[id] === true : imported.includes(id);
  const matches = ids.filter(
    (id) =>
      (!onlyFavourites || favourites.includes(id)) &&
      `${id} ${getModelGuide(id).name} ${getModelGuide(id).use}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  const model = getModelGuide(focused);
  const label = (id: string) =>
    id in MODELS
      ? t(`APP.MODEL_SELECTION.MODELS.${id}.NAME` as any).replace(
          "Upscayl ",
          "",
        )
      : getModelGuide(id).name;
  const toggleFavourite = (id: string) =>
    setFavourites(
      favourites.includes(id)
        ? favourites.filter((item) => item !== id)
        : [...favourites, id],
    );
  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        setOpen(value);
        if (value) { setFocused(selected); void refresh(); }
      }}
    >
      <DialogTrigger asChild>
        <button className="btn btn-primary w-full justify-start border-border text-left">
          <SwatchBookIcon className="h-4 w-4 shrink-0" />
          <span className="truncate">{label(selected)}</span>
        </button>
      </DialogTrigger>
      <DialogContent
        className="flex h-[90vh] w-[92vw] max-w-[1200px] flex-col gap-3 overflow-hidden p-5"
        aria-describedby="model-browser-description"
      >
        <DialogHeader>
          <DialogTitle>Model library</DialogTitle>
          <DialogDescription id="model-browser-description">
            Choose by image type, inspect the result, and check usage rights
            before paid work.
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-2">
          <input
            className="input input-bordered h-9 min-w-0 flex-1 text-sm"
            aria-label="Search models"
            placeholder="Search model, image type or filename"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            className={`btn btn-sm ${onlyFavourites ? "btn-primary" : "btn-ghost"}`}
            aria-pressed={onlyFavourites}
            onClick={() => setOnlyFavourites(!onlyFavourites)}
          >
            <Star className="h-4 w-4" /> Favourites
          </button>
        </div>
        <div className="grid min-h-0 flex-1 grid-cols-[minmax(180px,0.8fr)_minmax(0,1.7fr)] gap-4">
          <div
            className="overflow-y-auto rounded-lg border border-border p-1"
            aria-label="Models"
          >
            {matches.length === 0 && (
              <p className="p-3 text-sm opacity-70">
                No matching models. Try another search or turn off Favourites.
              </p>
            )}
            {matches.map((id) => (
              <div
                key={id}
                className={`mb-1 flex items-center rounded-md border ${focused === id ? "border-primary bg-primary/10" : "border-transparent"}`}
              >
                <button
                  className="min-w-0 flex-1 p-3 text-left text-sm hover:bg-base-content/5"
                  onClick={() => setFocused(id)}
                  aria-pressed={focused === id}
                >
                  <span className="block font-semibold">{label(id)}</span>
                  <span className="mt-1 block text-xs opacity-60">
                    {getModelScale(id)}× native ·{" "}
                    {id in MODELS
                      ? builtIn === null ? 'Checking availability' : available(id) ? 'Bundled' : 'Not bundled'
                      : available(id)
                        ? "Imported"
                        : "Import required"}
                  </span>
                </button>
                <button
                  className="btn btn-ghost btn-sm mr-1"
                  aria-label={`${favourites.includes(id) ? "Unfavourite" : "Favourite"} ${label(id)}`}
                  aria-pressed={favourites.includes(id)}
                  onClick={() => toggleFavourite(id)}
                >
                  <Star
                    className={`h-4 w-4 ${favourites.includes(id) ? "fill-current text-primary" : "opacity-50"}`}
                  />
                </button>
              </div>
            ))}
          </div>
          <article className="min-w-0 overflow-y-auto rounded-lg border border-border p-4 text-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold">{label(focused)}</h2>
                <p className="mt-1 break-all font-mono text-xs opacity-60">
                  {model.id}
                </p>
                <p className="mt-2 opacity-70">
                  {model.creator} · {getModelScale(focused)}× filename-detected
                  native scale
                </p>
              </div>
              <button
                className="btn btn-primary btn-sm shrink-0"
                disabled={!available(focused)}
                onClick={() => {
                  setSelected(focused);
                  setOpen(false);
                }}
              >
                Use model
              </button>
            </div>
            {!available(focused) && (
              <p className="mt-3 rounded border border-primary/30 bg-primary/10 p-3">
                {focused in MODELS
                  ? builtIn === null ? 'Model availability could not be confirmed. Reopen the library to retry.' : 'Not bundled—import a creator-authorized pair as a custom model, using a distinct custom filename for both files. Choose that imported entry; Rastercue does not silently substitute a different model.'
                  : 'Not imported. Select your custom models folder in Settings first. Catalogue entries do not install or download weights.'}
              </p>
            )}
            <p
              className={`mt-3 rounded border p-3 leading-relaxed ${model.rights.startsWith("NON-COMMERCIAL") ? "border-warning/50 bg-warning/10 text-warning" : "border-border"}`}
            >
              {model.rights}
            </p>
            <dl className="mt-4 space-y-4">
              {[
                ["Use for", model.use],
                ["Try this", model.example],
                ["Avoid / inspect carefully", model.avoid],
                ["Performance and limits", model.performance],
                ["Evidence confidence", model.evidence],
              ].map(([title, content]) => (
                <div key={title}>
                  <dt className="mb-1 font-semibold text-primary">{title}</dt>
                  <dd className="leading-relaxed opacity-80">{content}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-5 border-t border-border pt-3">
              <p className="mb-2 font-semibold">
                Provenance and creator guidance
              </p>
              {model.sources.map((source) => (
                <a
                  key={source}
                  href={source}
                  target="_blank"
                  rel="noreferrer"
                  className="mb-2 block break-all text-xs text-primary underline"
                >
                  {source.replace("https://", "")}
                </a>
              ))}
            </div>
          </article>
        </div>
        <p className="text-xs opacity-60">
          Native model scale is separate from output scaling. Guidance reviewed
          17 September 2026; no local weight hashes have been matched to creator
          releases.
        </p>
      </DialogContent>
    </Dialog>
  );
};
export default SelectModelDialog;
