# Rastercue NCNN CPU sidecar

This is a separate CPU-only inference executable. It does not replace or modify the protected Upscayl Vulkan executable. It loads Rastercue's existing NCNN `.param` and `.bin` model pairs directly, so no weight conversion or silent model substitution occurs.

The command surface intentionally follows the inherited engine for input/output, models, scale, resize, compression, tile size, thread profile and output format. `-g` is rejected because this process never selects a GPU. `-x` is rejected before processing in this first CPU sidecar because the CPU TTA path has not yet passed the protected-output regression matrix. The original Vulkan backend retains TTA support.

Build on Windows x64 from the repository root:

```powershell
powershell -ExecutionPolicy Bypass -File scripts\build-rastercue-cpu.ps1
```

The script fetches checksum/revision-pinned NCNN and libwebp source into the ignored `vendor/` directory, obtains a checksum-pinned portable CMake only when CMake is unavailable, builds with MSVC x64, and runs the machine-readable probe. The binary is produced at `native/rastercue-cpu/build/Release/rastercue-cpu.exe`.

Source lineage and licences:

- Upscayl-NCNN commit `22774bc42e2bc3c785b5b585d213d960b1348ad5`, AGPL-3.0, supplies the CLI/image pipeline foundation.
- Tencent NCNN commit `6125c9f47cd14b589de0521350668cf9d3d37e3c`, BSD-3-Clause, supplies CPU inference.
- libwebp commit `8ea81561d2fdd382da60f57958741a7c23a18eb6`, BSD-style licence, supplies WebP I/O.
- nihui/realsr-ncnn-vulkan commit `b7f890ee2704ccea76c73d9fd4d5b3298dd1beca`, MIT, supplies the reference CPU tiling/inference design. Its complete notice is retained in `NIHUI-REALSRCNN-MIT.txt`.

Public binary distribution must include this modified source, the pinned dependency sources (or a durable corresponding-source offer satisfying AGPL requirements), and all applicable notices. This is an engineering record, not legal advice.
