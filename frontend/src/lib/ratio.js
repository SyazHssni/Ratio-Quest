export const MAX_COUNT = 12;

export const isValidCount = (n) => Number.isInteger(n) && n >= 0;

const assertCounts = (...ns) => {
  ns.forEach((n) => {
    if (!isValidCount(n)) throw new TypeError(`Invalid count: ${n}`);
  });
};

export const wholeOf = (...parts) => {
  assertCounts(...parts);
  return parts.reduce((sum, n) => sum + n, 0);
};

export const partsToParts = (a, b) => {
  assertCounts(a, b);
  return [a, b];
};

export const partToWhole = (part, ...otherParts) => {
  assertCounts(part, ...otherParts);
  return [part, wholeOf(part, ...otherParts)];
};

export const wholeToPart = (part, ...otherParts) => {
  assertCounts(part, ...otherParts);
  return [wholeOf(part, ...otherParts), part];
};

export const firstPartToWhole = (a, b) => partToWhole(a, b);
export const secondPartToWhole = (a, b) => partToWhole(b, a);
export const wholeToFirstPart = (a, b) => wholeToPart(a, b);
export const wholeToSecondPart = (a, b) => wholeToPart(b, a);

export const clampCount = (n, max = MAX_COUNT) => {
  if (!Number.isInteger(n)) return null;
  return Math.min(Math.max(n, 0), max);
};

export const formatRatio = (pair) => `${pair[0]} : ${pair[1]}`;

export const ratioEquals = (p, q) =>
  Array.isArray(p) && Array.isArray(q) && p.length === 2 && q.length === 2 && p[0] === q[0] && p[1] === q[1];

const RATIO_PATTERN = /^\s*(\d+)\s*[:∶]\s*(\d+)\s*$/;

export const normaliseRatioAnswer = (input) => {
  if (typeof input !== "string" || input.trim() === "") {
    return { ok: false, error: "Type two numbers with a colon between them, like 2 : 3." };
  }
  if (/-/.test(input)) return { ok: false, error: "Counts cannot be negative. Use whole numbers like 2 : 3." };
  if (/[.,]\d/.test(input)) return { ok: false, error: "Use whole numbers only, like 2 : 3." };
  const m = input.match(RATIO_PATTERN);
  if (!m) return { ok: false, error: "Write it like 2 : 3 — a number, a colon, then a number." };
  return { ok: true, value: [parseInt(m[1], 10), parseInt(m[2], 10)] };
};

export const normaliseNumberAnswer = (input) => {
  const s = typeof input === "string" ? input.trim() : String(input ?? "");
  if (!/^\d+$/.test(s)) return { ok: false, error: "Type a whole number, like 7." };
  return { ok: true, value: parseInt(s, 10) };
};

// Resolve a slot ("whole" or a group key) to its count.
export const slotValue = (groups, slot) => {
  if (slot === "whole") return wholeOf(...groups.map((g) => g.count));
  const g = groups.find((x) => x.key === slot);
  if (!g) throw new Error(`Unknown slot: ${slot}`);
  return g.count;
};

export const ratioFor = (groups, first, second) => [slotValue(groups, first), slotValue(groups, second)];

export const comparisonTypeOf = (first, second) => {
  if (first === "whole" && second === "whole") return null;
  if (first === "whole") return "w2p";
  if (second === "whole") return "p2w";
  return "p2p";
};
