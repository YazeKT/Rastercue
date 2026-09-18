# Third-party notices

Retained and applicable component terms are not replaced by Rastercue branding.

| Component | Author/source | Terms/notice |
|---|---|---|
| Upscayl application | Nayam Amarshe, TGS963, contributors; github.com/upscayl/upscayl | AGPL-3.0, root LICENSE |
| Upscayl-NCNN | Upscayl and native-engine contributors; github.com/upscayl/upscayl-ncnn | AGPL-3.0; exact binary-source provenance required before binary releases |
| Real-ESRGAN | Xintao Wang and contributors; github.com/xinntao/Real-ESRGAN | BSD-3-Clause notice in Real-ESRGAN_LICENSE.txt |
| Poppins | Indian Type Foundry, Jonny Pinhorn, contributors | SIL OFL1.1, resources/brand/Poppins-OFL.txt |
| Built-in/custom models | Individual creators and conversion contributors | Individual terms; see docs/MODELS.md and linked creator evidence; no weights committed |
| Windows OpenMP runtimes | Microsoft; inherited upstream snapshot | Redistribution/notices unresolved for debug DLL; binary-release gate |
| Electron/Chromium/Node.js and npm dependencies | Their respective contributors | Upstream package notices and transitive licences must accompany later binary distributions |

package-lock.json records resolved dependencies. `npm ls --all` inventories an installed dependency tree. A binary release must supplement this source-level index with the licences/notices of its actual packaged dependencies, Electron/Chromium components and native libraries; this index is not a claim that that release audit is complete.
