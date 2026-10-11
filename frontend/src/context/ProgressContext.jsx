import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { BADGES, clearProgress, defaultProgress, loadProgress, saveProgress } from "../lib/progress";

const ProgressCtx = createContext(null);

export function ProgressProvider({ children }) {
  const [initial] = useState(() => loadProgress());
  const [progress, setProgress] = useState(initial.state);
  const [storageOk, setStorageOk] = useState(initial.available);
  const [year6Progress, setYear6Progress] = useState(() => {
    const base = { attempted: 0, correct: 0, byStandard: { "7.2.1": { attempted: 0, correct: 0 }, "7.3.1": { attempted: 0, correct: 0 } }, done: {}, lessonResults: {}, final: { attempts: 0, best: null, last: null } };
    try {
      const parsed = JSON.parse(window.localStorage.getItem("ratio-quest-year6-progress-v1") || "{}");
      return { ...base, ...parsed, byStandard: { ...base.byStandard, ...(parsed.byStandard || {}) }, done: parsed.done || {}, lessonResults: parsed.lessonResults || {}, final: { ...base.final, ...(parsed.final || {}) } };
    } catch { return base; }
  });
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
    try { window.localStorage.setItem("ratio-quest-year6-progress-v1", JSON.stringify(year6Progress)); } catch { /* Year 5 and course use continue if local storage is unavailable */ }
  }, [year6Progress]);

  useEffect(() => {
    document.documentElement.classList.toggle("reduce-motion", Boolean(progress.prefs.reduceMotion));
  }, [progress.prefs.reduceMotion]);

  const update = useCallback((fn) => setProgress((s) => fn(s)), []);
  const reset = useCallback(() => {
    clearProgress();
    prevBadges.current = [];
    setProgress(defaultProgress());
  }, []);

  const updateYear6 = useCallback((fn) => setYear6Progress((s) => fn(s)), []);
  const saveYear6Progress = useCallback((next) => {
    try {
      window.localStorage.setItem("ratio-quest-year6-progress-v1", JSON.stringify(next));
      setYear6Progress(next);
      return true;
    } catch {
      return false;
    }
  }, []);
  return <ProgressCtx.Provider value={{ progress, update, storageOk, reset, year6Progress, updateYear6, saveYear6Progress }}>{children}</ProgressCtx.Provider>;
}

export const useProgress = () => useContext(ProgressCtx);
