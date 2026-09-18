# Development

Use Node.js20+ with npm and a native target host for desktop packaging. The existing Electron33/React18/Next15 architecture is preserved; dependencies are not broadly upgraded as part of the UI fork.

1. `npm ci` installs the locked dependencies.
2. Read LEGAL.md and creator terms. `npm run assets:fetch -- --acknowledge-model-terms` obtains existing baseline assets from pinned upstream revision a00d55fee90e0f9435d5eaa86e76700df8199af8 and verifies SHA-256 against tests/engine-baseline.json. Existing mismatched files are never overwritten. `--verify` checks local assets without downloads; `--engine-only` obtains no model weights. `--verify-origin` verifies installed files against the pinned Git tree.
3. `npm run build` regenerates brand assets and compiles Electron plus the static renderer. `npm start` launches development Electron. Development starts a local Next server through the inherited electron-next integration.
4. `npm run test:rastercue` runs16 regression tests. `npm run test:history` exercises local persistence/naming safety with temporary data. Missing baseline assets must be obtained before hash tests; the optional sibling custom-model folder is not required for catalogue-only tests.
5. `npx electron-builder --win --dir --publish never` creates a local Windows unpacked candidate. Run dist/win-unpacked/Rastercue.exe. Never use publish scripts until binary-release gates are complete.

Optional packaged Playwright tests require a separately available Playwright installation. Set RASTERCUE_PLAYWRIGHT_PATH to its module path, then run tests/packaged-ui.cjs or tests/packaged-processing.cjs. They launch only the Windows unpacked app and isolate app data under a temporary directory. RASTERCUE_TEST_INPUT and RASTERCUE_TEST_FORMAT override UI fixture/format; test outputs are ignored. Existing direct-engine smoke scripts need local baseline fixture images and optional custom weights, not provided in this source-only publication. Do not commit private inputs or generated results.

Core boundary: tests/engine-baseline.json protects original binaries/model files and processing handlers/arguments/scales. electron/utils/spawn-upscayl.ts adds a cancellable JPG-only temporary RGB compatibility wrapper; PNG/WebP directly retain the original native spawn path. History observes original lifecycle events and applies naming afterward.

Source publication excludes native/model folders, cloud API docs, inherited MAS/Flatpak configs, private fixtures, app data and output artifacts. They remain untouched locally where present. Platform packaging targets are configured but signing/native runtime verification/model redistribution are separate gates. The native build workflow is manual and refuses packaging unless its explicit rights-gate input is enabled; the source CI produces no binary artifacts.

No migration silently reads Upscayl's application data. Rastercue's default app-data history is local; RASTERCUE_TEST_USER_DATA isolates tests. Never use a real profile for automated tests. See PRIVACY.md and SECURITY.md.
