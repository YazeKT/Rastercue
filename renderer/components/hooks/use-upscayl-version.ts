import { useState, useEffect } from "react";

const useUpscaylVersion = () => {
  const [version, setVersion] = useState<string | null>(null);

  useEffect(() => {
    window.electron?.getAppVersion().then(setVersion).catch(() => setVersion('1.0.0'));
  }, []);

  return version;
};

export default useUpscaylVersion;
