# Release gates

Owner authorized source, Windows binaries and permitted models on 18 September 2026. Repository is YazeKT/Rastercue. Release as an explicitly unsigned Windows beta, not a verified cross-platform production release. Broader production promotion requires the remaining gates below; working name is not trademark-cleared.

Build with `npm ci`, `npm run build`, `npm run test:rastercue`, `node scripts/test-rastercue-history.cjs`, and `npx electron-builder --publish never`. Windows generates NSIS and ZIP; macOS DMG and updater ZIP; Linux AppImage, DEB/RPM and ZIP. Build on native hosts. Manual build-only GitHub workflow never publishes.

Required before production promotion (the owner has separately authorised the disclosed Windows work-PC testing beta):

- Complete real UI single, batch, double, cancellation, custom model and failure-path testing, including representative designer images.
- Verify laptop controls, high-DPI/smaller windows, translations, keyboard/focus, zoom alignment and gestures.
- Verify installed settings/history persistence, history crash recovery, rename collisions and locked/missing files.
- Smoke test actual macOS and Linux packages. Signing/notarisation needs owner credentials; unsigned Windows binaries must be labelled honestly.
- Isolated release dependency/security pass completed; full/production npm audits currently zero known advisories. Repeat source/packaged regressions and inventory checks for the final assets.
- Preserve AGPL source, app/native/model/font/component notices. Exact Windows native release verified; publish full recursive corresponding source beside binaries. Only verified Standard/Digital Art and the credited four-model optional pack are permitted by the current audit. Other weights remain excluded. No Microsoft runtime DLLs are redistributed.
- Audit secrets, ignored artifacts and release contents. Keep credentials outside source control.
- After approved publication, test an installed older version against hosted updater metadata/assets, disabled updates, offline errors and busy-job restart guard. Linux/portable formats differ in updater support; verify each separately.

The original full GUI runtime baseline was interrupted by a development dependency installation. Protected-file hashes, payload-contract tests and direct engine decoded-image comparisons provide narrower evidence; they do not replace packaged workflow acceptance.
