# Rastercue changelog

## 1.0.0 — 24 September 2026

Rastercue 1.0.0 is the first stable product foundation: a local-first, designer-focused Windows workstation built around the protected Upscayl processing core.

### Protected processing core

- Preserves the original Upscayl Vulkan executable, built-in model files, model IDs, command arguments, native scaling behaviour, single and batch processing, double pass, cancellation, metadata handling and output encoding as a regression-locked compatibility baseline.
- Adds output verification so a job is not recorded as complete unless the expected output exists, opens and reports valid dimensions and format.
- Keeps sources unchanged, prevents failed jobs from appearing successful and retains an explicit compatibility path for established Upscayl workflows.
- Fixes the inherited RGBA-to-JPEG corruption case by supplying a temporary RGB working image only for JPEG jobs. The source, native engine and encoder remain unchanged; temporary data is removed after completion, cancellation or failure.

### Studio workspace

- Combines Input, Model, Output, Destination and Start in one compact, scrollable workflow. Both sidebars remain available at the 1366 × 768 target.
- Replaces the old model popup with a responsive Model Library containing search, media-purpose filters, favourites, availability, rights information, limitations and device-specific benchmark states.
- Expands the right Inspector with contained source and result thumbnails, pixel dimensions, format, file size, model, backend, device, elapsed time and current processing phase.
- Adds accessible information popovers that open on hover or keyboard focus, pin on click/tap, close with Escape and dismiss immediately when the pointer leaves unless pinned.
- Preserves before/after comparison, synchronised zoom and pan, inspection bookmarks, custom width and the established image-first workstation.

### Hardware, backend and progress visibility

- Adds engine-authoritative device enumeration, CPU/RAM/software inventory and hardware-aware onboarding without an Intel, AMD or NVIDIA whitelist. The bundled engine probe, not the GPU brand, decides which Vulkan devices can be selected.
- Separates hardware detected by Windows, devices accepted by the selected engine and the device actually reported for a completed job.
- Adds explicit backend/device contracts and never silently substitutes a backend, device, model or format after failure.
- Adds stable validation, preparation, device selection, model loading, processing, encoding, metadata, saving, verification, thumbnail, history, archive and completion phases.
- Adds a separate native NCNN CPU backend that passed a no-Vulkan runtime probe, Standard/Digital Art/alpha/format tests, batch and cancellation checks, and a packaged UI job. CPU TTA remains explicitly unavailable in 1.0.

### Formats, history and archives

- Centralises format capability checks for PNG, JPEG/JFIF and WebP, with guarded adapter paths for supported single-image formats and explicit rejection of animated, multipage, ambiguous or unsafe inputs.
- Validates image dimensions, pixel count, memory/temporary-space requirements, orientation, profile, alpha and output readability before marking a job complete.
- Adds persistent local history with secure managed source/result thumbnails, file details, safe output renaming and restart persistence.
- Adds on-demand `.rastercue` ZIP64 archives containing exact original and output bytes, thumbnails, settings, a versioned manifest, byte sizes and SHA-256 hashes.
- Adds guarded restore to a user-selected location with traversal, symlink, expanded-size, checksum and overwrite protection.

### Settings, support and diagnostics

- Rebuilds Settings as one searchable, scrollable surface with a persistent navigation rail for hardware, processing, formats, appearance, storage, updates and support.
- Adds complete hardware/software detail, model inventory, data/log/history locations, the Yaze Media / YazeKT support identity and `kirstentrimaley@gmail.com` contact route.
- Adds a central error library with stable codes, failed phase, severity, confirmed and possible causes, relevant hardware context, recovery actions and retryability.
- Unknown failures create bounded local reports. Reviewable support bundles redact images, names, paths, usernames, clipboard content, full command arguments and unbounded logs before manual sharing.
- Removes telemetry, cloud promotions, automatic image uploads and automatic diagnostic transmission.

### Release and documentation

- Adds GitHub Releases update checks with stable-channel and active-job safeguards; installation remains a deliberate user action.
- Adds the local Rastercue product website, product screenshots, user/hardware/format/archive/error/privacy guides, issue templates, release documentation, engine/model provenance and GitHub Pages workflow.
- Generates an unsigned Windows installer, portable ZIP, unpacked build, checksums and CycloneDX SBOM. Windows signing remains unavailable and is stated honestly.
- Adds packaged regression coverage for the Standard and Digital Art paths, PNG decoded-pixel equivalence, WebP metadata, JPG batch, double pass, cancellation, native failure, thumbnails, settings, licences and compact-window reachability.

The processing engine, model weights and inherited application foundation remain credited to their original creators. Public compatibility claims must stay within packaged evidence; configuration alone is not hardware support proof.

## 1.0.0-beta.2 — Work-PC feedback update

- Stop clears the busy interface and suppresses late progress, without deleting already-written outputs. Ctrl+. / Cmd+. offers a main-process cancellation shortcut.
- History headers/thumbnails run asynchronously rather than decoding full images on the main thread. History/taskbar/visual percentages are coalesced. Raw diagnostics remain in log files; visible logs retain 1,000 entries and closed log dialogs are unmounted.
- Full Settings popup lists Output, Processing and Application together without arrow pagination. Support contains licensing/documents, GitHub links, log-folder access, update controls and guide replay.
- Five-step guide appears once; completion, skipping and dismissal are remembered.
- Installer includes four verified built-ins and nine verified custom models, automatically loaded, with complete BSD/CC notices, conversion evidence and pinned checksum staging. Eight unresolved pairs remain excluded; credit alone is not permission.
- Original engine binaries, protected handlers/arguments, model IDs and processing defaults remain unchanged. Windows is still an unsigned testing beta.

## 1.0.0-beta.1 — Windows release preparation

Isolated dependency/security pass: updated affected Electron/runtime/build/image/metadata dependencies; full and production npm audits report zero known advisories at the release audit. Renderer Node disabled, isolation/web security enabled; restricted IPC, navigation, permissions and external URLs. Clipboard/drop modernized for isolated Electron.

Verified unchanged Windows engine against its original native release and supplied complete recursive corresponding source. Package only exact creator-matched Standard/Digital Art weights; offer a separately credited four-model custom pack. Exclude both Microsoft OpenMP DLLs and direct users to the official runtime installer. Missing bundled models are clearly labelled and block Start/preset/history restoration without substitution. Remove optional unverified upstream example imagery from the browser/distribution.

Process wrapper reports nonzero native exit as failure before legacy completion callbacks, instead of recording false success; successful processing arguments/pixels are unchanged. Native working directory is its binary folder, isolating runtime lookup from Chromium's distribution. Original interface hardware acceleration remains enabled; no laptop-specific processing defaults are imposed. Preview starts with source dimensions while output loads.

Unsigned Windows beta, not an assertion of fully production-ready cross-platform support. Signing, clean-machine/high-DPI/translation acceptance, designer feedback, macOS/Linux runtime and installed-version hosted updates remain gates.

## Pre-1.0 local candidate history

Publication branding: Rastercue SVG replaces the progress/loading emblem. Footer now displays Yaze Media linked to https://github.com/YazeKT; upstream authorship remains in About/Licences and source notices. Initial GitHub publication is source-only, with native assets/weights excluded and explicit pinned/checksum-verified developer setup.

Compatibility correction: the original bundled engine misencodes alpha-channel inputs directly to JPG (vertical stripes and colour corruption). Rastercue now supplies temporary RGB inputs only for JPG jobs, with transparent areas placed on white after the JPG confirmation. Native binary, models, output encoder and processing settings are retained; PNG/WebP jobs are untouched. Preparation is cancellable and temporary inputs are cleaned up. Existing damaged outputs are not silently overwritten—use a fresh destination or explicitly enable overwrite to regenerate them.

Fork improvements: Rastercue identity and dark theme; permanent compact workstation panels; detailed searchable model catalogue, favourites and presets; synchronised before/after zoom, pan and inspection bookmarks; local persistent job history, file measurements and managed-output renaming; readable expandable logs; About/licence view; JPG fresh-install default; separate app data; Rastercue-only updater; removal of analytics, cloud promotions and online log submission.

Inherited from Upscayl: Electron/React application, native upscaling binaries, built-in models, custom model folder support, single/batch/double processing, cancellation, conversion and compression, metadata handling, existing aggregate statistics and supported output formats. These are not newly authored Rastercue capabilities.

Windows is currently the local build/test host. macOS/Linux packaged smoke tests, signing/notarisation, installed-version hosted updates and designer acceptance are release gates, not completed claims.
