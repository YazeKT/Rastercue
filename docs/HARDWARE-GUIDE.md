# Rastercue hardware guide

Rastercue 1.0 separates three facts that are easy to confuse:

1. **Detected hardware** — adapters and processors reported by the operating system.
2. **Engine-compatible hardware** — devices that pass Rastercue's compute probe.
3. **Actual job hardware** — the backend and device reported for the completed job.

A graphics-card name alone is not proof that Rastercue used it.

## Compute choices

| Choice | Purpose | Current evidence boundary |
| --- | --- | --- |
| Auto | Use Rastercue's verified recommendation | The recommendation must name its reason and confidence. |
| Original Upscayl Vulkan | Preserve the established processing path | This is the protected compatibility baseline. |
| Rastercue Vulkan device | Select any Vulkan device exposed by the bundled engine probe | There is no vendor whitelist; detection alone is not proof that a job can complete. |
| CPU only | Genuine native CPU processing without Vulkan | Included in the 1.0 source; final packaged evidence is still required before treating it as a recovery guarantee. Software Vulkan is never relabelled as CPU. |

Rastercue does not silently change the selected backend, device, model, tile size or output format. When a GPU job fails, retry choices must explain what will change before a new job starts.

Rastercue does not block a device because of its manufacturer or product family. Windows may report adapters that the bundled engine cannot use, while an engine-probed adapter may come from a vendor not named in this guide. The engine probe and a verified completed job are the compatibility evidence.

## First-use recommendation

The hardware screen should show:

- CPU model, architecture, logical cores and detected physical cores.
- Total and currently available system memory.
- Every display adapter Windows reports, including driver and memory information when available.
- Every Vulkan device the engine verifies.
- Backend availability, warnings and the recommended backend/device.
- The device that actually completed the latest job.

Apply a recommendation only after reading its rationale. “Keep current settings” leaves existing preferences untouched.

## If a GPU is detected but not used

1. Open **Settings → Hardware & performance**.
2. Compare **Detected adapters** with **Verified engine devices**.
3. Run hardware detection again after a driver or GPU change.
4. Select the intended verified device explicitly rather than relying on Auto.
5. Start a small test image and confirm the **Actual device** shown by the job.
6. If the device is absent, install the current graphics driver from the device manufacturer and retry detection.

Do not assume Windows Task Manager's 3D graph represents Vulkan compute activity. Check the device and backend that Rastercue records for the job.

## Safe recovery choices

- **Smaller tile size:** lowers peak device-memory demand but can reduce speed.
- **Close GPU-heavy applications:** frees device and host memory without changing output settings.
- **Original compatibility backend:** uses the preserved Upscayl Vulkan path.
- **CPU only:** uses the genuine native CPU backend included for 1.0. Confirm that the installed package reports the CPU backend before relying on it; final packaged evidence is still being recorded.

Rastercue must ask before changing backend. A failed GPU job is never silently recorded as a CPU success.

## Support report

If a problem repeats, use **Settings → Support & about → Create support bundle**. Review the bundle before sharing it. It should contain the relevant hardware/software inventory and bounded redacted logs, not source images or full local paths. See [Diagnostics and privacy](DIAGNOSTICS-PRIVACY.md).

## 1.0 hardware evidence

The owner accepted the Windows 1.0 workflow on the AMD work PC on 24 September 2026:

- **AMD Radeon RX 580 Vulkan:** owner-tested on the intended i5-8600K / 32 GB Windows work PC.
- **Intel, NVIDIA and other Vulkan hardware:** available only when the bundled engine probe succeeds; not universally certified by brand or product family.
- **CPU only:** native backend included, with final packaged evidence still required.
- **Hybrid or multiple-GPU systems:** each selectable device must pass its own engine probe and completed-job check.

The completed [owner acceptance checklist](WORK-PC-TEST.md) records the AMD gate. Passing source tests or listing a device is not equivalent to packaged hardware acceptance on another machine.
