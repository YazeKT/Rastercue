# Rastercue 1.0 Windows owner acceptance record

Target: i5-8600K, Radeon RX 580, 32 GB DDR4. Keep the original Upscayl installation available for side-by-side comparison. Use only non-confidential test images and empty output folders.

Kirsten accepted the application and website for publication on 24 September 2026 after a final work-PC test. Keep this checklist as the regression record for rebuilt artifacts; unchecked items remain useful follow-up coverage rather than a pending owner-approval gate.

## Release identity and installation

- [ ] Record the release version, source commit and SHA-256 for the installer and ZIP.
- [ ] Confirm the installer is unsigned unless a valid final signature is independently verified.
- [ ] Install without removing original Upscayl.
- [ ] Launch from the installed shortcut, the complete extracted ZIP and the unpacked test build.
- [ ] Confirm existing Rastercue preferences/history remain readable after the upgrade.
- [ ] Confirm the application still starts when hardware detection is unavailable.

## Hardware and backend truth

- [ ] Hardware lists the i5-8600K, 32 GB memory and Radeon RX 580 with driver details where Windows provides them.
- [ ] The engine probe lists the RX 580 only if it is actually usable.
- [ ] No vendor whitelist hides an engine-probed Vulkan adapter; compatibility is decided by the bundled engine probe.
- [ ] Auto explains its recommended backend/device.
- [ ] A small job records the actual backend/device used; confirm the RX 580 rather than assuming from its presence.
- [ ] Original Upscayl Vulkan compatibility mode completes a job.
- [ ] The included native CPU backend completes a packaged job before CPU is described as a recovery guarantee; software Vulkan is never described as CPU.
- [ ] No GPU failure silently switches to CPU or another device.
- [ ] A repeated hardware scan does not erase unrelated settings.

## Protected Upscayl comparison

- [ ] Match Standard model, scale, tile, TTA, output format, compression and metadata settings in both applications.
- [ ] Process the same photograph to PNG and compare dimensions, colour, edges and decoded output.
- [ ] Repeat with Digital Art on an illustration containing clean edges and text.
- [ ] Process transparent artwork to PNG and verify alpha.
- [ ] Export an alpha-containing input to JPG; verify white transparency flattening, no stripes and unchanged source bytes.
- [ ] Run a two-image batch and confirm both verified outputs.
- [ ] Run double pass on a deliberately small input and confirm expected dimensions.
- [ ] Cancel during processing; completed files remain, partial output is not marked complete and Start becomes available again.
- [ ] Confirm custom width, output naming, overwrite protection, metadata and compression retain baseline behaviour.

## Formats

- [ ] Verify PNG, JPEG/JFIF and WebP import/export.
- [ ] Verify single-page RGB/sRGB TIFF and AVIF import/export through the packaged application.
- [ ] Confirm animated WebP/GIF and multipage TIFF are rejected with a specific explanation.
- [ ] Confirm a corrupt input, unsupported colour boundary and unwritable destination cannot produce a successful history record.

## Studio workflow

- [ ] The welcome screen detects hardware and offers Apply recommendation / Keep current settings.
- [ ] The Model Library can search, filter, favourite and open model details.
- [ ] Unmeasured model performance says “Not benchmarked on this device.”
- [ ] An optional benchmark records the exact device, driver, engine, model and settings used.
- [ ] Both sidebars and Start remain accessible at 1366×768 and 125% Windows scaling.
- [ ] Information buttons work with hover, keyboard focus, click-to-pin and Escape.
- [ ] Progress names the current phase, file, backend/device and elapsed time.
- [ ] Original/output thumbnails remain undistorted in Inspector and History.
- [ ] Inspector pixel dimensions, format, file size and available image properties agree with the completed output.
- [ ] Restart Rastercue and confirm history, favourites and preferences persist.

## Archive, diagnostics and failure handling

- [ ] Archive one completed job and restore into a new folder.
- [ ] SHA-256 confirms restored original and output bytes exactly match their pre-archive files.
- [ ] Restore refuses an existing filename rather than overwriting it.
- [ ] A damaged archive or checksum mismatch leaves no falsely verified restore.
- [ ] Trigger or simulate a known error; confirm code, phase, confirmed/possible cause and recovery actions.
- [ ] Unknown failure creates a bounded local report and does not transmit it.
- [ ] Review a support bundle: no image bytes, private filenames, usernames or absolute paths.
- [ ] Turn diagnostic capture off and confirm the preference persists.

## Independent output review

Open representative results in a separate trusted image viewer or editor. Record:

- App/build and Windows/driver versions.
- RX 580 VRAM capacity (4 GB or 8 GB).
- Input dimensions and SHA-256.
- Model, scale, tile, TTA, backend and device.
- Output format, dimensions, elapsed time and any visible defect.
- Whether the same case succeeds in original Upscayl.

Do not share customer artwork or private paths. Use the redacted bundle and a non-confidential reproduction only when permitted.

## Owner decision

- [x] **Accepted for publication by Kirsten Trimaley.** Date: 24 September 2026. Final release commit/hash is recorded during publication.

Any future protected-core failure blocks that rebuilt artifact. Fix the relevant subsystem, rebuild and repeat the applicable checks before replacing the stable release.
