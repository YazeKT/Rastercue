import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import RastercueLogo from "../icons/rastercue-logo";
import useUpscaylVersion from "../hooks/use-upscayl-version";
import {
  RASTERCUE_CHANGELOG,
  UPSCAYL_INHERITED_BASELINE,
} from "../../../common/rastercue-changelog";

export default function AboutDialog() {
  const version = useUpscaylVersion();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("About");
  const [licence, setLicence] = useState("");
  const [status, setStatus] = useState("");
  const showLicence = async (filename: string) => {
    try {
      const response = await fetch(filename);
      if (!response.ok) throw new Error("unavailable");
      setLicence(await response.text());
    } catch {
      setLicence(
        "Licence text could not be loaded. The complete notices are also included with the source distribution.",
      );
    }
  };
  return (
    <>
      <button className="btn btn-sm w-full" onClick={() => setOpen(true)}>
        About, licences & changelog
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="flex h-[90vh] max-h-[760px] w-[94vw] max-w-4xl flex-col gap-0 overflow-hidden p-0">
          <DialogHeader className="shrink-0 border-b border-base-content/15 px-6 pb-4 pt-6">
            <DialogTitle className="flex items-center gap-3 pr-8">
              <RastercueLogo className="h-9 w-9 text-primary" />
              Rastercue {version || "—"}
            </DialogTitle>
            <DialogDescription>
              Designer-focused image upscaling, based on Upscayl 2.15.0.
            </DialogDescription>
          </DialogHeader>
          <div className="shrink-0 border-b border-base-content/15 px-6 py-3">
            <div
              className="tabs-boxed tabs w-fit"
              role="tablist"
              aria-label="About Rastercue"
            >
              {["About", "Licences", "Changelog"].map((label) => (
                <button
                  key={label}
                  role="tab"
                  aria-selected={tab === label}
                  className={`tab min-h-10 ${tab === label ? "tab-active" : ""}`}
                  onClick={() => setTab(label)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div
            className="min-h-0 flex-1 overflow-y-auto px-6 py-5"
            role="tabpanel"
          >
            {tab === "About" && (
              <div className="max-w-[70ch] space-y-4 text-sm">
                <p>
                  Rastercue’s identity, compact interface, inspection tools,
                  model guidance and local job history are fork modifications by
                  YazeKT. The underlying upscaling application is Upscayl,
                  created by Nayam Amarshe and TGS963 with its contributors.
                </p>
                <p>
                  Engine: Upscayl-NCNN / Real-ESRGAN-ncnn-vulkan and their
                  contributors, including Xintao Wang. Models retain their
                  individual creator credits and licences.
                </p>
                <p>
                  No telemetry, cloud promotions or automatic image uploads.
                  Local thumbnails and history can contain sensitive image
                  previews and paths; protect the history folder as you would
                  your design files.
                </p>
                <p>
                  <a
                    className="link"
                    href="https://github.com/upscayl/upscayl"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Upstream source
                  </a>{" "}
                  ·{" "}
                  <a
                    className="link"
                    href="https://github.com/YazeKT/Rastercue"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Rastercue source and releases
                  </a>
                </p>
                <button
                  className="btn btn-sm"
                  onClick={async () => {
                    setStatus("Checking…");
                    try {
                      const api = (
                        window as unknown as {
                          rastercueUpdates: {
                            check: () => Promise<{ message: string }>;
                          };
                        }
                      ).rastercueUpdates;
                      setStatus((await api.check()).message);
                    } catch {
                      setStatus(
                        "Update checks are unavailable. Try an installed release.",
                      );
                    }
                  }}
                >
                  Check for updates
                </button>
                <p role="status">{status}</p>
              </div>
            )}
            {tab === "Licences" && (
              <div className="flex min-h-full flex-col gap-3 text-sm">
                <p>
                  App source: AGPL-3.0. Rebranding does not remove upstream
                  copyright or source-availability obligations. Engine and model
                  licences are separate. Commercial-use notices in the model
                  browser must be checked for your intended work.
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    className="btn btn-sm"
                    onClick={() => showLicence("LICENSE.txt")}
                  >
                    App licence
                  </button>
                  <button
                    className="btn btn-sm"
                    onClick={() => showLicence("Real-ESRGAN_LICENSE.txt")}
                  >
                    Real-ESRGAN notice
                  </button>
                  <button
                    className="btn btn-sm"
                    onClick={() => showLicence("Poppins-OFL.txt")}
                  >
                    Poppins font licence
                  </button>
                  <button
                    className="btn btn-sm"
                    onClick={() => showLicence("CC-BY-4.0.txt")}
                  >
                    CC BY 4.0
                  </button>
                  <button
                    className="btn btn-sm"
                    onClick={() => showLicence("MODEL-REDISTRIBUTION.md")}
                  >
                    Model credits & adaptations
                  </button>
                </div>
                <pre className="min-h-52 flex-1 select-text overflow-auto whitespace-pre-wrap break-words rounded-lg bg-base-300 p-4 text-xs leading-relaxed">
                  {licence || "Choose a notice to read its complete text."}
                </pre>
                <p>
                  Creator links and weight-identity limitations are recorded
                  separately for every recognised model. Downloadable models do
                  not automatically grant redistribution or commercial rights.
                </p>
              </div>
            )}
            {tab === "Changelog" && (
              <div className="grid items-start gap-6 text-sm md:grid-cols-[10.5rem_minmax(0,1fr)]">
                <nav
                  className="sticky top-0 hidden max-h-[calc(90vh-12rem)] overflow-y-auto border-r border-base-content/15 pr-4 md:block"
                  aria-label="Changelog versions"
                >
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-base-content/60">
                    Release history
                  </p>
                  <div className="space-y-1">
                    {RASTERCUE_CHANGELOG.map((release) => (
                      <a
                        key={release.id}
                        href={`#${release.id}`}
                        className="block rounded-md px-2 py-2 leading-tight hover:bg-base-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
                      >
                        <span className="block font-medium">
                          {release.version.replace("Rastercue ", "")}
                        </span>
                        <span className="mt-1 block text-xs text-base-content/60">
                          {release.date}
                        </span>
                      </a>
                    ))}
                    <a
                      href="#upscayl-baseline"
                      className="block rounded-md px-2 py-2 leading-tight hover:bg-base-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
                    >
                      <span className="block font-medium">
                        Inherited baseline
                      </span>
                      <span className="mt-1 block text-xs text-base-content/60">
                        Upscayl 2.15.0
                      </span>
                    </a>
                  </div>
                </nav>
                <div className="min-w-0 max-w-[72ch] space-y-8">
                  <header className="space-y-2">
                    <h3 className="text-lg font-semibold">
                      Complete Rastercue history
                    </h3>
                    <p className="text-base-content/70">
                      Every Rastercue development stage recorded in this
                      repository, followed by the Upscayl capabilities the app
                      inherits and protects.
                    </p>
                  </header>
                  {RASTERCUE_CHANGELOG.map((release) => (
                    <article
                      id={release.id}
                      key={release.id}
                      className="scroll-mt-4 border-t border-base-content/15 pt-5 first:border-t-0 first:pt-0"
                    >
                      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                        <h4 className="text-base font-semibold">
                          {release.version}
                        </h4>
                        <time className="text-xs tabular-nums text-base-content/60">
                          {release.date}
                        </time>
                      </div>
                      <p className="mt-1 text-xs font-medium text-primary">
                        {release.status}
                      </p>
                      <p className="mt-3 leading-relaxed text-base-content/80">
                        {release.summary}
                      </p>
                      <div className="mt-4 space-y-5">
                        {release.groups.map((group) => (
                          <section key={group.title} aria-label={group.title}>
                            <h5 className="font-semibold">{group.title}</h5>
                            <ul className="mt-2 list-disc space-y-2 pl-5 leading-relaxed text-base-content/80">
                              {group.changes.map((change) => (
                                <li key={change}>{change}</li>
                              ))}
                            </ul>
                          </section>
                        ))}
                      </div>
                    </article>
                  ))}
                  <article
                    id="upscayl-baseline"
                    className="scroll-mt-4 border-t border-base-content/15 pt-5"
                  >
                    <h4 className="text-base font-semibold">
                      {UPSCAYL_INHERITED_BASELINE.version}
                    </h4>
                    <p className="mt-3 leading-relaxed text-base-content/80">
                      {UPSCAYL_INHERITED_BASELINE.summary}
                    </p>
                    <ul className="mt-3 list-disc space-y-2 pl-5 leading-relaxed text-base-content/80">
                      {UPSCAYL_INHERITED_BASELINE.changes.map((change) => (
                        <li key={change}>{change}</li>
                      ))}
                    </ul>
                    <p className="mt-4 text-xs leading-relaxed text-base-content/60">
                      Engine algorithms, model weights and the inherited
                      application foundation retain their original creators,
                      copyrights and licences.
                    </p>
                  </article>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
