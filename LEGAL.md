# Licence and release boundaries

This document records project decisions and known provenance gaps, not legal advice or a guarantee of clearance.

## Application source

The unchanged root LICENSE contains GNU Affero General Public License version3. Rastercue is a modified Upscayl derivative under that licence, not a proprietary relicensing. Preserve copyright notices, modification identification and applicable licence/source obligations when conveying copies. See [upstream licence](https://github.com/upscayl/upscayl/blob/main/LICENSE) and the licence text in this repository.

## Engine and models are separate

[Upscayl-NCNN](https://github.com/upscayl/upscayl-ncnn) carries [AGPL-3.0](https://github.com/upscayl/upscayl-ncnn/blob/master/LICENSE). Real-ESRGAN's BSD-3-Clause notice is retained separately. Do not label the whole native engine as BSD merely because it includes a BSD-derived component.

The Windows executable exactly matches native release 20240601-103425, source commit 22774bc42e2bc3c785b5b585d213d960b1348ad5. Complete corresponding source, recursive submodules and build scripts accompany the Windows release. See [native provenance](docs/ENGINE-PROVENANCE.md). Setup assets remain independently pinned to a00d55fee90e0f9435d5eaa86e76700df8199af8. macOS/Linux native correspondence is not inferred from Windows evidence.

Model weights are not blanket-covered by the app's AGPL. Retain non-commercial warnings for Remacri, Ultramix and Ultrasharp. Beta 2 bundles only the verified four built-in and nine custom pairs in MODEL-REDISTRIBUTION.md, with complete BSD/CC notices and adaptation attribution. Eight other supplied pairs remain excluded. Fetching from upstream does not confer permission for client work or redistribution. Consult creator terms linked in the model browser and [model notes](docs/MODELS.md).

The inherited local Windows folder contains vcomp140.dll and vcomp140d.dll. Neither is publicly packaged. Microsoft prohibits debug-DLL redistribution; release runtime distribution has separate licensing conditions. Users obtain the x64 Visual C++ Redistributable directly from Microsoft if missing. Local inherited files remain untouched.

## Brand and other assets

Yaze Media / YazeKT claims authorship of Rastercue fork branding and modifications, not inherited Upscayl code, model weights or third-party marks. No upstream endorsement is implied. Rastercue is a working name, not trademark-cleared. Poppins remains under its SIL Open Font License. Dependency licences remain independent; preserve notices in build distributions.

## Initial publication scope

Source control excludes binaries and private data. The owner authorized Windows testing binaries and verified models. Beta 2 assets contain the unchanged Windows engine, four built-in and nine automatically loaded custom pairs, full notices and corresponding native source. Other models remain excluded pending file-level rights verification. See [model evidence](docs/MODEL-REDISTRIBUTION.md). Windows beta binaries are unsigned; no verified macOS/Linux binary release or trademark clearance is claimed. Further major-update development remains local until the owner approves publication.
