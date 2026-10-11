import { completeYear6LessonProgress, year6CheckpointDone, year6CheckpointOpen, YEAR6_CHECKPOINTS } from "../year6Progress";

describe("Year 6 completion and checkpoint progression", () => {
  test("does not mark a lesson complete below the existing 2 of 3 threshold", () => {
    expect(completeYear6LessonProgress({ done: {} }, "meaning", 1)).toBeNull();
  });

  test("records a passing lesson and its result under the same stable lesson ID", () => {
    const progress = completeYear6LessonProgress({ done: {}, lessonResults: {} }, "meaning", 2);
    expect(progress.done.meaning).toBe(true);
    expect(progress.lessonResults.meaning).toEqual({ score: 2, total: 3, attempts: 1 });
  });

  test("repeating completion does not increment its completion record", () => {
    const prior = { done: { meaning: true }, lessonResults: { meaning: { score: 2, total: 3, attempts: 1 } } };
    const next = completeYear6LessonProgress(prior, "meaning", 3);
    expect(next.lessonResults.meaning).toEqual({ score: 3, total: 3, attempts: 1 });
  });

  test("opens the next checkpoint only after every prerequisite lesson is complete", () => {
    expect(year6CheckpointOpen(YEAR6_CHECKPOINTS, 1, { meaning: true, simplest: true })).toBe(false);
    const finishedWorkshop = { meaning: true, simplest: true, factors: true, preserve: true };
    expect(year6CheckpointDone(YEAR6_CHECKPOINTS[0], finishedWorkshop)).toBe(true);
    expect(year6CheckpointOpen(YEAR6_CHECKPOINTS, 1, finishedWorkshop)).toBe(true);
  });
});
