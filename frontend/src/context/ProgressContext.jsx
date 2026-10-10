import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { BADGES, clearProgress, defaultProgress, loadProgress, saveProgress } from "../lib/progress";

const ProgressCtx = createContext(null);

export function ProgressProvider({ children }) {
  const [initial] = useState(() => loadProgress());
  const [progress, setProgress] = useState(initial.state);
  const [storageOk, setStorageOk] = useState(initial.available);
  const prevBadges = useRef(initial.state.badges);

  useEffect(() => {
    if (storageOk && !saveProgress(progress)) setStorageOk(false);
    const fresh = progress.badges.filter((b) => !prevBadges.current.includes(b));
    fresh.forEach((id) => {
      const b = BADGES.find((x) => x.id === id);
      toast.success(`Badge earned: ${b.name}`, { description: b.desc });
    });
    prevBadges.current = progress.badges;
  }, [progress, storageOk]);

  useEffect(() => {
    document.documentElement.classList.toggle("reduce-motion", Boolean(progress.prefs.reduceMotion));
  }, [progress.prefs.reduceMotion]);

  const update = useCallback((fn) => setProgress((s) => fn(s)), []);
  const reset = useCallback(() => {
    clearProgress();
    prevBadges.current = [];
    setProgress(defaultProgress());
  }, []);

  return <ProgressCtx.Provider value={{ progress, update, storageOk, reset }}>{children}</ProgressCtx.Provider>;
}

export const useProgress = () => useContext(ProgressCtx);
