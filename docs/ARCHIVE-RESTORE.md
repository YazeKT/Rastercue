# Rastercue archive and restore guide

Rastercue history and Rastercue archives solve different problems:

- **History** is a lightweight local job record with paths, settings and thumbnails.
- **Archive** is an explicit recovery bundle containing the exact source and completed output bytes.

Rastercue never archives every job automatically.

## Create an archive

1. Open a completed job in History.
2. Choose **Archive job**.
3. Select a new destination ending in `.rastercue`.
4. Wait for the archive phase and final verification.

Only completed jobs can be archived. Every referenced source and output must still exist. Rastercue will not replace an archive that already exists.

## Bundle contents

A `.rastercue` file is a ZIP64 container with a versioned `manifest.json` and payloads under role-specific folders. The manifest records:

- Job ID, kind, model, scale, timestamps and processing settings.
- Each payload's role, safe archive path, original basename, byte size and SHA-256 checksum.
- Schema name `rastercue.archive` and manifest version.

Source and output image payloads are stored without lossy recompression. The goal is exact recovery, not a smaller but altered image.

## Restore safely

1. Choose the `.rastercue` file.
2. Choose a dedicated restore folder.
3. Rastercue inspects the manifest and safety limits before extracting payloads.
4. Restored files are placed in role folders such as `source` and `output`.
5. Every restored payload is checked against its declared byte size and SHA-256.

Restore refuses to:

- Interpret an unsupported future manifest version.
- Extract absolute paths, `..` traversal entries or symbolic links.
- Exceed the bounded entry-count or expanded-size limits.
- Restore undeclared payloads.
- Overwrite an existing file.
- Keep a restored set after a checksum failure.

If a target filename already exists, choose another empty restore folder or rename the existing file first. Rastercue does not silently overwrite it.

## Recovery expectations

- Keep the `.rastercue` bundle itself backed up on suitable storage.
- An archive preserves the files captured at archive time; it does not follow later edits.
- Deleting the original after archiving is a user storage decision, not an automatic Rastercue cleanup action.
- A damaged bundle may be unrecoverable. Checksum validation detects corruption but cannot reconstruct missing data.

Archive/restore is included in Rastercue 1.0. Exact-byte creation and safe restore contracts are covered by the stable test suite; restore always targets a user-selected location.
