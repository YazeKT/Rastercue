# Rastercue 1.0.0

Rastercue 1.0.0 is the first stable Windows foundation: a local, designer-focused image-upscaling studio built around the preserved Upscayl Vulkan engine.

## Highlights

- Compact three-column workspace with Input, Model and Output in one scrollable flow.
- Searchable Model Library with purpose, limitations, provenance and availability details.
- Hardware-aware onboarding and Settings inventory without a GPU-vendor whitelist.
- Original Upscayl Vulkan compatibility backend plus an explicitly selected native NCNN CPU backend.
- Source/output thumbnails in the Inspector and persistent local History.
- Guarded PNG, JPG/JPEG/JFIF, WebP, single-page TIFF and AVIF routes.
- Exact-byte `.rastercue` archives with checksum-verified, user-selected restore.
- Phase-aware progress, central error guidance and reviewable redacted support bundles.
- Full in-app release history, support contact and GitHub update checks.

## Compatibility boundary

Windows 10/11 x64 is the supported binary target. The Radeon RX 580 Vulkan workflow was owner-tested; Intel, NVIDIA and other Vulkan devices are enabled only when the bundled engine probe accepts them and are not blanket-certified. The genuine CPU backend passed its no-Vulkan probe, automated processing matrix and packaged UI job; CPU processing is slower and TTA remains Vulkan-only in 1.0. Rastercue never silently changes device, backend, model or format.

The stable package includes Standard, Digital Art, Lite, High Fidelity, Anime Video x4, Nomos8kSC, HFA2k, LSDIR, LSDIRCompactC3, General v3 and General WDN v3. Anime x2/x3 are excluded because their labelled scale did not pass the protected command route. Other unresolved model pairs remain excluded on provenance or redistribution grounds.

## Downloads

- Windows x64 installer: `rastercue-1.0.0-win.exe`
- Windows x64 ZIP: `rastercue-1.0.0-win.zip`
- `rastercue-1.0.0-SHA256SUMS.txt`
- `rastercue-1.0.0-sbom.cdx.json`
- `rastercue-native-corresponding-source.tar.gz`

The Windows binaries are unsigned. Windows may display SmartScreen warnings; Rastercue does not claim a verified publisher. Install the Microsoft Visual C++ x64 Redistributable from Microsoft. ZIP users must extract the complete folder.

Existing beta tags and assets are retained as superseded prereleases. See [CHANGELOG.md](../CHANGELOG.md) for the full history and [SECURITY.md](../SECURITY.md) for reporting guidance.
