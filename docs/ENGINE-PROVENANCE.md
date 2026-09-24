# Windows engine provenance

Verified on 18 September 2026. These checks identify inherited bytes; they are not a claim that the engine was rebuilt locally.

The Windows `resources/win/bin/upscayl-bin.exe` has SHA-256 `704fd622984220c8c646a8dff4c7eba1cc62fbb8c47383996f38571f76b73fbf`. It exactly matches the executable in the [official Upscayl-NCNN release 20240601-103425](https://github.com/upscayl/upscayl-ncnn/releases/tag/20240601-103425), downloaded and extracted during the release audit. The application asset snapshot alone was not used as proof of corresponding engine source.

The native release tag and release API identify commit `22774bc42e2bc3c785b5b585d213d960b1348ad5`. [Corresponding native source](https://github.com/upscayl/upscayl-ncnn/tree/22774bc42e2bc3c785b5b585d213d960b1348ad5) carries AGPL-3.0. Keep its complete licence and original notices with distributed copies, alongside Rastercue's application source and licence.

## Complete source and build inputs

The pinned source includes build scripts and `.github/workflows/release.yml`. Its Windows workflow uses Vulkan SDK 1.3.280.0, CMake x64, and `cmake --build . --config Release -j 2`.

Git submodules must be included in a corresponding-source distribution; a GitHub-generated source ZIP alone does not include them:

| Path | Original repository | Pinned revision |
|---|---|---|
| `src/ncnn` | https://github.com/Tencent/ncnn | `6125c9f47cd14b589de0521350668cf9d3d37e3c` |
| `src/libwebp` | https://github.com/webmproject/libwebp | `8ea81561d2fdd382da60f57958741a7c23a18eb6` |

When publishing the native executable, provide the complete pinned source, recursive submodule sources, original notices, and build directions through the same release download location. Preserve notices for statically included components as well as the native project's AGPL licence. The verified engine is not replaced by a newer upstream release.

## Microsoft runtime boundary

The official upstream workflow copied both `vcomp140.dll` and `vcomp140d.dll` into its ZIP. Rastercue's PE import audit found normal imports of `VCOMP140.DLL`, not `VCOMP140D.DLL`; the delay-import directory was empty. The debug DLL is unnecessary for this executable and must be excluded from public packages, while leaving the locally inherited file untouched.

[Microsoft states that Visual C++ debug-library DLLs are not redistributable](https://learn.microsoft.com/en-us/cpp/windows/preparing-a-test-machine-to-run-a-debug-executable?view=msvc-170). Attribution is not a substitute for this restriction. Supply the supported release runtime through Microsoft's permitted redistributable route, retain applicable terms, and test the package without the debug DLL and without relying on a Visual Studio installation.

Rastercue excludes both inherited OpenMP DLLs from public packages rather than asserting the publisher holds Microsoft's required redistribution licence. The x64 runtime is an external prerequisite obtained directly from Microsoft's official download page. Startup warns if its release OpenMP DLL is absent. The local inherited files remain untouched.

The complete source archive also includes recursive NCNN submodules: glslang 4afd69177258d0636f78d2c4efb823ab6382a187 and pybind11 70a58c577eaf067748c2ec31bfd0b0a614cffba6. `.git` metadata is excluded, not source/build scripts/notices.

This audit establishes Windows engine identity only; do not infer verified native provenance or runtime execution for macOS/Linux from it.

## Rastercue NCNN CPU sidecar

Rastercue 1.0 adds a separate Windows x64 CPU-only executable; it does not replace or modify the protected Upscayl Vulkan binary. The sidecar loads the same NCNN `.param`/`.bin` model pairs directly and reports a machine-readable contract with `backend: cpu`, `runtime: ncnn`, and `vulkan: false` before the app enables CPU selection.

Its source and reproducible build are in `native/rastercue-cpu` and `scripts/build-rastercue-cpu.ps1`. The build pins NCNN at `6125c9f47cd14b589de0521350668cf9d3d37e3c` and libwebp at `8ea81561d2fdd382da60f57958741a7c23a18eb6`, configures `NCNN_VULKAN=OFF`, and stages the probed executable separately as `rastercue-cpu.exe`. The CPU tiling path is adapted from nihui/realsr-ncnn-vulkan commit `b7f890ee2704ccea76c73d9fd4d5b3298dd1beca`; its MIT notice is retained in `native/rastercue-cpu/NIHUI-REALSRCNN-MIT.txt`.

The release corresponding-source archive includes the modified CPU source, its pinned NCNN/libwebp dependency source, build files and notices as well as the protected Vulkan engine source. CPU TTA is rejected explicitly in 1.0 because that route has not passed the output regression matrix; the app never silently changes backend or drops TTA.
