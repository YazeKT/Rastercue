export type RastercueChangeGroup = {
  title: string;
  changes: readonly string[];
};

export type RastercueRelease = {
  id: string;
  version: string;
  date: string;
  status: string;
  summary: string;
  groups: readonly RastercueChangeGroup[];
};

export const RASTERCUE_CHANGELOG: readonly RastercueRelease[] = [
  {
    id: "rastercue-1-0-0",
    version: "Rastercue 1.0.0",
    date: "24 September 2026",
    status: "Stable foundation",
    summary:
      "The first complete Rastercue foundation: a designer-focused Windows workstation built around the protected Upscayl processing core.",
    groups: [
      {
        title: "Protected processing core",
        changes: [
          "Preserved the original Upscayl Vulkan executable, built-in model files, model IDs, processing arguments, native scaling behaviour, batch processing, double pass, cancellation, metadata handling and output encoding as a regression-locked compatibility baseline.",
          "Added output verification so a job is not recorded as complete unless the expected file exists, opens and has valid dimensions and format.",
          "Kept source images unchanged and retained the compatibility path for established Upscayl workflows.",
        ],
      },
      {
        title: "Studio workspace",
        changes: [
          "Combined Input, Model, Output, Destination and Start into one compact, scrollable workflow while keeping both sidebars available at the 1366 x 768 target.",
          "Added a responsive Model Library with search, purpose filters, favourites, availability, rights information, limitations and device-specific benchmark states.",
          "Expanded the Inspector with contained source and result thumbnails, pixel dimensions, format, file size, model, backend, device, elapsed time and current processing phase.",
          "Added accessible information popovers that open on hover or focus, pin on click and dismiss immediately when the pointer leaves unless pinned.",
        ],
      },
      {
        title: "Hardware and progress",
        changes: [
          "Added engine-authoritative device discovery, CPU/RAM/software inventory and a hardware-aware welcome flow without a GPU-vendor whitelist.",
          "Separated hardware detected by Windows, devices accepted by the bundled engine and the device actually reported for a completed job.",
          "Added named validation, preparation, device selection, model loading, processing, encoding, metadata, saving, verification, thumbnail, history, archive and completion phases.",
          "Added an explicit native NCNN CPU backend beside the protected Vulkan path. It is enabled only after its CPU-only runtime probe succeeds; Rastercue never relabels software Vulkan as CPU processing or switches backend silently.",
        ],
      },
      {
        title: "Formats, history and recovery",
        changes: [
          "Centralised format capability checks for PNG, JPEG/JFIF and WebP, with guarded adapter paths for supported single-image formats and explicit rejection of ambiguous animated, multipage or unsafe inputs.",
          "Fixed RGBA-to-JPEG corruption by preparing a temporary RGB working image only for JPEG jobs, while preserving the source and the native engine output path.",
          "Added local persistent job history with secure managed thumbnails, source/result details, safe renaming and restart persistence.",
          "Added on-demand .rastercue ZIP64 archives containing exact source and output bytes, thumbnails, settings, a versioned manifest, byte sizes and SHA-256 checksums, plus guarded restore to a user-selected folder.",
        ],
      },
      {
        title: "Settings, support and release preparation",
        changes: [
          "Rebuilt Settings as one searchable, scrollable surface with a persistent navigation rail covering hardware, processing, formats, appearance, storage, updates and support.",
          "Added a central error library with stable codes, failed phases, severity, likely causes, hardware context and recovery actions, plus reviewable redacted local support bundles.",
          "Removed telemetry, cloud promotions, automatic image upload and automatic log transmission. Diagnostics stay local unless the user deliberately shares them.",
          "Added GitHub Releases update checks with active-job safeguards, complete notices, documentation, SBOM/checksum generation, packaged regression tests and the Rastercue product website.",
        ],
      },
    ],
  },
  {
    id: "rastercue-1-0-0-beta-2",
    version: "Rastercue 1.0.0-beta.2",
    date: "18 September 2026",
    status: "Work-PC feedback update",
    summary:
      "A focused reliability and usability pass after the first owner test on the intended Windows workstation.",
    groups: [
      {
        title: "Reliability",
        changes: [
          "Made Stop clear the busy interface promptly, suppress late progress and preserve already completed files.",
          "Moved history metadata and thumbnail work off the blocking main-process path and bounded visible logs to 1,000 entries.",
          "Coalesced taskbar, history and visual progress updates to keep long jobs responsive.",
        ],
      },
      {
        title: "Guidance and models",
        changes: [
          "Replaced paginated settings with one full popup and added support, update, documentation and guide-replay controls.",
          "Added a remembered five-step getting-started guide with explicit completion, skip and replay behaviour.",
          "Packaged four built-in and nine custom model pairs only after provenance, licence and checksum review; unresolved pairs stayed excluded.",
        ],
      },
    ],
  },
  {
    id: "rastercue-1-0-0-beta-1",
    version: "Rastercue 1.0.0-beta.1",
    date: "18 September 2026",
    status: "Windows release preparation",
    summary:
      "The first packaged Rastercue test build, focused on security boundaries, provenance and truthful failure handling.",
    groups: [
      {
        title: "Packaging and security",
        changes: [
          "Updated affected runtime, build, image and metadata dependencies and reached zero known advisories in the recorded production audit.",
          "Disabled renderer Node access, retained context isolation and web security, restricted IPC/navigation/permissions and modernised clipboard and drop handling.",
          "Pinned the native Windows engine source and creator-matched model assets with complete notices and checksum evidence.",
        ],
      },
      {
        title: "Processing truth",
        changes: [
          "Changed native non-zero exits to report failure before completion callbacks, preventing failed jobs from appearing successful.",
          "Kept original hardware acceleration and processing defaults instead of imposing laptop-specific settings.",
          "Shipped as an unsigned Windows testing build; signing, hosted updates and non-Windows runtime claims remained explicit release gates.",
        ],
      },
    ],
  },
  {
    id: "rastercue-foundation",
    version: "Rastercue foundation",
    date: "18 September 2026",
    status: "Initial local fork",
    summary:
      "The original productisation pass that established Rastercue as a distinct, local-first designer tool.",
    groups: [
      {
        title: "Product foundation",
        changes: [
          "Introduced the Rastercue identity, dark-first compact workspace, permanent panels, Yaze Media attribution and separate application data.",
          "Added model guidance, favourites and presets; synchronised before/after zoom and pan; inspection bookmarks; local history; managed output renaming; and expanded searchable logs.",
          "Added the About, licences and changelog surface, Rastercue-owned update destination and privacy cleanup while preserving upstream authorship and notices.",
        ],
      },
    ],
  },
];

export const UPSCAYL_INHERITED_BASELINE = {
  version: "Upscayl 2.15.0 baseline",
  summary:
    "Rastercue inherits the Electron/React application and proven Upscayl processing workflow. These capabilities are preserved and credited, not presented as newly authored Rastercue features.",
  changes: [
    "Single-image, batch and double-pass upscaling.",
    "NCNN/Vulkan processing and built-in or custom model loading.",
    "Scale, custom-width, tile-size, TTA, device, compression and metadata controls.",
    "PNG, JPEG and WebP processing paths and existing cancellation behaviour.",
  ],
} as const;
