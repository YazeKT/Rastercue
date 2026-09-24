# Stable release checklist

The owner accepted Rastercue 1.0 for publication on 24 September 2026 after testing the application and website on the intended AMD work PC. Repository: YazeKT/Rastercue. Release as an explicitly unsigned Windows 10/11 x64 stable build; do not imply a verified Windows publisher or cross-platform binary support. The working name is not trademark-cleared.

Build with `npm ci`, `npm run build`, `npm run test:rastercue`, `npm run test:studio`, `node scripts/test-rastercue-history.cjs`, and `npx electron-builder --publish never`. Windows generates the supported NSIS and ZIP artifacts. macOS and Linux remain source/roadmap targets and require separate native-host acceptance before any future binary claim. The manual build-only GitHub workflow never publishes.

Required for the exact stable artifacts:

- [x] Owner-tested the compact workspace and AMD RX 580 Vulkan processing path.
- [x] Verified packaged single, batch, double-pass, cancellation and failure handling with representative images.
- [x] Verified settings/history persistence, thumbnails, licences and compact-window reachability.
- [x] Recorded the native CPU no-Vulkan probe, model/format/alpha/batch/cancellation matrix and a completed packaged UI Standard job.
- [x] Repeat source/packaged regressions, production dependency audit, inventory and credential/privacy scans for the exact release commit and artifacts.
- [x] Preserve AGPL source plus app, native-engine, model, font and component notices. Publish complete recursive Windows engine source beside binaries.
- [x] Package only the documented stable model set. Anime Video x2/x3 remain outside stable packaged/public claims; Anime Video x4 remains documented. Other unresolved weights remain excluded.
- [x] Publish checksums and the SBOM; do not redistribute Microsoft runtime DLLs.
- [x] Label Windows artifacts unsigned. macOS/Linux remain source/roadmap targets.
- [ ] After publication, test GitHub updater metadata/assets, disabled updates, offline errors and the busy-job restart guard using an installed older version.

Protected-file hashes, payload-contract tests and direct engine decoded-image comparisons support—but do not replace—the accepted packaged Windows workflow. Any artifact rebuilt after approval must repeat the applicable checks before release.
