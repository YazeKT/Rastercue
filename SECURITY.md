# Security policy

Rastercue is currently a local release candidate, not a hardened or audited sandbox. Do not process untrusted files or import unknown native model files on a sensitive workstation without appropriate isolation.

## Known inherited limitations

The existing Electron window retains nodeIntegration:true and webSecurity:false for compatibility with the working local-file preview. These require an isolated hardening project and regression testing before stronger security claims. Narrow new history/update interfaces validate sender/path/job ownership, but they do not make the inherited renderer fully sandboxed. Dependencies were not broadly upgraded in this UI fork; audit findings must be assessed separately.

History thumbnails/paths and logs may be sensitive. Files are local; no telemetry, automatic image upload or online log submission is included. Updates contact Rastercue GitHub Releases, and external links contact their destinations. Keep model rights and model-file trust separate concerns.

At the18September2026 source-publication audit, `npm audit --omit=dev` reported23 dependency advisories (1low,3moderate,19high), including Electron, updater/runtime and sharp transitive concerns. This is not a clean security audit. Package classification can include runtime-shipped Electron even where declared development-only. Do not distribute binary releases until these are triaged and necessary isolated updates/hardening are regression-tested. No automatic `audit fix --force` or engine replacement was performed. Advisory state changes over time; rerun the audit for each release.

## Reporting

Use the repository's private vulnerability reporting feature if available. Otherwise contact the maintainer through the contact options on https://github.com/YazeKT before sharing reproduction details privately. Do not publish secrets, exploit payloads or sensitive images in public issues. No response-time/service guarantee is currently offered.

No signing keys, credentials, .env secrets, personal test outputs, app data or installers belong in source control. Future binary releases require native-source/rights verification, platform smoke tests and signing disclosures. Update installation is prompted only while no job/finalisation is active.
