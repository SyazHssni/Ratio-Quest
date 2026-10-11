const KEY = "ratio-quest-progress-v1";

const lessonDefaults = () => ({ step: 0, taught: false, completed: false, mastered: false, bestScore: null, lastScore: null, attempts: 0 });

export const defaultProgress = () => ({
  version: 1,
  lessons: { p2p: lessonDefaults(), p2w: lessonDefaults(), w2p: lessonDefaults() },
  zones: {},
  games: {},
  final: { attempts: 0, best: null, last: null, passed: false },
  practice: { answered: 0, correct: 0, recentQuestionIds: [] },
  points: 0,
  awarded: {},
  badges: [],
  misconceptions: {},
  hintsUsed: 0,
  lab: { p2p: false, p2w: false, w2p: false },
  lastActivity: null,
  prefs: { reduceMotion: false },
});

export const BADGES = [
  { id: "explorer", name: "Ratio Explorer", desc: "Completed the introductory lesson.", check: (s) => s.lessons.p2p.taught },
  { id: "comparison", name: "Comparison Champion", desc: "Mastered parts to parts.", check: (s) => s.lessons.p2p.mastered },
  { id: "whole", name: "Whole Finder", desc: "Mastered parts to whole.", check: (s) => s.lessons.p2w.mastered },
  { id: "reverse", name: "Reverse Detective", desc: "Mastered whole to part.", check: (s) => s.lessons.w2p.mastered },
  { id: "visual", name: "Visual Thinker", desc: "Built a correct ratio of every type in the Ratio Lab.", check: (s) => s.lab.p2p && s.lab.p2w && s.lab.w2p },
  { id: "master", name: "Ratio Master", desc: "Passed the Final Challenge.", check: (s) => s.final.passed },
];

const withBadges = (s) => {
  const earned = BADGES.filter((b) => b.check(s)).map((b) => b.id);
  const merged = [...new Set([...s.badges, ...earned])];
  return merged.length === s.badges.length ? s : { ...s, badges: merged };
};

export const awardOnce = (s, eventId, pts) => (s.awarded[eventId] ? s : { ...s, points: s.points + pts, awarded: { ...s.awarded, [eventId]: true } });

const patchLesson = (s, id, patch) => ({ ...s, lessons: { ...s.lessons, [id]: { ...s.lessons[id], ...patch } } });

export const setLessonStep = (s, id, step) => patchLesson(s, id, { step });

export const markTaught = (s, id) => withBadges(awardOnce(patchLesson(s, id, { taught: true }), `taught:${id}`, 20));

export const recordMastery = (s, id, result) => {
  const l = s.lessons[id];
  let next = patchLesson(s, id, {
    attempts: l.attempts + 1,
    lastScore: result.score,
    bestScore: l.bestScore === null ? result.score : Math.max(l.bestScore, result.score),
    mastered: l.mastered || result.passed,
    completed: l.completed || result.passed,
  });
  if (result.passed) next = awardOnce(awardOnce(next, `mastery:${id}`, 30), `lesson:${id}`, 50);
  return withBadges(next);
};

export const recordFinal = (s, result) =>
  withBadges(
    (result.passed ? (x) => awardOnce(x, "final:passed", 100) : (x) => x)({
      ...s,
      final: {
        attempts: s.final.attempts + 1,
        last: result.score,
        best: s.final.best === null ? result.score : Math.max(s.final.best, result.score),
        passed: s.final.passed || result.passed,
        lastByType: result.byType,
      },
    })
  );

export const recordZone = (s, id, score, total) => {
  const prev = s.zones[id] || { completed: false, best: 0 };
  return awardOnce({ ...s, zones: { ...s.zones, [id]: { completed: true, best: Math.max(prev.best, score), total } } }, `zone:${id}`, 25);
};

export const recordGame = (s, id, score, total) => {
  const prev = s.games[id] || { plays: 0, best: 0 };
  return awardOnce({ ...s, games: { ...s.games, [id]: { plays: prev.plays + 1, best: Math.max(prev.best, score), total } } }, `game:${id}`, 20);
};

export const recordLab = (s, type) => withBadges(awardOnce({ ...s, lab: { ...s.lab, [type]: true } }, `lab:${type}`, 10));

// Points for a correct answer: first try, or after fixing a misconception with a hint.
export const recordAnswer = (s, qid, { correct, attempts }) => {
  if (!correct) return s;
  const pts = attempts === 0 ? 10 : 5;
  return awardOnce({ ...s, practice: { answered: s.practice.answered + 1, correct: s.practice.correct + 1 } }, `q:${qid}`, pts);
};

export const recordPracticeSession = (s, questionIds) => ({
  ...s,
  practice: {
    ...s.practice,
    recentQuestionIds: [...new Set([...(questionIds || []), ...(s.practice.recentQuestionIds || [])])].slice(0, 40),
  },
});

export const recordMisconception = (s, cat) =>
  !cat || cat === "correct" ? s : { ...s, misconceptions: { ...s.misconceptions, [cat]: (s.misconceptions[cat] || 0) + 1 } };

export const recordHint = (s) => ({ ...s, hintsUsed: s.hintsUsed + 1 });

export const setLastActivity = (s, path, label) => ({ ...s, lastActivity: { path, label } });

export const setPref = (s, key, value) => ({ ...s, prefs: { ...s.prefs, [key]: value } });

export const isLessonUnlocked = (s, id) => (id === "p2p" ? true : id === "p2w" ? s.lessons.p2p.mastered : s.lessons.p2w.mastered);

export const allCoreMastered = (s) => s.lessons.p2p.mastered && s.lessons.p2w.mastered && s.lessons.w2p.mastered;

export const hasAnyProgress = (s) => Boolean(s.lastActivity) || s.points > 0;

const merge = (base, saved) => {
  const out = { ...base, ...saved };
  out.lessons = { ...base.lessons };
  Object.keys(base.lessons).forEach((k) => {
    out.lessons[k] = { ...base.lessons[k], ...(saved.lessons?.[k] || {}) };
  });
  ["final", "lab", "prefs", "practice"].forEach((k) => {
    out[k] = { ...base[k], ...(saved[k] || {}) };
  });
  return out;
};

export function loadProgress(storage = typeof window !== "undefined" ? window.localStorage : null) {
  try {
    const probe = "__rq_probe__";
    storage.setItem(probe, "1");
    storage.removeItem(probe);
    const raw = storage.getItem(KEY);
    if (!raw) return { state: defaultProgress(), available: true };
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.version !== 1) return { state: defaultProgress(), available: true };
    return { state: merge(defaultProgress(), parsed), available: true };
  } catch (e) {
    return { state: defaultProgress(), available: false };
  }
}

export function saveProgress(state, storage = typeof window !== "undefined" ? window.localStorage : null) {
  try {
    storage.setItem(KEY, JSON.stringify(state));
    return true;
  } catch (e) {
    return false;
  }
}

export const clearProgress = (storage = typeof window !== "undefined" ? window.localStorage : null) => {
  try {
    storage.removeItem(KEY);
  } catch (e) {
    /* storage unavailable */
  }
};
