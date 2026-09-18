# Release gates

Do not publish without the owner's separate approval. Working identity: YazeKT/Rastercue; repository and name availability must be checked before public release.

Build with `npm ci`, `npm run build`, `npm run test:rastercue`, `node scripts/test-rastercue-history.cjs`, and `npx electron-builder --publish never`. Windows generates NSIS and ZIP; macOS DMG and updater ZIP; Linux AppImage, DEB/RPM and ZIP. Build on native hosts. Manual build-only GitHub workflow never publishes.

Required before distribution:

- Complete real UI single, batch, double, cancellation, custom model and failure-path testing, including representative designer images.
- Verify laptop controls, high-DPI/smaller windows, translations, keyboard/focus, zoom alignment and gestures.
- Verify installed settings/history persistence, history crash recovery, rename collisions and locked/missing files.
- Smoke test actual macOS and Linux packages. Signing/notarisation needs owner credentials; unsigned Windows binaries must be labelled honestly.
- Isolate any dependency security update from the UI changes and repeat engine/UI regressions. No general dependency upgrade was performed here.
- Preserve AGPL source obligations, LICENSE, engine/model notices and font OFL. Unknown model rights do not permit redistribution or commercial use. No extra custom weights are bundled.
- Audit secrets, ignored artifacts and release contents. Keep credentials outside source control.
- After approved publication, test an installed older version against hosted updater metadata/assets, disabled updates, offline errors and busy-job restart guard. Linux/portable formats differ in updater support; verify each separately.

The original full GUI runtime baseline was interrupted by a development dependency installation. Protected-file hashes, payload-contract tests and direct engine decoded-image comparisons provide narrower evidence; they do not replace packaged workflow acceptance.
