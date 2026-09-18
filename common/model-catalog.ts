/** Presentation metadata only. Never use this catalogue to construct engine arguments. */
export interface ModelGuide {
  id: string;
  name: string;
  creator: string;
  use: string;
  example: string;
  avoid: string;
  performance: string;
  rights: string;
  evidence: string;
  sources: string[];
}

const upstream = "https://github.com/upscayl/upscayl";
const custom = "https://github.com/upscayl/custom-models";
const phhofm = "https://github.com/Phhofm/models/tree/main/";
const real = "https://github.com/xinntao/Real-ESRGAN/blob/master/docs/";
const caution =
  "Rastercue guidance: test a representative crop at 100%. Do not use reconstructed details as factual evidence or expect exact text/logo restoration.";
const unverified =
  "Commercial use and redistribution of these converted weights are unverified. Check the creator’s terms before paid work.";
const performance =
  "No verified image-size or VRAM limit. Actual speed and memory depend on image size, GPU and existing processing settings.";

const guide = (
  id: string,
  name: string,
  use: string,
  example: string,
  extra: Partial<ModelGuide> = {},
): ModelGuide => ({
  id,
  name,
  use,
  example,
  creator: "Upscayl upstream",
  avoid: caution,
  performance,
  rights: unverified,
  evidence:
    "Upstream usage description; Rastercue examples are test-first suggestions, not quality guarantees.",
  sources: [upstream],
  ...extra,
});

export const MODEL_CATALOG: ModelGuide[] = [
  guide(
    "upscayl-standard-4x",
    "Standard",
    "Upstream recommends this for most images.",
    "Start with a general photograph and inspect edges and faces.",
    {
      creator: "Xintao Wang / Real-ESRGAN",
      rights: "BSD-3-Clause. Exact creator model pair verified; retain copyright, conditions and disclaimer when redistributing.",
      evidence: "Both files match original creator realesrgan-x4plus release bytes. See Rastercue model redistribution evidence.",
      sources: [upstream, "https://github.com/xinntao/Real-ESRGAN/releases/tag/v0.2.5.0", "https://github.com/YazeKT/Rastercue/blob/main/docs/MODEL-REDISTRIBUTION.md"],
    },
  ),
  guide(
    "upscayl-lite-4x",
    "Lite",
    "General images; upstream describes high-speed upscaling with minimal quality loss.",
    "Try a general photo when turnaround matters; compare against Standard.",
    {
      creator: "Xintao Wang / Real-ESRGAN",
      rights: "BSD-3-Clause. Complete local tensor data verified as FP16 adaptation of creator General x4v3; retain complete creator licence notice.",
      evidence: "All 101 tensor arrays verified against original creator General x4v3 release, including rounded biases and PReLU arrays.",
      sources: [upstream, "https://github.com/xinntao/Real-ESRGAN/releases/tag/v0.2.5.0"],
      performance: "Upstream describes this as a faster option. " + performance,
    },
  ),
  guide(
    "high-fidelity-4x",
    "High Fidelity",
    "Upstream describes realistic details and smooth textures across image types.",
    "Compare skin and fabric textures against Standard.",
    {
      creator: "Phhofm (creator files); Helaman (additional upstream credit)",
      rights: "CC BY 4.0. Verified HFA2k FP16 adaptation; credit creator, link licence and describe conversion when sharing.",
      evidence: "All 16,684,416 learned weights and unchanged FP32 biases verified against creator HFA2k FP32 NCNN; input names/formatting adapted.",
      sources: [upstream, phhofm + "4xHFA2k"],
    },
  ),
  guide(
    "remacri-4x",
    "Remacri",
    "Natural images with added sharpness and detail, according to upstream.",
    "Inspect a natural-photo crop for unwanted sharpening.",
    {
      creator: "Foolhardy (upstream attribution)",
      rights:
        "NON-COMMERCIAL — CC BY-NC-SA 4.0 stated by creator Kim2091 in upstream licence issue. Attribution, modification disclosure and ShareAlike required; exact local conversion remains unverified. Do not use for paid work.",
      sources: [upstream, "https://github.com/upscayl/upscayl/issues/198"],
    },
  ),
  guide(
    "ultramix-balanced-4x",
    "Ultramix Balanced",
    "Natural images with balanced sharpness and detail, according to upstream.",
    "Compare a landscape’s fine foliage and smooth sky.",
    {
      creator: "Kim2091",
      rights:
        "NON-COMMERCIAL — CC BY-NC-SA 4.0, confirmed by creator licence statement. Attribution, modification disclosure and ShareAlike required; exact local conversion remains unverified. Do not use for paid work.",
      sources: [upstream, "https://github.com/upscayl/upscayl/issues/198"],
    },
  ),
  guide(
    "ultrasharp-4x",
    "Ultrasharp",
    "Natural images with a focus on sharpness, according to upstream.",
    "Inspect high-contrast photo edges for halos.",
    {
      creator: "Kim2091",
      rights:
        "NON-COMMERCIAL — CC BY-NC-SA 4.0, confirmed by creator card. Attribution, modification disclosure and ShareAlike required; exact local conversion remains unverified. Do not use for paid work.",
      sources: [upstream, "https://huggingface.co/Kim2091/UltraSharp", "https://github.com/upscayl/upscayl/issues/198"],
    },
  ),
  guide(
    "digital-art-4x",
    "Digital Art",
    "Digital art and illustrations, according to upstream.",
    "Try illustrated linework; inspect contours and flat fills.",
    {
      creator: "Xintao Wang / Real-ESRGAN",
      rights: "BSD-3-Clause. Exact creator model pair verified; retain full licence notice when redistributing.",
      evidence: "Both files match original creator realesrgan-x4plus-anime release bytes.",
      sources: [upstream, "https://github.com/xinntao/Real-ESRGAN/releases/tag/v0.2.5.0", "https://github.com/xinntao/Real-ESRGAN/blob/master/LICENSE"],
    },
  ),
  guide(
    "4x_NMKD-Siax_200k",
    "NMKD Siax",
    "Upstream custom repository describes clean or lightly compressed images (JPEG quality 75 or better).",
    "Try a clean product photograph; compare subtle surfaces.",
    {
      creator: "NMKD (upstream attribution)",
      avoid:
        "Avoid treating this as a heavily damaged/JPEG repair model. " +
        caution,
      sources: [custom, "https://nmkd.de/?esrgan"],
    },
  ),
  guide(
    "4x_NMKD-Superscale-SP_178000_G",
    "NMKD Superscale",
    "Upstream custom repository describes clean, artifact-free real-world imagery.",
    "Try a clean camera image before testing compressed web images.",
    {
      creator: "NMKD (upstream attribution)",
      avoid:
        "Not documented for damaged or heavily compressed inputs. " + caution,
      sources: [custom, "https://nmkd.de/?esrgan"],
    },
  ),
  guide(
    "4xHFA2k",
    "HFA2k",
    "Creator describes anime-image upscaling trained with JPG compression and blur.",
    "Try a small anime still and inspect line edges.",
    {
      creator: "Phhofm",
      avoid: "Photo suitability is not established. " + caution,
      rights:
        "CC BY 4.0. Verified FP16 adaptation; attribution, licence link and conversion description required.",
      evidence: "Complete tensor data verified against creator FP32 NCNN; FP32 biases unchanged, input names/formatting adapted.",
      sources: [custom, phhofm + "4xHFA2k"],
    },
  ),
  guide(
    "4xLSDIR",
    "LSDIR",
    "Creator describes undegraded photo upscaling, without degradation training.",
    "Try a clean photo; compare naturally fine texture.",
    {
      creator: "Phhofm",
      avoid: "Do not assume strong denoising or compression repair. " + caution,
      rights:
        "CC BY 4.0. Verified FP16 adaptation; attribution, licence link and conversion description required.",
      evidence: "Complete tensor data verified against creator FP32 NCNN; FP32 biases unchanged, input names/formatting adapted.",
      sources: [custom, phhofm + "4xLSDIR"],
    },
  ),
  guide(
    "4xLSDIRplusC",
    "LSDIR Plus C",
    "Creator lists compression training and marks the series experimental/incomplete.",
    "Compare a compressed photo against Standard before committing a batch.",
    {
      creator: "Phhofm",
      avoid: "Experimental; not a guaranteed repair model. " + caution,
      evidence:
        "Creator experimental-series notes; exact converted-file match unverified.",
      sources: [custom, phhofm + "4xLSDIRplus"],
    },
  ),
  guide(
    "4xLSDIRCompactC3",
    "LSDIR Compact C3",
    "Creator describes the Compact family for photos and recommends version 3.",
    "Compare a photo against LSDIR when processing time matters.",
    {
      creator: "Phhofm",
      rights: "CC BY 4.0. Exact creator FP16 weights verified; input names/formatting adapted. Retain attribution and identify adaptation.",
      performance:
        "Upstream describes SRVGGNET Compact inference as potentially faster. " +
        performance,
      evidence:
        "Creator C3 card explicitly licenses CC BY 4.0; weight blob matches creator FP16 file, graph differs only by input names/formatting.",
      sources: [custom, phhofm + "4xLSDIRCompact/Version3/C"],
    },
  ),
  guide(
    "4xNomos8kSC",
    "Nomos8kSC",
    "Creator describes realistic photo upscaling trained with JPG compression and blur.",
    "Try a soft or compressed photo and inspect facial texture.",
    {
      creator: "Phhofm",
      rights:
        "CC BY 4.0. Verified creator FP16 weights with adapted input tensor names/line formatting. Credit Phhofm, link licence and identify adaptation when sharing.",
      evidence: "Creator weight hash verified; parameter differences documented in Rastercue redistribution evidence.",
      sources: [custom, phhofm + "4xNomos8kSC"],
    },
  ),
  ...[2, 3, 4].map((scale) =>
    guide(
      `realesr-animevideov3-x${scale}`,
      `Anime Video ${scale}×`,
      "Creator describes a small model optimised for anime video imagery. Rastercue processes still images, not videos.",
      "Try an anime frame; inspect linework and flat colour areas.",
      {
        creator: "Xintao Wang / Real-ESRGAN",
        avoid: "Not documented as a photo-focused model. " + caution,
        performance: "Creator describes a small/XS network. " + performance,
        evidence:
          "Creator anime-video documentation; upstream converted filenames.",
        rights:
          "BSD-3-Clause. Exact creator files verified; retain full Real-ESRGAN licence notice when redistributing.",
        sources: [
          custom,
          real + "anime_video_model.md",
          "https://github.com/xinntao/Real-ESRGAN/blob/master/LICENSE",
        ],
      },
    ),
  ),
  ...["RealESRGAN_General_x4_v3", "RealESRGAN_General_WDN_x4_v3"].map((id) =>
    guide(
      id,
      id.includes("WDN")
        ? "RealESRGAN General WDN v3"
        : "RealESRGAN General v3",
      "Creator general-v3 family targets general imagery with a lightweight network; test detail and denoising on a representative crop.",
      "Try a general photo and compare detail retention against Standard.",
      {
        creator: "Real-ESRGAN (upstream attribution)",
        rights: "BSD-3-Clause. All local tensor bytes verified as FP16 adaptation of the corresponding original creator release. Retain complete licence notice.",
        performance:
          "Upstream describes lighter/faster processing; creator general-v3 notes limited deblur/denoise strength. " +
          performance,
        evidence:
          "All 101 tensors verified against corresponding General/WDN creator PTH; weights, biases and PReLU precision adapted to FP16.",
        sources: [custom, real + "model_zoo.md", "https://github.com/xinntao/Real-ESRGAN/releases/tag/v0.2.5.0"],
      },
    ),
  ),
  guide(
    "uniscale_restore",
    "Uniscale Restore",
    "Upstream attributes this model to Kim2091 but provides no specific usage or limits.",
    "Use a non-critical sample and compare with Standard before production work.",
    {
      creator: "Kim2091 (upstream attribution)",
      evidence:
        "Attribution only; usage, native training purpose and licence unverified.",
      sources: [custom],
    },
  ),
  guide(
    "unknown-2.0.1",
    "Unknown 2.0.1",
    "Upstream explicitly states that this model’s identity is unknown.",
    "Experimental comparison only; do not rely on undocumented behaviour.",
    {
      creator: "Unknown",
      evidence:
        "Identity unknown; filename is not evidence of model provenance.",
      sources: [custom],
    },
  ),
];

export function getModelGuide(id: string): ModelGuide {
  return (
    MODEL_CATALOG.find((model) => model.id === id) ||
    guide(
      id,
      id,
      "Imported model with no verified catalogue entry.",
      "Test a non-critical representative image before using this model.",
      {
        creator: "Unverified",
        evidence:
          "Filename only; usage guidance, identity and rights unverified.",
        sources: [custom],
      },
    )
  );
}
