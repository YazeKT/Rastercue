# Rastercue website

This is the static Rastercue 1.0 product-site source for the GitHub Pages project URL:

`https://yazekt.github.io/Rastercue/`

No deployment is performed from this directory. The site uses relative paths so it remains safe when served beneath `/Rastercue/`.

## Prepare and preview

From the repository root:

```powershell
node website/prepare.mjs
node website/validate.mjs
npx --yes serve website
```

`prepare.mjs` copies the rights-cleared workspace capture and local Poppins font files into the static surface. It does not fetch remote assets. Open the URL printed by the local server and review both wide and narrow layouts before deployment.

## Publishing

Kirsten accepted the Rastercue 1.0 application and website for publication on 24 September 2026. Deploy the `website/` directory through the repository Pages workflow, then verify the public URL, screenshots, documentation links and latest-release download. The site keeps hardware claims evidence-based: AMD RX 580 Vulkan is owner-tested, other GPUs are probe-based, and the native NCNN CPU backend passed its no-Vulkan probe and packaged workflow test.
