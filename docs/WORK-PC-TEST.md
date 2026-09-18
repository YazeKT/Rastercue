# Windows work-PC beta test

Target: i5-8600K, Radeon RX 580, 32 GB DDR4. This machine has not yet been verified. Keep the original Upscayl installed for comparison; Rastercue uses separate application data and does not migrate its settings.

## Install

Download the Windows EXE from the beta release. It is unsigned, so check the repository/release origin and published SHA-256 before running it. If workplace policy blocks unsigned programs, ask your IT administrator rather than bypassing the policy. Alternatively extract the entire Windows ZIP and run Rastercue.exe inside it.

Install Microsoft's official Visual C++ x64 Redistributable if requested. Use a Vulkan-capable Radeon driver approved by your workplace. Do not install random DLLs from third-party sites.

## Compare with original Upscayl

1. Use copies of a few non-confidential images and separate, empty output folders. Do not overwrite existing deliverables.
2. Match model, scale, GPU selection, tile setting, TTA, output format, compression and metadata settings between apps. Use Standard or Digital Art, the verified models included with this beta.
3. Start with a small image in PNG, then a real photograph, illustration and transparent artwork. For transparent artwork use PNG; JPG intentionally flattens transparent areas on white.
4. Test JPG separately, including an opaque RGBA PNG. Inspect the saved file in an independent image viewer, not only the Rastercue preview. Check colour, stripes, edges and dimensions.
5. Test a small batch, double pass and cancellation. Double pass can be very large (4× then 4× is 16×).
6. Check slider alignment, wheel zoom, pan, Fit/100%, output naming, history after restarting, and readable logs. Confirm errors never appear as successful jobs.
7. Optional: extract the verified custom-model pack and select its models folder in Settings. Test anime x2 on suitable animation artwork; read creator licences before paid work.

## Feedback

Record app version, Windows/driver version, RX 580 VRAM capacity (4 GB or 8 GB), image dimensions, model and settings, elapsed time, output dimensions, and whether the same case works in original Upscayl. Note any visual issue in the independently opened output. Share a redacted log and a non-confidential sample only when permitted; do not publish customer artwork or private file paths.

The laptop has produced both successful comparison tests and intermittent Vulkan allocation failures. Final hardware-accelerated beta UI checks passed, but its latest processing attempt failed allocation on that host. This is a work-PC evaluation release, not a claim of production or cross-platform acceptance. Signing, clean-machine installation, hosted older-version updates and macOS/Linux tests remain outstanding.
