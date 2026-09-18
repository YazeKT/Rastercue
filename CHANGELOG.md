# Rastercue changelog

## 1.0.0 — local release candidate

Publication branding: Rastercue SVG replaces the progress/loading emblem. Footer now displays Yaze Media linked to https://github.com/YazeKT; upstream authorship remains in About/Licences and source notices. Initial GitHub publication is source-only, with native assets/weights excluded and explicit pinned/checksum-verified developer setup.

Compatibility correction: the original bundled engine misencodes alpha-channel inputs directly to JPG (vertical stripes and colour corruption). Rastercue now supplies temporary RGB inputs only for JPG jobs, with transparent areas placed on white after the JPG confirmation. Native binary, models, output encoder and processing settings are retained; PNG/WebP jobs are untouched. Preparation is cancellable and temporary inputs are cleaned up. Existing damaged outputs are not silently overwritten—use a fresh destination or explicitly enable overwrite to regenerate them.

Fork improvements: Rastercue identity and dark theme; permanent compact workstation panels; detailed searchable model catalogue, favourites and presets; synchronised before/after zoom, pan and inspection bookmarks; local persistent job history, file measurements and managed-output renaming; readable expandable logs; About/licence view; JPG fresh-install default; separate app data; Rastercue-only updater; removal of analytics, cloud promotions and online log submission.

Inherited from Upscayl: Electron/React application, native upscaling binaries, built-in models, custom model folder support, single/batch/double processing, cancellation, conversion and compression, metadata handling, existing aggregate statistics and supported output formats. These are not newly authored Rastercue capabilities.

Windows is currently the local build/test host. macOS/Linux packaged smoke tests, signing/notarisation, installed-version hosted updates and designer acceptance are release gates, not completed claims.
