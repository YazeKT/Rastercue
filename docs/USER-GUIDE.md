# User guide

Windows beta: extract the full ZIP or run the NSIS installer. Binaries are unsigned. Install the Microsoft Visual C++ x64 Redistributable directly from https://learn.microsoft.com/en-us/cpp/windows/latest-supported-vc-redist if required; no Microsoft DLLs are bundled. Use current Vulkan-capable GPU drivers. Original interface hardware acceleration and native processing defaults are retained. Your RX 580 work PC is the intended real-world acceptance machine; it has not yet been tested.

Standard/Digital Art are bundled with verified creator notices. The optional credited custom pack supplies Anime Video x2/x3/x4 and Nomos8kSC; extract and import its models folder. Other builtin models remain catalogue guidance, visibly not bundled. If you hold appropriate creator-authorized weights, import under a distinct custom filename rather than a reserved missing builtin ID. No automatic replacement occurs.

If logs report vkAllocateMemory or an unsuccessful native exit, the job is failed, not a completed output. Close memory-heavy applications, check GPU drivers and explicitly try a smaller existing tile setting (such as 32) before retrying in a fresh destination. These are troubleshooting suggestions, not a confirmed diagnosis or guarantee; do not overwrite originals. The current test host showed failures with low available committed memory.

Select image or batch folder, choose a model and scale, select PNG/JPG/WebP, and choose a destination. Start runs the inherited engine; Cancel stops it. Double pass is two enlargements (e.g.4× then4× gives16×). Settings explain the existing GPU, tiles, TTA, metadata, compression, overwrite and sizing controls with examples.

JPG is compact but cannot keep transparency. Confirming JPG puts transparent areas on white using a temporary RGB input; source images are unchanged. PNG keeps alpha. An alpha-channel source exported directly to JPG by the original bundled binary could produce stripes/colour corruption; Rastercue's narrow safeguard addresses that case without replacing the engine.

When overwrite is off, the inherited single-image workflow can reuse an existing output. To regenerate an old damaged output, choose a fresh name/folder or explicitly enable overwrite. Desired single-job naming is applied after successful engine output; collisions never silently overwrite another file. Batch naming stays inherited; history permits individual completed-output renaming.

Move the comparison divider without changing zoom/pan. Scroll at a detail to zoom there, drag the image to pan, or use numeric zoom/Fit/100%/Reset. The optional lens leaves the divider available. Bookmarks are session-only and reset with the next input. Inspection does not change export pixels;100% is per interface/CSS pixel, so system scaling affects physical display size.

Job shows measured sizes, dimensions, progress and duration. History keeps local versioned records plus thumbnails, with backup recovery and interrupted-job marking after crashes. Missing/moved files keep their records. Relocation retains the previous folder. Confirmed history deletion removes records/thumbnails, never source/output images.

Settings → logs opens a searchable, severity-labelled, selectable view. Pause following while reading older entries, enlarge/maximise, copy or export locally. Progress on stderr is not automatically an error. Plain-language explanations supplement raw diagnostics, not guaranteed diagnoses.

Model guidance includes intended use/avoidance and evidence. Unknown imported filenames receive unverified guidance. Import paired .bin/.param files using the existing folder selector. Applying a preset or history settings never starts a job or silently substitutes missing models. Review settings before starting.

Rastercue uses its own app-data directory and does not silently import Upscayl preferences. Dark/JPG defaults apply to fresh preferences; explicit saved preferences remain. New copy is currently English while inherited translated controls retain language choices.
