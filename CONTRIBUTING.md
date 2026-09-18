# Contributing

Open a Rastercue issue describing the workflow and proposed change before large work. Keep UI, privacy and record-management changes separate from engine processing changes. Do not replace binaries/models, change processing arguments or upgrade dependencies broadly in a UI patch.

Follow docs/DEVELOPMENT.md. Run the production build, regression tests and history safety suite. Test actual saved pixels—not only dimensions/exit status—when touching processing boundaries. Use fresh destinations so inherited overwrite=false cache behaviour cannot hide old results.

Include readable labels/examples, keyboard focus, reduced-motion support and laptop-height screenshots for interface work. Keep both sidebars visible. New copy still needs localisation; do not pretend untranslated strings satisfy translation acceptance.

Never commit credentials, model weights, native binaries, personal images, logs/history, generated test artifacts or installers. New model guidance needs primary creator evidence; unknown rights and performance limits must remain explicit. Contributions must be compatible with the retained AGPL-3.0 application licence; third-party components keep their own terms.

Report reproducible environment/model/settings details, but redact private paths, GPU/machine details and image content as needed. Fork-specific issues belong here, not in upstream's tracker.
