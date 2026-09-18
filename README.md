<p align="center"><img src="resources/brand/rastercue.svg" width="88" alt="Rastercue R-and-pixel logo"></p>

# Rastercue

**A local image-upscaling workspace for designers, by [Yaze Media](https://github.com/YazeKT).**

Rastercue is an independently branded, UI-focused derivative of [Upscayl](https://github.com/upscayl/upscayl). It preserves the established native upscaling foundation while adding clearer controls, detailed model guidance, image inspection and persistent job records.

![Rastercue compact dark workstation](docs/screenshots/workspace.png)

## What changed

- Permanent compact left/right panels; smaller-height workflow pages and paginated settings.
- Dark-first Rastercue identity, flat SVG logo and platform icons.
- Enlarged searchable model browser, usage/avoidance guidance, provenance and honest licence warnings; favourites and named presets.
- Persistent before/after slider, synchronised pan/zoom, numeric zoom, Fit/100%/Reset, session bookmarks and optional lens.
- Current-job measurements, safe output naming, persistent searchable local history and thumbnails.
- Readable, expandable logs with severity filters, search, copy and local export.
- JPG fresh-install default, transparency confirmation and a narrow alpha-to-JPG compatibility safeguard.
- Separate application data; no analytics, cloud promotions or online log upload.

Single, batch, double-pass, cancellation, supported formats, metadata/compression controls and aggregate statistics are inherited capabilities—not newly invented Rastercue engines. Native binaries, model IDs and protected processing code remain baseline-identical. The JPEG safeguard changes only temporary alpha-containing inputs for JPG export; originals remain untouched.

## Current status

This is a **source publication of a local release candidate**, not an installer release. Windows unpacked builds and representative processing paths have been tested locally. macOS/Linux packaged runtime, signing/notarisation and hosted updater installation have not been verified. New interface guidance is currently English; inherited language/theme choices remain available. See [verified evidence and remaining work](docs/IMPLEMENTATION-STATUS.md).

Known inherited Electron isolation gaps and dependency advisories are documented in [SECURITY.md](SECURITY.md). This is not a hardened binary release; use trusted inputs and complete the security release gates before distribution.

No installers, native binaries or model weights are committed. They remain local prerequisites, with a checksum-verified explicit fetch tool below. Custom weights are not redistributed or downloaded in-app. Some models have non-commercial restrictions and other converted-weight rights remain unverified. Download access is not commercial-use permission.

## Develop locally

Prerequisites: Git, Node.js20+ and npm; a Vulkan-capable GPU supported by the inherited engine. Native packaging must be tested on each target operating system.

```sh
git clone https://github.com/YazeKT/Rastercue.git
cd Rastercue
npm ci
# Read LEGAL.md and the upstream/creator model terms first.
npm run assets:fetch -- --acknowledge-model-terms
npm run build
npm run test:rastercue
npm run test:history
npm start
```

The fetch command obtains only the existing baseline upstream assets from a pinned Upscayl commit, verifies SHA-256 and refuses to overwrite mismatched local assets. It is a developer setup command, not an in-app download feature. Existing valid local assets require no network. See [development details](docs/DEVELOPMENT.md).

## Use the workspace

Select an image/folder, model, scale, format and destination before starting. Use PNG for transparent artwork. JPG cannot retain alpha; continuing JPG places transparent areas on white in a temporary RGB input. Open Job for output naming and measured sizes; use History for previous records. Zoom and pan affect viewing only, never exported pixels. Model guidance is test-first advice, not guaranteed restoration of faces, text or logos.

See [user guide](docs/USER-GUIDE.md), [model rights/guidance](docs/MODELS.md), [changelog](CHANGELOG.md), [privacy](PRIVACY.md), [security](SECURITY.md) and [release gates](docs/RELEASE-CHECKLIST.md).

## Licensing and attribution

The application retains its upstream [GNU AGPL v3 licence](LICENSE). Rastercue modifications are by Yaze Media / YazeKT (2026). Upscayl was created by Nayam Amarshe, TGS963 and its contributors. **Upscayl-NCNN is also AGPL-3.0; Real-ESRGAN's BSD notice is a separate component notice.** Fonts, native runtime dependencies and individual model weights have separate terms. The AGPL does not blanket-license every model or asset. Read [NOTICE](NOTICE.md), [legal/provenance boundaries](LEGAL.md) and [third-party notices](THIRD-PARTY-NOTICES.md).

Corresponding application source is this repository. Before any later binary release, exact native-engine provenance/source, model redistribution rights and runtime notices must be completed. Brand/name availability is not trademark-cleared. No warranty of model accuracy, suitability or commercial rights is given.

## Contribute or report an issue

Read [CONTRIBUTING](CONTRIBUTING.md). Report Rastercue issues here rather than sending fork-specific bugs upstream. Remove private filenames, paths and images before sharing diagnostics. Security issues should not include exploit details or secrets in a public issue; see [SECURITY](SECURITY.md).
