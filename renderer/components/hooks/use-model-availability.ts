import { useCallback, useEffect, useState } from 'react';

export default function useModelAvailability() {
  const [builtIn, setBuiltIn] = useState<Record<string, boolean> | null>(null);
  const refresh = useCallback(async () => {
    try {
      const result = await window.electron.getBuiltInModels();
      setBuiltIn(result);
      return result;
    } catch {
      setBuiltIn(null);
      return null;
    }
  }, []);
  useEffect(() => { void refresh(); }, [refresh]);
  return { builtIn, refresh };
}
