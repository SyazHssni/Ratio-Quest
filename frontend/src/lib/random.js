export const hashString = (s) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
};

const mulberry32 = (seed) => () => {
  let t = (seed += 0x6d2b79f5);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

export const seededShuffle = (arr, seed) => {
  const rand = mulberry32(seed);
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
};

export const shuffle = (arr) => seededShuffle(arr, Math.floor(Math.random() * 1e9));

export const pickRandom = (arr, n) => shuffle(arr).slice(0, n);

const questionPair = (q) => [...(q.objectTypes || q.groups?.map((g) => g.key) || [])].sort().join("+");
const questionStructure = (q) => q.questionStructure || [q.comparisonType, q.questionFormat, q.reasoningSkill].join("|");

// Select unique questions, balance ratio types, and avoid consecutive structural,
// context, or object-pair repeats. Recent IDs are avoided until the pool requires reuse.
export function selectPracticeQuestions(pool, count, seed = Date.now(), recentIds = []) {
  const uniquePool = [...new Map(pool.map((q) => [q.id, q])).values()];
  const fresh = uniquePool.filter((q) => !recentIds.includes(q.id));
  const candidates = seededShuffle(fresh.length >= count ? fresh : uniquePool, seed);
  const selected = [];
  const typeCounts = { p2p: 0, p2w: 0, w2p: 0 };
  while (selected.length < Math.min(count, candidates.length)) {
    const previous = selected[selected.length - 1];
    const eligible = candidates.filter((q) => !selected.some((item) => item.id === q.id));
    const score = (q) => (typeCounts[q.comparisonType] || 0) * 10
      + (previous && questionStructure(q) === questionStructure(previous) ? 1000 : 0)
      + (previous && questionPair(q) === questionPair(previous) ? 500 : 0)
      + (previous && q.contextCategory === previous.contextCategory ? 100 : 0);
    const next = eligible.reduce((best, q) => !best || score(q) < score(best) ? q : best, null);
    selected.push(next);
    typeCounts[next.comparisonType] = (typeCounts[next.comparisonType] || 0) + 1;
  }
  return selected;
}
