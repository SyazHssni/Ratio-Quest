export const YEAR6_CHECKPOINTS = [
  { id: "workshop", title: "🍎 The Ratio Workshop", focus: "Understand equivalent ratios and represent ratios in their simplest form.", standards: "Learning Standard 7.2.1", lessons: ["meaning", "simplest", "factors", "preserve"] },
  { id: "kitchen", title: "🥤 The Proportion Kitchen", focus: "Use scale factors to find proportionate quantities and explain why the relationship stays the same.", standards: "Learning Standard 7.3.1", lessons: ["scale", "missing", "both"] },
  { id: "challenge", title: "💎 The Ratio Detective Challenge", focus: "Connect simplification and proportion in mixed problems.", standards: "7.2.1 + 7.3.1", lessons: ["connect"] },
];

export const year6CheckpointDone = (checkpoint, done = {}) => checkpoint.lessons.every((id) => Boolean(done[id]));

export const year6CheckpointOpen = (checkpoints, index, done = {}) => (
  index === 0 || year6CheckpointDone(checkpoints[index - 1], done)
);

export function completeYear6LessonProgress(progress, lessonId, score, total = 3) {
  if (score < 2) return null;
  const done = progress.done || {};
  const lessonResults = progress.lessonResults || {};
  const alreadyDone = Boolean(done[lessonId]);
  const previous = lessonResults[lessonId] || {};
  return {
    ...progress,
    done: { ...done, [lessonId]: true },
    lessonResults: {
      ...lessonResults,
      [lessonId]: {
        score: Math.max(previous.score || 0, score),
        total,
        attempts: (previous.attempts || 0) + (alreadyDone ? 0 : 1),
      },
    },
  };
}
