# Development

Use Node.js 22 LTS with npm and a native target host. Electron/React 18/Next 15 architecture is retained. A separate security pass updates the Electron runtime and affected dependencies; it does not replace the upscaling engine. Audit the lockfile and repeat processing regressions after dependency changes.

1. `npm ci` installs the locked dependencies.
2. Read LEGAL.md and creator terms. `npm run assets:fetch -- --acknowledge-model-terms` obtains existing baseline assets from pinned upstream revision a00d55fee90e0f9435d5eaa86e76700df8199af8 and verifies SHA-256 against tests/engine-baseline.json. Existing mismatched files are never overwritten. `--verify` checks local assets without downloads; `--engine-only` obtains no model weights. `--verify-origin` verifies installed files against the pinned Git tree.
3. `npm run build` regenerates brand assets and compiles Electron plus the static renderer. `npm start` launches development Electron. Development starts a local Next server through the inherited electron-next integration.
4. `npm run test:rastercue` runs processing/baseline/security regressions; `npm run test:history` checks persistence/naming using temporary data. Fetch baseline assets before hash tests. The sibling custom-model folder is optional for catalogue-only tests.
5. Before packaging, run `npm run release:models -- --acknowledge-model-terms` to stage the permitted custom pairs from the local sibling folder or checksum-pinned upstream files, then obtain complete native source and generate notices as below. `npx electron-builder --win --x64 --publish never` produces the installer/ZIP and unpacked app. Publication is a separate explicit owner-authorized step.

```sh
git clone --branch 20240601-103425 --depth 1 https://github.com/upscayl/upscayl-ncnn.git native-source
git -C native-source -c url.https://github.com/.insteadOf=git@github.com: submodule update --init --recursive
npm run release:notices -- ./native-source
```

Verify native-source HEAD is 22774bc42e2bc3c785b5b585d213d960b1348ad5 and submodules match docs/ENGINE-PROVENANCE.md. Archive complete source recursively, excluding `.git` only, and supply it next to native binary downloads. Public filters retain only four verified built-ins and nine checksum-pinned custom pairs, excluding both Microsoft OpenMP DLLs. Install Microsoft's runtime directly if required. Generated notices/weights are ignored artifacts; do not commit the native source checkout.

Optional packaged Playwright tests require a separately available Playwright installation. Set RASTERCUE_PLAYWRIGHT_PATH to its module path, then run tests/packaged-ui.cjs or tests/packaged-processing.cjs. They launch only the Windows unpacked app and isolate app data under a temporary directory. RASTERCUE_TEST_INPUT and RASTERCUE_TEST_FORMAT override UI fixture/format; test outputs are ignored. Existing direct-engine smoke scripts need local baseline fixture images and optional custom weights, not provided in this source-only publication. Do not commit private inputs or generated results.

Core boundary: tests/engine-baseline.json protects original binaries/model files and processing handlers/arguments/scales. electron/utils/spawn-upscayl.ts adds a cancellable JPG-only temporary RGB compatibility wrapper; PNG/WebP directly retain the original native spawn path. History observes original lifecycle events and applies naming afterward.

Source publication excludes native/model folders, cloud API docs, inherited MAS/Flatpak configs, private fixtures, app data and output artifacts. They remain untouched locally where present. Platform packaging targets are configured but signing/native runtime verification/model redistribution are separate gates. The native build workflow is manual and refuses packaging unless its explicit rights-gate input is enabled; the source CI produces no binary artifacts.

No migration silently reads Upscayl's application data. Rastercue's default app-data history is local; RASTERCUE_TEST_USER_DATA isolates tests. Never use a real profile for automated tests. See PRIVACY.md and SECURITY.md.
