# Rastercue product website

The static source for the Rastercue 1.0 product site is in [`website/`](../website/), built for the GitHub Pages project URL `https://yazekt.github.io/Rastercue/`. The owner accepted the application and website for publication on 24 September 2026.

## Design direction

The site uses a **precision pixel-studio** direction:

- Graphite working surfaces and periwinkle processing marks.
- Oversized product statements balanced by small operational labels.
- An active-job pixel-grid hero based on the real upscale workflow rather than a generic technology globe.
- Local Poppins files for continuity with the desktop product.
- One product screenshot at its intrinsic aspect ratio; no crop or distortion.
- Restrained reveal motion with a complete reduced-motion fallback.
- Compact sections that deliver product proof in short, fast bursts.

The supplied United Carriers site informed the confident hierarchy, accountable language and staged storytelling only. Rastercue does not copy its assets, logistics imagery, globe, typography, metrics, layout or preloader.

## Local commands

```powershell
node website/prepare.mjs
node website/validate.mjs
npx --yes serve website
```

The prepare script copies only rights-cleared repository assets into the standalone static surface. It does not download anything.

## Content rules

- Distinguish the protected Upscayl baseline from Rastercue-authored 1.0 features.
- Do not publish invented benchmarks, testimonials, user counts, quality claims or vendor-wide guarantees. Say that Rastercue has no vendor whitelist and requires a successful bundled-engine probe.
- Link stable downloads to the latest GitHub Release. State that Windows artifacts are unsigned and that AMD RX 580 is the owner-tested Vulkan evidence; other devices remain probe-based.
- Describe the native CPU backend as separately probed and packaged-tested, with the honest 1.0 limitation that TTA remains Vulkan-only.
- Preserve Upscayl, Real-ESRGAN, model and font attribution.
- Keep product screenshots undistorted with explicit intrinsic dimensions and `object-fit: contain`.
- Keep all app assets local; external links may point to GitHub and support email.

## Deployment checklist

1. Run `node website/prepare.mjs` and `node website/validate.mjs`.
2. Confirm the site uses the accepted final product capture and current release facts.
3. Test keyboard navigation, reduced motion and 320/768/1280/1920px widths.
4. Verify every GitHub/document/download link.
5. Build the Pages artifact from the contents of `website/` so `index.html` is at the project-site root.
6. Verify `https://yazekt.github.io/Rastercue/`, HTTPS, Open Graph image, favicon and stable download after deployment.

The Pages workflow publishes only from the approved repository state. Verify the deployed URL and latest-release links after the workflow completes.
