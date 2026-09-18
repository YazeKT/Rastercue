# Licence and release boundaries

This document records project decisions and known provenance gaps, not legal advice or a guarantee of clearance.

## Application source

The unchanged root LICENSE contains GNU Affero General Public License version3. Rastercue is a modified Upscayl derivative under that licence, not a proprietary relicensing. Preserve copyright notices, modification identification and applicable licence/source obligations when conveying copies. See [upstream licence](https://github.com/upscayl/upscayl/blob/main/LICENSE) and the licence text in this repository.

## Engine and models are separate

[Upscayl-NCNN](https://github.com/upscayl/upscayl-ncnn) carries [AGPL-3.0](https://github.com/upscayl/upscayl-ncnn/blob/master/LICENSE). Real-ESRGAN's BSD-3-Clause notice is retained separately. Do not label the whole native engine as BSD merely because it includes a BSD-derived component.

Exact corresponding native source for the inherited executable snapshot remains a binary-release provenance gate. The explicit setup fetch is pinned to the Upscayl application asset snapshot a00d55fee90e0f9435d5eaa86e76700df8199af8 and verifies local baseline checksums; that application snapshot alone is not proof of exact native build-source correspondence.

Model weights are not blanket-covered by the app's AGPL. Retain non-commercial warnings for Remacri, Ultramix and Ultrasharp. Other converted-weight commercial/redistribution rights may be unverified. No extra custom weights are bundled. Fetching from upstream does not confer permission for client work or redistribution. Consult creator terms linked in the model browser and [model notes](docs/MODELS.md).

The inherited Windows bundle contains vcomp140.dll and vcomp140d.dll. Debug-runtime redistribution provenance is unresolved. No native files are committed here, and binary redistribution is gated on complete runtime notices/rights.

## Brand and other assets

Yaze Media / YazeKT claims authorship of Rastercue fork branding and modifications, not inherited Upscayl code, model weights or third-party marks. No upstream endorsement is implied. Rastercue is a working name, not trademark-cleared. Poppins remains under its SIL Open Font License. Dependency licences remain independent; preserve notices in build distributions.

## Initial publication scope

Source, documentation and brand assets only. Excluded locally preserved files include native binaries, model weights, custom models, installers, personal test images/results and app-data history/logs. Any future binary release needs exact corresponding-source directions, individual model permissions, runtime/dependency notices and platform test/signing disclosures. Do not treat this source push as approval to upload release binaries or training weights.
