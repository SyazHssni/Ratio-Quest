import { defaultProgress, awardOnce, recordMastery, recordAnswer, loadProgress, saveProgress, isLessonUnlocked, recordFinal } from "../progress";

const memoryStorage = () => {
  const m = {};
  return { getItem: (k) => (k in m ? m[k] : null), setItem: (k, v) => { m[k] = String(v); }, removeItem: (k) => { delete m[k]; } };
};

describe("progress", () => {
  test("points are awarded once per event", () => {
    let s = awardOnce(defaultProgress(), "x", 10);
    s = awardOnce(s, "x", 10);
    expect(s.points).toBe(10);
  });
  test("answers never subtract points", () => {
    const s = recordAnswer(defaultProgress(), "q1", { correct: false, attempts: 0 });
    expect(s.points).toBe(0);
  });
  test("best and last scores are separate; mastery is kept after a lower score", () => {
    let s = recordMastery(defaultProgress(), "p2p", { score: 5, passed: true });
    s = recordMastery(s, "p2p", { score: 2, passed: false });
    expect(s.lessons.p2p).toMatchObject({ bestScore: 5, lastScore: 2, mastered: true, attempts: 2 });
    expect(s.badges).toContain("comparison");
  });
  test("lesson unlocking", () => {
    let s = defaultProgress();
    expect(isLessonUnlocked(s, "p2w")).toBe(false);
    s = recordMastery(s, "p2p", { score: 4, passed: true });
    expect(isLessonUnlocked(s, "p2w")).toBe(true);
  });
  test("final pass awards Ratio Master", () => expect(recordFinal(defaultProgress(), { score: 14, passed: true, byType: {} }).badges).toContain("master"));
  test("save and load round trip", () => {
    const st = memoryStorage();
    const s = awardOnce(defaultProgress(), "y", 7);
    expect(saveProgress(s, st)).toBe(true);
    expect(loadProgress(st).state.points).toBe(7);
  });
  test("unavailable storage still returns a usable state", () => {
    const broken = { getItem: () => { throw new Error("no"); }, setItem: () => { throw new Error("no"); }, removeItem: () => {} };
    const r = loadProgress(broken);
    expect(r.available).toBe(false);
    expect(r.state.points).toBe(0);
    expect(saveProgress(r.state, broken)).toBe(false);
  });
});
