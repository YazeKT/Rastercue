import { useEffect, useState } from "react";

export default function ThumbnailImage({
  jobId,
  fileId,
  kind,
  available,
  alt,
  className,
  fallback,
}: {
  jobId: string;
  fileId: string;
  kind: "source" | "output";
  available?: string;
  alt: string;
  className?: string;
  fallback?: string;
}) {
  const [source, setSource] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let current = true;
    setSource(null);
    setLoaded(false);
    if (!available || !window.rastercue) {
      setLoaded(true);
      return () => { current = false; };
    }
    window.rastercue.getThumbnail(jobId, fileId, kind)
      .then(value => { if (current) setSource(value); })
      .catch(() => { if (current) setSource(null); })
      .finally(() => { if (current) setLoaded(true); });
    return () => { current = false; };
  }, [available, fileId, jobId, kind]);

  if (source) return <img alt={alt} src={source} className={className} />;
  return fallback ? <span>{loaded ? fallback : "Loading…"}</span> : null;
}
