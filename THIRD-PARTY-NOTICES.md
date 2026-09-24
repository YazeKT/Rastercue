# Third-party notices

Retained and applicable component terms are not replaced by Rastercue branding.

| Component | Author/source | Terms/notice |
|---|---|---|
| Upscayl application | Nayam Amarshe, TGS963, contributors; github.com/upscayl/upscayl | AGPL-3.0, root LICENSE |
| Upscayl-NCNN | Upscayl and native-engine contributors; github.com/upscayl/upscayl-ncnn | AGPL-3.0; verified Windows revision and complete recursive source archive, docs/ENGINE-PROVENANCE.md |
| Rastercue NCNN CPU sidecar | Yaze Media / YazeKT; derived from Upscayl-NCNN with CPU tiling informed by nihui/realsr-ncnn-vulkan | AGPL-3.0 application/native source; retained nihui MIT notice; pinned NCNN BSD-3-Clause and libwebp notice; docs/ENGINE-PROVENANCE.md |
| Real-ESRGAN | Xintao Wang and contributors; github.com/xinntao/Real-ESRGAN | BSD-3-Clause notice in Real-ESRGAN_LICENSE.txt |
| Poppins | Indian Type Foundry, Jonny Pinhorn, contributors | SIL OFL1.1, resources/brand/Poppins-OFL.txt |
| Released built-in models | Xintao Wang/Real-ESRGAN; Phhofm (Philip Hofmann), retained upstream Helaman credit | Standard/Digital Art/Lite BSD-3-Clause; High Fidelity CC BY 4.0 verified adaptation |
| Installer-bundled custom models | Xintao Wang/Real-ESRGAN; Phhofm | Anime x4 and General/WDN v3 BSD-3-Clause; HFA2k/LSDIR/C3/Nomos8kSC CC BY 4.0 adaptations; full creator links/modification notices in docs/MODEL-REDISTRIBUTION.md. Anime x2/x3 are provenance-documented but excluded from the stable package. |
| Other models | Individual creators/conversion contributors | Unverified file-level rights; not publicly bundled |
| Windows OpenMP runtime | Microsoft | External prerequisite from Microsoft; no runtime DLLs redistributed |
| Electron/Chromium/Node.js and npm dependencies | Their respective contributors | Upstream package notices and transitive licences must accompany later binary distributions |

package-lock.json records resolved dependencies. Windows packages include installed dependency/native source component notices under resources/notices/compiled plus app/model/font notices. Electron/Chromium notices accompany the executable. The compiled inventory includes build-only dependencies too, not a claim every listed component runs in the app. Corresponding native source is a separate asset at the same release location.
