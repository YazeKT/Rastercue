# User guide

Rastercue 1.0 supports Windows 10/11 x64. Extract the full ZIP or run the NSIS installer. Binaries are unsigned, so Windows may show SmartScreen warnings and no verified publisher identity is claimed. Install the Microsoft Visual C++ x64 Redistributable directly from https://learn.microsoft.com/en-us/cpp/windows/latest-supported-vc-redist if required; no Microsoft DLLs are bundled. Use current GPU drivers. The original interface hardware acceleration and native processing defaults are retained. The Radeon RX 580 path was owner-tested on the intended work PC on 24 September 2026.

The stable package documents Standard, Digital Art, Lite, High Fidelity and seven custom pairs: Anime Video x4, Nomos8kSC, HFA2k, LSDIR, LSDIRCompactC3, General v3 and General WDN v3. Legacy Anime Video x2/x3 pairs are excluded from stable model claims because their labelled scale was not verified through the protected command path. Application settings can restore the bundled model folder after a user custom import without changing the selected model. Eight unresolved pairs remain excluded; credit alone is not permission. See MODEL-REDISTRIBUTION.md for creator links, complete attribution and modifications.

The left workflow keeps Input, Model and Output together, followed by Destination and Start/Cancel. Settings opens one full, scrollable popup with a persistent category rail. Support contains licences/documents, GitHub links, manual/automatic update controls, log-folder access and guide replay. The first-use guide remembers completion, skipping and dismissal.

Stop/Cancel clears the busy interface. Ctrl+. (Cmd+. on macOS) also dispatches Stop from the main process. Already-written files are kept; partial files are not verified completed outputs. Visible logs retain 1,000 entries; raw native diagnostics remain in application log files. Async history reads and reduced visual progress refreshes do not change exported pixels.

If logs report vkAllocateMemory or an unsuccessful native exit, the job is failed, not a completed output. Close memory-heavy applications, check GPU drivers and explicitly try a smaller existing tile setting (such as 32) before retrying in a fresh destination. These are troubleshooting suggestions, not a confirmed diagnosis or guarantee; do not overwrite originals. The current test host showed failures with low available committed memory.

Select an image or batch folder, choose a model and scale, select PNG/JPG/WebP, and choose a destination. Start runs the inherited engine; Cancel stops it. Double pass is two enlargements (for example, 4× then 4× gives 16×). Settings explain the existing device, tiles, TTA, metadata, compression, overwrite and sizing controls with examples.

Rastercue does not use a GPU-vendor whitelist. Hardware settings separate adapters detected by Windows from Vulkan devices verified by the bundled engine. AMD RX 580 Vulkan is owner-tested; Intel, NVIDIA and other devices remain engine-probe based rather than universally certified. CPU only uses the separately probed native NCNN CPU backend; it is slower, TTA is unavailable in 1.0, software Vulkan is not CPU mode, and no failed GPU job silently changes backend.

JPG is compact but cannot keep transparency. Confirming JPG puts transparent areas on white using a temporary RGB input; source images are unchanged. PNG keeps alpha. An alpha-channel source exported directly to JPG by the original bundled binary could produce stripes/colour corruption; Rastercue's narrow safeguard addresses that case without replacing the engine.

When overwrite is off, the inherited single-image workflow can reuse an existing output. To regenerate an old damaged output, choose a fresh name/folder or explicitly enable overwrite. Desired single-job naming is applied after successful engine output; collisions never silently overwrite another file. Batch naming stays inherited; history permits individual completed-output renaming.

Move the comparison divider without changing zoom/pan. Scroll at a detail to zoom there, drag the image to pan, or use numeric zoom/Fit/100%/Reset. The optional lens leaves the divider available. Bookmarks are session-only and reset with the next input. Inspection does not change export pixels;100% is per interface/CSS pixel, so system scaling affects physical display size.

Job shows measured sizes, dimensions, progress and duration. History keeps local versioned records plus thumbnails, with backup recovery and interrupted-job marking after crashes. Missing/moved files keep their records. Relocation retains the previous folder. Confirmed history deletion removes records/thumbnails, never source/output images.

Settings → logs opens a searchable, severity-labelled, selectable view. Pause following while reading older entries, enlarge/maximise, copy or export locally. Progress on stderr is not automatically an error. Plain-language explanations supplement raw diagnostics, not guaranteed diagnoses.

Model guidance includes intended use/avoidance and evidence. Unknown imported filenames receive unverified guidance. Import paired .bin/.param files using the existing folder selector. Applying a preset or history settings never starts a job or silently substitutes missing models. Review settings before starting.

Rastercue uses its own app-data directory and does not silently import Upscayl preferences. Dark/JPG defaults apply to fresh preferences; explicit saved preferences remain. New copy is currently English while inherited translated controls retain language choices.
