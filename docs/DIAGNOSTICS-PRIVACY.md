# Diagnostics and privacy

Rastercue processes images locally. Local diagnostic capture is enabled by default so a failure can be understood, but capture is not transmission: Rastercue does not automatically upload reports.

## What a support bundle may contain

- Rastercue version, build channel and packaged/development state.
- Electron, Chromium, Node, engine and codec component versions.
- Detected CPU, memory and display/engine device summaries.
- Selected and actual backend/device information when available.
- Model identifier and file hash—not the model file itself.
- Failed phase, structured error code and bounded redacted log excerpts.
- Job settings needed to reproduce the failure.

## Excluded by default

- Source or output image bytes.
- Thumbnails unless the user explicitly adds one later.
- Clipboard contents.
- Usernames.
- Absolute file paths.
- Private filenames.
- Unbounded logs.
- Full raw command lines that can expose paths.

Rastercue replaces recognised local paths with redaction markers and bounds diagnostic text. Automated redaction reduces risk; it cannot guarantee that every user-entered string is private. Always review the resulting files before sharing them.

## Sharing is manual

1. Create the support bundle locally.
2. Open and review it.
3. Remove anything you do not want to share.
4. Send it manually to `kirstentrimaley@gmail.com` or attach it to the relevant [GitHub issue](https://github.com/YazeKT/Rastercue/issues).

Turning local diagnostic capture off prevents future diagnostic details from being retained beyond the minimum required to show an immediate error. It does not delete support bundles the user already saved.

## Public issue safety

Do not post private images, customer artwork, licence keys, secrets, personal paths or exploit details in a public issue. For a security problem, follow [SECURITY.md](../SECURITY.md).

Rastercue includes no analytics, advertising tracker, cloud image upload or automatic diagnostic submission.
