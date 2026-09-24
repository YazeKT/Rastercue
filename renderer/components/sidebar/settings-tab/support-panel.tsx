import { useState } from 'react';
import AboutDialog from '@/components/rastercue/about-dialog';
import AutoUpdateToggle from './auto-update-toggle';

const repository = 'https://github.com/YazeKT/Rastercue';
const supportEmail = 'kirstentrimaley@gmail.com';
const documents = [
  ['User guide', 'docs/USER-GUIDE.md'],
  ['Work-PC testing checklist', 'docs/WORK-PC-TEST.md'],
  ['Changelog', 'CHANGELOG.md'],
  ['App licence (AGPL-3.0)', 'LICENSE'],
  ['Third-party credits and notices', 'THIRD-PARTY-NOTICES.md'],
  ['Model licences and redistribution', 'docs/MODEL-REDISTRIBUTION.md'],
  ['Engine provenance and source', 'docs/ENGINE-PROVENANCE.md'],
  ['Privacy', 'PRIVACY.md'],
  ['Security policy', 'SECURITY.md'],
];

export function SupportPanel({ onReplayGuide }: { onReplayGuide: () => void }) {
  const [status, setStatus] = useState('');
  const [checking, setChecking] = useState(false);
  const check = async () => {
    if (checking) return;
    setChecking(true); setStatus('Checking Rastercue releases on GitHub…');
    try {
      const api = (window as unknown as { rastercueUpdates?: { check: () => Promise<{ message: string }> } }).rastercueUpdates;
      setStatus(api ? (await api.check()).message : 'Updates are unavailable in this build. Open GitHub Releases to download an installer.');
    } catch { setStatus('Could not check for updates. Check your connection or open GitHub Releases.'); }
    finally { setChecking(false); }
  };
  return <div className="grid gap-5 md:grid-cols-2">
    <section className="space-y-4 rounded-lg border border-base-content/15 bg-base-200 p-5">
      <h2 className="text-lg font-semibold">Help & documentation</h2>
      <p className="text-sm opacity-80">Rastercue by Yaze Media, based on Upscayl. Processing stays local; opening these links connects to GitHub.</p>
      <p className="text-sm"><span className="opacity-70">Private support:</span> <a className="link link-primary" href={`mailto:${supportEmail}`}>{supportEmail}</a></p>
      <button className="btn btn-sm" onClick={onReplayGuide}>Replay the short getting-started guide</button>
      <nav aria-label="Support documents" className="flex flex-col gap-3 text-sm">{documents.map(([title,path])=><a key={path} className="link link-primary" href={`${repository}/blob/main/${path}`} target="_blank" rel="noreferrer">{title}</a>)}</nav>
      <AboutDialog/>
      <button className="btn btn-sm" onClick={async()=>{try{await window.rastercue.openLogs();}catch{setStatus('Could not open the log folder. Use readable logs below to copy or export entries.');}}}>Open full application log folder</button>
      <button className="btn btn-sm" onClick={async()=>{try{const saved=await window.rastercue.createSupportBundle();setStatus(saved?`Redacted support bundle saved locally: ${saved}`:'Support bundle cancelled.');}catch(error){setStatus(`Could not create the support bundle: ${String(error)}`);}}}>Create redacted support bundle</button>
    </section>
    <section className="space-y-4 rounded-lg border border-base-content/15 bg-base-200 p-5">
      <h2 className="text-lg font-semibold">GitHub & updates</h2>
      <div className="flex flex-wrap gap-3 text-sm"><a className="link link-primary" href="https://github.com/YazeKT" target="_blank" rel="noreferrer">Yaze Media profile</a><a className="link link-primary" href={repository} target="_blank" rel="noreferrer">Rastercue repository</a><a className="link link-primary" href="https://yazekt.github.io/Rastercue/" target="_blank" rel="noreferrer">Rastercue website</a><a className="link link-primary" href={`${repository}/issues`} target="_blank" rel="noreferrer">Report an issue</a><a className="link link-primary" href={`${repository}/releases`} target="_blank" rel="noreferrer">Releases & downloads</a></div>
      <AutoUpdateToggle/>
      <p className="text-xs opacity-80">When enabled, Rastercue checks and downloads its own GitHub updates. Installation requires your approval and waits until no upscale is active. Disable this for offline work.</p>
      <button className="btn btn-sm btn-primary" disabled={checking} onClick={check}>{checking?'Checking…':'Check for updates now'}</button>
      <p className="text-sm" role="status" aria-live="polite">{status}</p>
      <p className="text-xs opacity-75">Support bundles are created locally and are never sent automatically. Review the bundle before emailing it or attaching it to GitHub. Do not share confidential client images.</p>
    </section>
  </div>;
}
