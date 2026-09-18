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

### Additional verified adaptations (beta 2 audit)

File-level equality is not the only provenance check: an FP16 conversion can be verified mathematically against the creator's original FP32 tensors without replacing or altering our local weights. The read-only audit helpers in `scripts/` perform this check; they do not execute downloaded models.

**Lite and custom General v3/WDN.** `upscayl-lite-4x.bin` and custom `RealESRGAN_General_x4_v3.bin` are byte-identical (Git blob `e0a8b6ca061931284832a67cdd4112d94a7c98a0`). Every one of their 101 tensor arrays was verified against the [creator General x4v3 PTH](https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.5.0/realesr-general-x4v3.pth). The corresponding custom WDN bin, blob `a763b5065f282918ddb1aaa035d4f8b6b69fc39b`, similarly verifies against [creator WDN PTH](https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.5.0/realesr-general-wdn-x4v3.pth). In each case all 2,435,272 local bytes were consumed: convolution weights are IEEE FP16-rounded creator values; bias/PReLU values are FP16-rounded values stored as FP32. No other learned-weight changes were found. `scripts/audit-general-model.py` uses a restricted pickle reader allowing only ordered mappings, FloatStorage descriptors and tensor reconstruction descriptors, never importing PyTorch or executing a model. These conversions may be redistributed with the complete Real-ESRGAN BSD-3-Clause notice. Existing model names/bytes remain unchanged.

**High Fidelity / custom HFA2k and custom LSDIR.** High Fidelity and custom HFA2k pairs are byte-identical. All 16,684,416 convolution weights match IEEE FP16 rounding of [creator HFA2k FP32 bin](https://raw.githubusercontent.com/Phhofm/models/43a9792f0b7fda901216fbcceb925af9885eafbd/4xHFA2k/4xHFA2k_fp32.bin), blob `7a1e736a6cfa608c86c279f8428e237f1788c607`. Their 13,571 FP32 biases match exactly; local blob is `80d7a5d56afaf06ddb2770c022d44c3677a4d37c`. Custom LSDIR verifies by the same complete-data comparison against [creator LSDIR FP32 bin](https://raw.githubusercontent.com/Phhofm/models/43a9792f0b7fda901216fbcceb925af9885eafbd/4xLSDIR/4xLSDIR_fp32.bin), creator blob `be5a8ca895673175eb09c1abb87fa5135e107cdf`, local blob `fd47cffea3b6d727b2479928af181b8aa2219752`. For both, the corresponding creator `_fp32.param` in that directory differs only by input layer/tensor renaming (`input` to `input.1`/`data`) and whitespace/trailing-line formatting. `scripts/audit-model-fp16.cjs` checks parameter normalization, every weight/bias, tensor tags and complete byte consumption. Both creator cards explicitly declare CC BY 4.0: [HFA2k](https://github.com/Phhofm/models/blob/43a9792f0b7fda901216fbcceb925af9885eafbd/4xHFA2k/README.md), [LSDIR](https://github.com/Phhofm/models/blob/43a9792f0b7fda901216fbcceb925af9885eafbd/4xLSDIR/README.md). Credit Phhofm / Helaman, retain model-card and CC BY 4.0 links, and identify these precision/input-name conversions. The earlier inability to hash-match HFA2k's creator FP16 pair was caused by differing bias precision; complete comparison with the creator FP32 pair resolves that ambiguity.

**Custom LSDIRCompactC3.** The [exact C3 creator card](https://github.com/Phhofm/models/blob/43a9792f0b7fda901216fbcceb925af9885eafbd/4xLSDIRCompact/Version3/C/README.md) explicitly declares CC BY 4.0 (not merely a sibling/family card). Local `.bin` matches [creator FP16 bin](https://github.com/Phhofm/models/blob/43a9792f0b7fda901216fbcceb925af9885eafbd/4xLSDIRCompact/Version3/C/4xLSDIRCompactC3_fp16.bin), blob `5e9ec6ebb7d1811ccd9286a253e2575ae73b643c`. Parameter comparison confirms only input layer/tensor renaming and whitespace/trailing-line formatting. Credit Phhofm, link the exact card and CC BY 4.0 licence, and identify this adaptation.

Remacri, Ultramix Balanced, and Ultrasharp: preserve their upstream NON-COMMERCIAL warnings. [Creator Kim2091's primary statement in upstream issue #198](https://github.com/upscayl/upscayl/issues/198) identifies these models as CC BY-NC-SA 4.0 and requests proper attribution. [Kim2091's original UltraSharp creator repository](https://huggingface.co/Kim2091/UltraSharp) independently declares the same licence. This establishes the stated licence, but this audit has not yet verified every local converted tensor/graph for these three. Non-commercial redistribution of identified material may be permitted under [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/), requiring attribution, licence link, modification disclosure, ShareAlike and no commercial purposes; creator credit alone does not waive those conditions. Do not include unresolved conversions solely because upstream included them, and do not recommend these models for paid designer/client work.

## Custom-model set

The [upstream custom-model repository](https://github.com/upscayl/custom-models) contains no blanket licence granting all weights the same rights. It credits Xintao Wang, Kim2091, NMKD, and Phhofm. Keep import support and provenance links regardless of whether weights can be shipped.

Phhofm explicitly declares CC BY 4.0 in creator cards for HFA2k, LSDIR, Nomos8kSC and exact C3. Verified adaptations are documented above/below. Family-level or sibling model terms do not automatically license LSDIRplusC, whose creator experimental-series card does not state a licence.

The supplied custom `realesr-animevideov3-x2`, `-x3`, and `-x4` pairs were also verified against that same official Real-ESRGAN archive. All three `.bin` files match Git blob `20691050e279557160fbef5fa3f45fafeeac5402`. Their `.param` blobs respectively match `42e774841c35c8bf0ffeb215bb40c61d4868be16`, `bf4718580cc40eac9ff34f730ca64053feaf7bf4`, and `5b922cc388374b1152e01fa633bcab80b2448dae`. These three pairs may be bundled with the complete BSD notice. General/WDN conversions are now verified above. NMKD, Uniscale Restore, and the explicitly unidentified `unknown-2.0.1` remain unverified; no public redistribution is cleared by this audit.

### Verified Nomos8kSC adaptation

The custom `4xNomos8kSC.bin` exactly matches Phhofm's [`4xNomos8kSC_fp16.bin` at creator revision `43a9792f0b7fda901216fbcceb925af9885eafbd`](https://github.com/Phhofm/models/tree/43a9792f0b7fda901216fbcceb925af9885eafbd/4xNomos8kSC): Git blob `ce5cfda16b37a9808d956b748e52564f6e978fd5`. The supplied parameter file differs from the creator's corresponding parameter file only by renaming the input layer from `input` to `input.1`, its input tensor from `input` to `data`, the first convolution's input reference from `input` to `data`, and trailing-line formatting. No learned weights changed. The creator's model card explicitly declares CC BY 4.0. This verified adaptation may be redistributed with credit to Phhofm, the [CC BY 4.0 licence](https://creativecommons.org/licenses/by/4.0/), the original model-card link, and this modification description. Preserve any additional original creator notices. The audit does not extend this permission to other models by the same creator.

Packaging must include only the explicitly verified subset and must not silently substitute an unavailable model for a saved model/preset. Local custom imports remain supported. Publish separate model packs only after file-level provenance and terms are established, with their full notices inside each pack. No creator endorsement or blanket guarantee of commercial-use clearance is implied.

## Beta 2 packaging whitelist

Both `.bin` and `.param` files of these exact existing IDs may be bundled, subject to the complete BSD notice or CC attribution/modification notices above:

- Built-in: `upscayl-standard-4x`, `digital-art-4x`, `upscayl-lite-4x`, `high-fidelity-4x`.
- Custom: `realesr-animevideov3-x2`, `realesr-animevideov3-x3`, `realesr-animevideov3-x4`, `4xNomos8kSC`, `4xHFA2k`, `4xLSDIR`, `4xLSDIRCompactC3`, `RealESRGAN_General_x4_v3`, `RealESRGAN_General_WDN_x4_v3`.

Do not add `remacri-4x`, `ultramix-balanced-4x`, `ultrasharp-4x`, `4x_NMKD-Siax_200k`, `4x_NMKD-Superscale-SP_178000_G`, `4xLSDIRplusC`, `uniscale_restore` or `unknown-2.0.1` to the public installer on the basis of this audit. They remain importable when a user supplies their own weights and observes their applicable terms. This exclusion is not a claim that a creator can never grant permission; it reflects unresolved provenance or exact terms for our supplied conversions.
