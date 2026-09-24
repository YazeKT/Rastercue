# Rastercue format guide

Rastercue protects the original image and uses explicit format boundaries. An accepted filename extension alone does not guarantee that an image is safe to process; the decoder, dimensions, frame/page count, memory requirement and colour mode must also pass validation.

## Rastercue 1.0 format registry

| Format | Import | Export | Transparency | Resolution metadata | Processing route |
| --- | --- | --- | --- | --- | --- |
| PNG | Yes | Yes | Yes | Yes | Established native route |
| JPEG / JPG / JFIF | Yes | Yes | No | Yes | Established native route with the alpha-to-JPG safety preparation |
| WebP | Yes | Yes | Yes | No | Established native route; animated files rejected |
| AVIF | Yes | Yes | Yes | No | Bounded lossless working image before/after the engine |
| TIFF / TIF | Yes | Yes | Yes | Yes | Single-page RGB/sRGB only; bounded lossless working image |

AVIF and single-page TIFF are supported in Rastercue 1.0 through bounded local adapters and readable-output verification. Animated, multipage, ambiguous, or unbounded inputs remain explicitly rejected.

## Explicitly unsupported in 1.0

- Animated GIF and animated WebP.
- Multipage TIFF.
- HEIC/HEIF.
- BMP until the packaged codec route is proven.
- PSD and camera RAW.
- PDF.
- JPEG 2000 and JPEG XL.
- Unbounded or unsafe vector input.

Rastercue rejects these files with a reason. It does not silently process only the first frame or page.

## Transparency and JPEG

JPEG cannot preserve transparency. When a transparent image is intentionally exported to JPEG, Rastercue prepares a temporary opaque RGB working copy with transparent areas placed on white. The source is not modified. PNG and WebP continue through their established transparency-capable paths.

## Colour boundary

Rastercue 1.0 is an RGB/sRGB image-upscaling tool, not a CMYK prepress conversion system. For CMYK or unsupported profiles, create or approve a separate sRGB working copy. Never overwrite the original to force compatibility.

## Output verification

A job is complete only when the output:

- Exists at the intended destination.
- Opens through the packaged decoder.
- Has the expected pixel dimensions and requested format.
- Retains supported metadata according to the selected export setting.
- Can be added to history without changing the source.

Temporary working images must be removed after success, failure and cancellation.
