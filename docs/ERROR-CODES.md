# Rastercue error-code library

Rastercue errors identify the phase that stopped, separate confirmed facts from possible causes and offer recovery actions that do not silently change the job.

## Reading an error

Every structured Rastercue error contains:

- A stable code.
- The failed phase.
- Severity.
- Plain-language summary and bounded technical detail.
- Whether the cause is confirmed.
- Recovery actions and whether retry is safe.
- Whether a redacted support report is useful.

## Current codes

| Code | Phase | Meaning | First recovery actions |
| --- | --- | --- | --- |
| `RC-GPU-OUT-OF-MEMORY` | Process | The selected graphics device could not allocate enough memory. | Use a smaller tile, close GPU-heavy apps, or explicitly choose another verified backend. |
| `RC-HOST-OUT-OF-MEMORY` | Process | Rastercue could not reserve enough system memory. | Close memory-heavy apps, use a smaller image/tile and check Windows virtual memory. |
| `RC-GPU-DEVICE` | Device | The selected compute device is unavailable or its Vulkan driver is incompatible. | Detect hardware again, choose another verified device and check the vendor driver. |
| `RC-MODEL-MISSING` | Model | The selected `.param`/`.bin` pair is missing or incomplete. | Choose an available model or restore the matching pair after checking its source/licence. |
| `RC-INPUT-DECODE` | Validate | The image could not be decoded safely. | Confirm it opens elsewhere, flatten/export a trusted RGB copy, or choose a supported single-frame format. |
| `RC-OUTPUT-PERMISSION` | Encode | Rastercue could not write the requested output. | Choose a writable folder/new name and check free space and permissions. |
| `RC-UNKNOWN-<PHASE>` | Any | The phase stopped but no reviewed known-error rule matched. | Review the phase/hardware, retry only after checking settings, then create a redacted bundle if it repeats. |

The library will expand as new confirmed failure signatures are reviewed. Unknown codes are intentional: Rastercue must not invent a hardware explanation when the evidence is inconclusive.

## Processing phases

Structured phases are `queued`, `validate`, `prepare`, `device`, `model`, `process`, `process-pass-2`, `encode`, `metadata`, `verify`, `history`, `archive` and `complete`.

The interface may group these into larger progress steps, but the error report retains the specific phase.

## Before retrying

1. Confirm which phase failed.
2. Read whether the stated cause is confirmed or only possible.
3. Preserve the original input and any valid completed outputs.
4. Choose a recovery action deliberately.
5. If changing backend, device, model, tile size or format, treat the retry as a new attempt.

No GPU failure should silently become a CPU job. No failed or unverified output should be recorded as complete.

## Reporting a new error

Use **Create support bundle**, review its contents and send it to `kirstentrimaley@gmail.com` or attach it to an appropriate GitHub issue. Remove any information you do not want to share. See [Diagnostics and privacy](DIAGNOSTICS-PRIVACY.md).
