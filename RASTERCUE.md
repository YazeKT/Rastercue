# Rastercue

Designer-focused, local image upscaling based on Upscayl. Rastercue changes the interface, image inspection and job records—not the established native processing engine.

Open the Windows local build with **Run Rastercue.cmd** in the project folder. This is an unsigned local release candidate, not a published release. Use copies of project images for initial testing.

Choose an image (or batch folder), model, enlargement, format and destination, then start. JPG is the new-install default; PNG retains transparency. Open the model browser for creator evidence and limitations. Custom models are imported from a paired .bin/.param folder; weights in the sibling custom-models-main folder are not automatically bundled or commercially cleared.

Inspect outputs with the persistent before/after divider, pointer-centred scroll zoom, drag pan, Fit/100%/Reset and session bookmarks. Job tools show file measurements and allow single-output naming; history keeps local records and thumbnails across restarts. Logs can be enlarged, filtered, copied and exported.

Build: `npm ci`, `npm run build`, `npm run test:rastercue`, `node scripts/test-rastercue-history.cjs`, then `npx electron-builder --publish never`. No broad dependency upgrade is part of this fork.

See [changelog](CHANGELOG.md), [privacy](PRIVACY.md), [implementation evidence](docs/IMPLEMENTATION-STATUS.md), [release gates](docs/RELEASE-CHECKLIST.md) and [design decisions](DESIGN.md). New guidance is currently English; inherited language/theme choices remain available. This is not yet a fully translated release.

Credits: Upscayl by Nayam Amarshe, TGS963 and contributors; native Upscayl-NCNN/Real-ESRGAN engine and model creators retain their authorship. Rastercue fork identity and interface improvements: YazeKT. Original LICENSE (AGPL-3.0), engine notices and model-specific terms remain applicable. Downloadability is not a commercial-use or redistribution licence.
