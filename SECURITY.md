# Security policy

Rastercue is a local desktop application. The Windows beta is unsigned, not independently audited or fully sandboxed. Process trusted images and creator-authorized models. History, thumbnails and logs can be sensitive.

## Known inherited limitations

Renderer/worker Node integration is disabled; context isolation and web security are enabled. Unexpected navigation/redirects and webviews are denied. Permission requests are denied except sanitised clipboard writing from the application window for copying logs. External URLs are credential-free HTTPS only. The preload allowlists channels and strips privileged Electron events; command dispatch verifies the expected top-level application frame. Public asset paths cannot escape the renderer directory. History/update interfaces validate sender/path/job ownership.

The preload explicitly retains `sandbox: false` for inherited OS/local-module imports. It is not a fully sandboxed preload. A bundled sandbox-compatible preload and wider IPC payload audit remain future work. There is no guarantee against every malformed native image/model file.

History thumbnails/paths and logs may be sensitive. Files are local; no telemetry, automatic image upload or online log submission is included. Updates contact Rastercue GitHub Releases, and external links contact their destinations. Keep model rights and model-file trust separate concerns.

The initial publication reported 23 production-classified advisories. A separate security pass updated Electron, builder, updater, Sharp, metadata tooling and patched build dependencies. Next remains on its existing major; a scoped PostCSS override removes its vulnerable nested dependency. On 18 September 2026 the refreshed lockfile reported zero known advisories in both full and production npm audits. This is a point-in-time registry result, not proof that vulnerabilities do not exist. Repeat audits and packaged regressions for every release. Native engine bytes, protected handlers and model IDs remain unchanged.

Unsigned Windows assets lack publisher authenticity verification. Checksums detect changes but are not signatures. Hosted older-version update installation has not been verified. Disable updates if this does not meet deployment requirements. Microsoft runtimes are external prerequisites obtained directly from Microsoft, not redistributed. Windows testing does not verify macOS/Linux.

## Reporting

Use the repository's private vulnerability reporting feature if available. Otherwise contact the maintainer through the contact options on https://github.com/YazeKT before sharing reproduction details privately. Do not publish secrets, exploit payloads or sensitive images in public issues. No response-time/service guarantee is currently offered.

No signing keys, credentials, .env secrets, personal test outputs, app data or installers belong in source control. Future binary releases require native-source/rights verification, platform smoke tests and signing disclosures. Update installation is prompted only while no job/finalisation is active.
