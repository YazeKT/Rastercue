# Rastercue design contract

Rastercue is a designer-focused local workstation around a preserved Upscayl core, not a claim of a newly invented upscaling engine. The solid R-and-pixel identity uses periwinkle `#A5A0FF`, graphite `#14161B`, slate `#22252D` and soft white `#F1F2F6`. Local Poppins remains for continuity. Brand masters live in `resources/brand`; production icons are deterministic through `npm run brand`.

## Desktop workspace

- Keep permanent compact left controls, a flexible central image preview and right inspection/history tools.
- Keep both sidebars and Start accessible at 1366×768; use compact groups and bounded scrolling rather than hiding essential actions.
- Keep Input, Model, Output, Destination and Start/Cancel in one compact workflow rather than separate tabs.
- Keep descriptions behind consistent accessible information buttons when they are optional. Warnings, validation and recovery stay visible.
- Information opens on hover/focus, pins on click/tap, closes with Escape and returns focus.
- Keep before/after comparison available after output. Pointer-centred zoom, pan, Fit/100%, reset, bookmarks and lens remain inspection tools only.
- Use contained source/output thumbnails. Never crop or stretch product images to fill a card.

## Models, hardware and progress

- The Model Library prioritises search, media-purpose filters, availability, favourites and evidence-backed detail over oversized prose.
- “Not benchmarked on this device” is the performance default. Measured values name the exact hardware and test context.
- Hardware language differentiates detected, engine-compatible and actually used devices.
- Progress names the current phase, current file, elapsed time and selected/actual backend where available. ETA appears only when enough local evidence exists.
- Failure presentation names the phase and separates confirmed cause from possible cause.

## Settings

Settings is one full popup with a persistent navigation rail, search and one scrollable content surface—not a Next/Previous wizard. Categories are Hardware & performance; Processing; Formats & metadata; Appearance & language; Storage, history & privacy; Updates; Support & about.

## Website

The product-site direction is a **precision pixel studio**: graphite work surfaces, periwinkle processing marks, compact operational labels and one active-job pixel-grid hero. Short, decisive sections keep the product proof moving. It borrows the supplied United Carriers reference's confidence and accountable storytelling, not its logistics assets, globe, typography, layout, metrics or preloader.

The site uses intrinsic screenshot dimensions and `object-fit: contain`, local fonts/assets, visible keyboard focus and reduced-motion behaviour. It must label 1.0 capabilities awaiting hardware acceptance as candidate work and cannot show invented benchmarks, testimonials or compatibility guarantees.

## Acceptance

High-DPI, narrow-height, keyboard, screen-reader, long-translation, reduced-motion and designer acceptance remain release gates. Public presentation cannot outrun packaged product evidence.
