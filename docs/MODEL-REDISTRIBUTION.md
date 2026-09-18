# Model redistribution evidence

Release audit: 18 September 2026. Creator credit and downloadability do not, by themselves, grant redistribution rights. This evidence is separate from model-selection guidance and the application's AGPL licence.

## Verified built-in pairs

The [original creator's Real-ESRGAN v0.2.5.0 release](https://github.com/xinntao/Real-ESRGAN/releases/tag/v0.2.5.0) supplies `realesrgan-ncnn-vulkan-20220424-windows.zip`. Both files of each following locally bundled pair exactly match files extracted from that official archive. Hashes below are Git blob SHA-1 identifiers, including the Git blob header, not raw SHA-1 file hashes.

| Rastercue filename | Creator filename | Verified Git blob |
|---|---|---|
| `upscayl-standard-4x.bin` | `realesrgan-x4plus.bin` | `5cea94783710c25d6fffa9fe9b59999498aec3d4` |
| `upscayl-standard-4x.param` | `realesrgan-x4plus.param` | `d14d62ebb815bdd522ed112e67695b3377f86ca0` |
| `digital-art-4x.bin` | `realesrgan-x4plus-anime.bin` | `95201b7beeefaa2de45bc80f77f879f51d2fc534` |
| `digital-art-4x.param` | `realesrgan-x4plus-anime.param` | `6c98f9a1932603688683a6f0108cbdfcd6b3e680` |

Credit: Xintao Wang and Real-ESRGAN contributors, copyright (c) 2021 Xintao Wang. [Creator BSD-3-Clause licence](https://github.com/xinntao/Real-ESRGAN/blob/master/LICENSE) permits source/binary redistribution subject to retention of the copyright, conditions, disclaimer and non-endorsement restriction. Include the complete `Real-ESRGAN_LICENSE.txt` with the weights and application distribution. Original names are recorded here; the existing engine-facing names and bytes remain unchanged. This establishes a functional Standard default without distributing undocumented models.

## Remaining built-ins

Lite: exact creator-file identity and terms remain unverified. High Fidelity: upstream credits Helaman's HFA2k; Phhofm's creator model card declares CC BY 4.0 for HFA2k, but the local High Fidelity pair does not exactly match the creator's currently published NCNN pair. Do not treat that filename attribution as completed identity verification.

Remacri, Ultramix Balanced, and Ultrasharp: preserve their upstream NON-COMMERCIAL warnings. Their exact applicable redistribution terms still need verification. Do not include these in a public package solely because upstream included them or because attribution has been supplied.

## Custom-model set

The [upstream custom-model repository](https://github.com/upscayl/custom-models) contains no blanket licence granting all weights the same rights. It credits Xintao Wang, Kim2091, NMKD, and Phhofm. Keep import support and provenance links regardless of whether weights can be shipped.

Phhofm explicitly declares CC BY 4.0 in creator cards for [HFA2k](https://github.com/Phhofm/models/tree/main/4xHFA2k), [LSDIR](https://github.com/Phhofm/models/tree/main/4xLSDIR), and [Nomos8kSC](https://github.com/Phhofm/models/tree/main/4xNomos8kSC). Redistributing verified creator weights requires appropriate attribution, the licence link and identification of modifications/conversions. The supplied custom NCNN conversions must be identity-verified before asserting their exact rights. Family-level or sibling model terms do not automatically license LSDIRplusC or LSDIRCompactC3.

The supplied custom `realesr-animevideov3-x2`, `-x3`, and `-x4` pairs were also verified against that same official Real-ESRGAN archive. All three `.bin` files match Git blob `20691050e279557160fbef5fa3f45fafeeac5402`. Their `.param` blobs respectively match `42e774841c35c8bf0ffeb215bb40c61d4868be16`, `bf4718580cc40eac9ff34f730ca64053feaf7bf4`, and `5b922cc388374b1152e01fa633bcab80b2448dae`. These three pairs may join a separately attributed BSD-notice model pack. General/WDN conversions still require exact identity verification. NMKD, Uniscale Restore, and the explicitly unidentified `unknown-2.0.1` remain unverified; no public redistribution is cleared by this audit.

### Verified Nomos8kSC adaptation

The custom `4xNomos8kSC.bin` exactly matches Phhofm's [`4xNomos8kSC_fp16.bin` at creator revision `43a9792f0b7fda901216fbcceb925af9885eafbd`](https://github.com/Phhofm/models/tree/43a9792f0b7fda901216fbcceb925af9885eafbd/4xNomos8kSC): Git blob `ce5cfda16b37a9808d956b748e52564f6e978fd5`. The supplied parameter file differs from the creator's corresponding parameter file only by renaming the input layer from `input` to `input.1`, its input tensor from `input` to `data`, the first convolution's input reference from `input` to `data`, and trailing-line formatting. No learned weights changed. The creator's model card explicitly declares CC BY 4.0. This verified adaptation may be redistributed with credit to Phhofm, the [CC BY 4.0 licence](https://creativecommons.org/licenses/by/4.0/), the original model-card link, and this modification description. Preserve any additional original creator notices. The audit does not extend this permission to other models by the same creator.

Packaging must include only the explicitly verified subset and must not silently substitute an unavailable model for a saved model/preset. Local custom imports remain supported. Publish separate model packs only after file-level provenance and terms are established, with their full notices inside each pack. No creator endorsement or blanket guarantee of commercial-use clearance is implied.
