# Rastercue 1.0 implementation evidence

## 1.0 stable acceptance — 24 September 2026

The owner accepted the refreshed Windows 10/11 x64 application and product website on 24 September 2026 after testing on the intended i5-8600K / Radeon RX 580 / 32 GB work PC. The release remains unsigned; Windows may show SmartScreen warnings and no verified publisher identity is claimed.

Source verification passes 36 processing, protected-core, CPU, archive, format, hardware, security and lifecycle checks plus the history integration suite. The rebuilt packaged application passes real Vulkan and CPU Standard PNG UI jobs, decoded source/output thumbnails in the right Job panel and History, 1366×728 and 1100×600 reachability, the full onboarding/Settings/Support/Licences path, and the packaged processing matrix: Standard PNG with decoded pixel equality to a direct native-engine reference, Digital Art PNG, WebP metadata, two-file JPG batch, double-pass JPG, cancellation, and a forced native failure.

Rastercue applies no GPU-vendor whitelist: automatic selection and every Vulkan device enumerated by the bundled engine are eligible. The RX 580 Vulkan path is owner-tested evidence, not a universal AMD, Intel or NVIDIA claim. Other devices remain probe-based and require a completed job for confirmation. The genuine native CPU backend passed its no-Vulkan probe, Standard/Digital Art/alpha/format matrix, batch and cancellation checks, and a packaged UI Standard job. Software Vulkan is never presented as CPU processing.

## 1.0 stable model boundary

The packaged regression matrix verifies Standard and Digital Art as the owner-acceptance paths. The stable package and public model list omit legacy Anime Video x2/x3 claims because the protected engine path did not verify their labelled scale. Anime Video x4 remains in the stable list. Rastercue does not silently change that locked command contract or advertise an unverified scale.

## Beta 2 — work-PC feedback

Owner reports beta 1 works well on the work PC but Stop appeared frozen and settings pagination was inconvenient. Beta 2 adds cancellation busy-state reset/late-progress suppression, asynchronous Sharp history metadata/thumbnails, bounded/unmounted logs and coalesced history/taskbar/visual progress. Original engine binaries/handlers/arguments/model IDs/defaults and raw diagnostics remain intact.

Settings is one full popup with Support/GitHub/update/documentation and a five-step first-use/replay guide. Four built-ins and nine custom pairs were bundled in this historical beta after creator provenance verification; eight unresolved pairs remained excluded. The stable public list later removed x2/x3 scale claims. Twenty-two regression tests and history safety/progress-flood tests passed. Packaged simulated-engine cancellation passed Stop click, busy reset, preserved files, restart and main-process shortcut handling. Simulation was not a native GPU performance claim.

## Windows beta release pass — 18 September 2026

This section is historical beta evidence. The intended machine was an i5-8600K / RX 580 / 32 GB RAM desktop, not the resource-constrained integrated-GPU laptop used for early automation. A later expanded laptop run encountered Vulkan memory allocation failure; the earlier four-path pass was not a guarantee of reliability on every machine. A fresh butterfly image completed with Digital Art and was visually inspected as colour without stripes. The temporary product-wide software-rendering workaround was removed: original interface acceleration and engine defaults were retained. Prior software-rendering results below describe that test environment, not the stable release default.

Current evidence supersedes the historical source-only snapshot below. Full/production npm audits report zero known advisories after a separate security update. Processing baseline files remain byte-identical; 21 regression tests plus history safety tests pass. The isolated renderer disables Node, enables web security, restricts bridge/navigation/permissions and preserves clipboard/drop. Preload is not fully sandboxed.

Exact native Windows release/source and creator-matched Standard/Digital Art plus four permitted custom pairs are documented in ENGINE-PROVENANCE.md and MODEL-REDISTRIBUTION.md. Complete notices and recursive engine source accompany distribution; Microsoft runtimes are external prerequisites. Other weights remain local, not publicly packaged.

Current Windows unpacked processing acceptance passed single PNG (decoded pixels equal direct original-engine reference), two-image JPG batch, double-pass JPG, cancellation and unchanged source bytes, using the existing explicit tile setting 32 on the integrated-GPU host. JPG colour checked per pixel. Before UI software rendering, the host exhibited native access violations/Vulkan allocation failures with low available committed memory; failure paths now report failure, not false completion. Software UI rendering reduces competition without changing native GPU choice or introducing a new engine mode. Do not infer every release gate is complete. Clean-machine/signing/hosted updater/designer and macOS/Linux acceptance remain outstanding.

Initial source publication prepared18September2026: Yaze Media footer links to the GitHub profile; progress emblem uses the Rastercue SVG. Packaged UI test checks both, captures the loading state and completes a single PNG job. Source index excludes private artifacts/native assets/weights; pinned asset origin verified against19 upstream Git blobs. Full legal/privacy/security/contribution/source-setup documentation included. Security dependency advisories remain a binary-release gate. Local build remains unsigned; source publication does not assert packaged-release readiness.

Built: identity/assets; permanent compact workspace; model guidance for seven built-ins and fourteen locally supplied models; favourites/presets; slider/zoom/pan/bookmarks/lens; current job measurements and managed naming; persistent local history; readable expanded logs; dark/JPG defaults; About/licences/changelog; privacy removals and separate app data; Rastercue release provider and idle restart guard; native build-only workflow.

Passed locally: production TypeScript/Next build; seven regression contracts (28 protected file hashes, model IDs/scales/rights, engine argument and renderer payload contracts); history safety/persistence test suite; direct engine single PNG/JPG, batch, double, custom2× and cancellation smoke. Baseline decoded PNG output matched. Windows unpacked app launches with isolated app data.

## Alpha → JPG correction (18 September 2026)

User-reported saved image corruption confirmed visually, not dismissed as preview: original512×286 RGBA butterfly PNG produced a striped/desaturated2048×1144 JPG. Same unchanged binary reproduced this directly; its PNG output was clean. The same input with the unused alpha channel removed produced clean JPG. Earlier RGB-only smoke tests missed this case.

Narrow compatibility wrapper now prepares temporary RGB inputs only for JPG output; opaque RGB pixels are preserved exactly and transparent areas flatten to the disclosed white background. Engine binary, model weights, processing command handlers, argument builder and all28 protected files still match baseline hashes exactly. Output encoding/compression remains the native engine's. PNG/WebP retain the original synchronous spawn path. Cancellation during preparation prevents launching the engine; temporary data is cleaned up.

Sixteen regression tests pass, including alpha pixel preservation, source safety, batch staging/cleanup, cancellation and lifecycle forwarding. Added sharp0.33.5 as an explicit production dependency (same already-used version, not an upgrade) so packaged preparation and thumbnails work. Rebuilt Windows unpacked app processed the actual failing butterfly image through UI to a clean colour JPG in4684ms. Visual inspection passed; decoded output pixels matched the original engine's clean RGB-input reference exactly (mean absolute channel error0). Existing damaged outputs were preserved; use fresh destination/name or explicit overwrite to regenerate.

SVG master: resources/brand/rastercue.svg. Matching inline SVG is used in workspace/loading/About, master SVG in favicon, and master-generated PNG/ICO/ICNS platform assets. Standalone monochrome and wordmark SVGs are also copied into public assets. Packaged window icon path now resolves the shipped Rastercue icon.

Additional packaged main-process IPC smoke passed: unchanged PNG single decoded pixels match baseline; two RGBA inputs exported as colour JPG batch; RGBA two-pass JPG reaches1024×768; JPG cancellation is recorded as cancelled and creates no completed output. Batch and double saved JPGs inspected visually with no stripe/grayscale fault. Sources remain byte-identical. This is packaged IPC evidence, not a comprehensive interactive UI test of every processing option.

Packaged Windows UI additionally passed: laptop window1366×728 (content1350×689), Start-action bounds, smaller1100×600 unified workflow reachability, and a real single PNG job through Select Image → destination → Start, completed with local history. Fresh screenshots confirm Start is no longer clipped. NSIS/ZIP build generation succeeded.

The later stable pass completed packaged batch, double-pass, cancellation and failure-path checks plus Settings, Support, Licences, thumbnail and compact-window verification. Comprehensive screen-reader, high-DPI and long-translation coverage remains future hardening rather than a claim of the Windows 1.0 release. Independent review identified Start clipping, hidden examples and bookmark overflow; the unified workflow and bookmark pagination corrected those layout issues. Workspace selectors use ordinary pressed buttons rather than an incomplete ARIA-tab pattern.

macOS/Linux remain source and roadmap targets; no macOS/Linux packaged runtime is claimed. Windows signing is unavailable. No upstream settings migration, network model download or extra weight redistribution is included. Original engine processing files, binaries and protected model pairs remain hash-identical.
