import { CONTEXTS, makeGroups, labelFor } from "./objects";
import { ratioFor, formatRatio, ratioEquals, normaliseRatioAnswer, isValidCount, comparisonTypeOf } from "../lib/ratio";
import { classifyAnswer } from "../lib/misconceptions";
import { hashString, seededShuffle } from "../lib/random";

// [id, context, countA, countB, first, second, kind, difficulty, statedAnswer, setId]
const ROWS = [
  ["p2p-01", "balls", 2, 3, "a", "b", "choice", "easy", "2:3"],
  ["p2p-02", "balls", 2, 3, "b", "a", "choice", "easy", "3:2"],
  ["p2p-03", "stars", 4, 2, "a", "b", "choice", "easy", "4:2"],
  ["p2p-04", "fruit", 5, 1, "b", "a", "choice", "easy", "1:5"],
  ["p2p-05", "counters", 6, 4, "a", "b", "input", "easy", "6:4"],
  ["p2p-06", "garden", 3, 7, "b", "a", "input", "medium", "7:3"],
  ["p2p-07", "toys", 8, 5, "a", "b", "build", "easy", "8:5"],
  ["p2p-08", "party", 2, 9, "b", "a", "build", "medium", "9:2"],
  ["p2p-09", "pool", 7, 3, "a", "b", "choice", "medium", "7:3"],
  ["p2p-10", "bowl", 4, 6, "b", "a", "choice", "medium", "6:4"],
  ["p2p-11", "stationery", 5, 2, "a", "b", "mistake", "medium", "5:2"],
  ["p2p-12", "treasure", 3, 8, "b", "a", "mistake", "challenging", "8:3"],
  ["p2p-13", "apples", 6, 1, "a", "b", "input", "medium", "6:1"],
  ["p2p-14", "stars", 9, 4, "b", "a", "input", "challenging", "4:9"],
  ["p2p-15", "counters", 1, 7, "a", "b", "build", "medium", "1:7"],
  ["p2p-16", "fruit", 3, 6, "a", "b", "choice", "easy", "3:6"],
  ["p2p-17", "garden", 5, 9, "a", "b", "choice", "challenging", "5:9"],
  ["p2p-18", "toys", 2, 6, "b", "a", "mistake", "challenging", "6:2"],
  ["p2p-19", "bowl", 8, 3, "a", "b", "input", "challenging", "8:3"],
  ["p2p-20", "treasure", 4, 7, "a", "b", "choice", "challenging", "4:7", "S1"],
  ["p2w-01", "fruit", 3, 2, "a", "whole", "choice", "easy", "3:5"],
  ["p2w-02", "fruit", 3, 2, "b", "whole", "choice", "easy", "2:5"],
  ["p2w-03", "stationery", 4, 3, "a", "whole", "choice", "easy", "4:7"],
  ["p2w-04", "balls", 2, 3, "a", "whole", "choice", "easy", "2:5"],
  ["p2w-05", "balls", 2, 3, "b", "whole", "input", "easy", "3:5"],
  ["p2w-06", "counters", 5, 4, "b", "whole", "input", "medium", "4:9"],
  ["p2w-07", "garden", 6, 2, "a", "whole", "build", "medium", "6:8"],
  ["p2w-08", "party", 3, 5, "b", "whole", "build", "medium", "5:8"],
  ["p2w-09", "toys", 1, 6, "a", "whole", "choice", "medium", "1:7"],
  ["p2w-10", "pool", 4, 5, "b", "whole", "choice", "medium", "5:9"],
  ["p2w-11", "stars", 3, 7, "a", "whole", "mistake", "medium", "3:10"],
  ["p2w-12", "bowl", 5, 6, "b", "whole", "mistake", "challenging", "6:11"],
  ["p2w-13", "apples", 7, 2, "a", "whole", "input", "medium", "7:9"],
  ["p2w-14", "treasure", 2, 9, "b", "whole", "input", "challenging", "9:11"],
  ["p2w-15", "counters", 8, 1, "a", "whole", "build", "challenging", "8:9"],
  ["p2w-16", "stationery", 6, 6, "b", "whole", "choice", "challenging", "6:12"],
  ["p2w-17", "garden", 4, 8, "b", "whole", "choice", "challenging", "8:12"],
  ["p2w-18", "fruit", 5, 3, "a", "whole", "mistake", "challenging", "5:8"],
  ["p2w-19", "party", 9, 2, "a", "whole", "input", "challenging", "9:11"],
  ["p2w-20", "treasure", 4, 7, "b", "whole", "choice", "challenging", "7:11", "S1"],
  ["w2p-01", "fruit", 3, 2, "whole", "a", "choice", "easy", "5:3"],
  ["w2p-02", "fruit", 3, 2, "whole", "b", "choice", "easy", "5:2"],
  ["w2p-03", "counters", 4, 5, "whole", "b", "choice", "easy", "9:5"],
  ["w2p-04", "balls", 2, 3, "whole", "a", "choice", "easy", "5:2"],
  ["w2p-05", "balls", 2, 3, "whole", "b", "input", "easy", "5:3"],
  ["w2p-06", "stars", 6, 3, "whole", "a", "input", "medium", "9:6"],
  ["w2p-07", "toys", 2, 5, "whole", "b", "build", "medium", "7:5"],
  ["w2p-08", "pool", 7, 1, "whole", "a", "build", "medium", "8:7"],
  ["w2p-09", "garden", 3, 4, "whole", "a", "choice", "medium", "7:3"],
  ["w2p-10", "party", 5, 5, "whole", "b", "choice", "medium", "10:5"],
  ["w2p-11", "stationery", 2, 6, "whole", "a", "mistake", "medium", "8:2"],
  ["w2p-12", "bowl", 3, 9, "whole", "b", "mistake", "challenging", "12:9"],
  ["w2p-13", "apples", 4, 3, "whole", "b", "input", "medium", "7:3"],
  ["w2p-14", "counters", 7, 6, "whole", "a", "input", "challenging", "13:7"],
  ["w2p-15", "treasure", 1, 8, "whole", "a", "build", "challenging", "9:1"],
  ["w2p-16", "stars", 2, 7, "whole", "b", "choice", "challenging", "9:7"],
  ["w2p-17", "toys", 6, 4, "whole", "a", "choice", "challenging", "10:6"],
  ["w2p-18", "garden", 8, 2, "whole", "b", "mistake", "challenging", "10:2"],
  ["w2p-19", "pool", 5, 3, "whole", "b", "input", "challenging", "8:3"],
  ["w2p-20", "treasure", 4, 7, "whole", "a", "choice", "challenging", "11:4", "S1"],
];

const NAMES = ["Mia", "Arjun", "Zara", "Leo", "Aisha", "Tom", "Priya", "Sam"];
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const slotKey = (ctx, pos) => (pos === "whole" ? "whole" : CONTEXTS[ctx].items[pos === "a" ? 0 : 1]);

function buildPrompt({ ctx, groups, first, second, difficulty, kind, id, rafi }) {
  const c = CONTEXTS[ctx];
  const f = labelFor(groups, first, c.whole);
  const s = labelFor(groups, second, c.whole);
  const [A, B] = groups;
  const story = `${cap(c.place)} has ${A.count} ${A.count === 1 ? A.singular : A.plural} and ${B.count} ${B.count === 1 ? B.singular : B.plural}.`;
  if (kind === "mistake") return `${story} Rafi says the ratio of ${f} to ${s} is ${rafi}. Can you help Rafi fix the answer?`;
  if (difficulty === "easy") return `Look at ${c.place}. What is the ratio of ${f} to ${s}?`;
  if (difficulty === "medium") {
    if (first === "whole") return `${story} Compare the total number of ${c.whole} with the ${s}. What is the ratio of ${f} to ${s}?`;
    return `${story} What is the ratio of ${f} to ${s}?`;
  }
  const name = NAMES[hashString(id) % NAMES.length];
  return `${name} looks in ${c.place}. There are ${A.count} ${A.plural} and ${B.count} ${B.plural}. Write the ratio of ${f} to ${s}.`;
}

export function distractorsFor(q) {
  const [x, y] = q.correctAnswer;
  const whole = q.groups.reduce((t, g) => t + g.count, 0);
  const [A, B] = q.groups.map((g) => g.count);
  const pool = [[y, x]];
  if (q.comparisonType === "p2p") pool.push([x, whole], [whole, y], [x + 1, y + 1]);
  else {
    const partSlot = q.first === "whole" ? q.second : q.first;
    const part = q.groups.find((g) => g.key === partSlot).count;
    const other = part === A ? B : A;
    pool.push([part, other], q.first === "whole" ? [whole + part, part] : [part, whole + part], q.first === "whole" ? [whole, other] : [part, whole - 1]);
  }
  const seen = new Set([formatRatio(q.correctAnswer)]);
  return pool.filter((p) => p.every(isValidCount)).filter((p) => {
    const k = formatRatio(p);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

export function buildQuestion(spec) {
  const { id, ctx, a, b, first: fp, second: sp, kind = "choice", difficulty = "easy", answer, setId } = spec;
  const groups = makeGroups(ctx, a, b);
  const first = slotKey(ctx, fp);
  const second = slotKey(ctx, sp);
  const wholeWord = CONTEXTS[ctx].whole;
  const q = {
    id,
    ctx,
    lessonId: comparisonTypeOf(first, second),
    comparisonType: comparisonTypeOf(first, second),
    kind,
    difficulty,
    groups,
    wholeWord,
    place: CONTEXTS[ctx].place,
    first,
    second,
    firstPos: fp,
    secondPos: sp,
    firstQuantityLabel: labelFor(groups, first, wholeWord),
    secondQuantityLabel: labelFor(groups, second, wholeWord),
    statedAnswer: answer,
    correctAnswer: ratioFor(groups, first, second),
    setId: setId || null,
    showVisual: difficulty !== "challenging" || kind === "build",
    masterySkill: comparisonTypeOf(first, second),
  };
  const ds = distractorsFor(q);
  if (kind === "mistake") q.rafiAnswer = formatRatio(ds.find((d) => classifyAnswer(q, d).category === "B") || ds.find((d) => ["A", "C"].includes(classifyAnswer(q, d).category)) || ds[0]);
  q.prompt = spec.prompt || buildPrompt({ ...q, rafi: q.rafiAnswer });
  const optionPool = kind === "mistake" ? ds.filter((d) => formatRatio(d) !== q.rafiAnswer) : ds;
  q.answerOptions =
    spec.options ||
    seededShuffle([q.correctAnswer, ...optionPool.slice(0, 2)].map(formatRatio), hashString(id));
  q.hint =
    q.comparisonType === "p2p"
      ? `Count the ${q.firstQuantityLabel} first. Then count the ${q.secondQuantityLabel}.`
      : `Find the whole first: ${groups.map((g) => g.count).join(" + ")} = ? Then check which comes first in the question.`;
  return q;
}

export function validateQuestion(q) {
  const errors = [];
  if (!q.groups.every((g) => isValidCount(g.count))) errors.push("invalid counts");
  if (q.groups.reduce((t, g) => t + g.count, 0) === 0) errors.push("empty collection");
  if (q.first === q.second) errors.push("first equals second");
  if (!q.comparisonType) errors.push("no comparison type");
  if (q.statedAnswer) {
    const parsed = normaliseRatioAnswer(q.statedAnswer);
    if (!parsed.ok || !ratioEquals(parsed.value, q.correctAnswer)) errors.push(`stated answer ${q.statedAnswer} disagrees with counts`);
  }
  if (q.kind !== "build" && q.kind !== "input") {
    const opts = q.answerOptions || [];
    if (opts.filter((o) => o === formatRatio(q.correctAnswer)).length !== 1) errors.push("correct option missing or duplicated");
    if (new Set(opts).size !== opts.length) errors.push("duplicate options");
    if (opts.length < 3) errors.push("too few options");
  }
  if (q.kind === "mistake" && q.rafiAnswer === formatRatio(q.correctAnswer)) errors.push("Rafi's mistake is correct");
  if (!q.prompt.includes(q.firstQuantityLabel) || !q.prompt.includes(q.secondQuantityLabel)) errors.push("prompt does not state the comparison");
  return errors.map((e) => `${q.id}: ${e}`);
}

const toSpec = ([id, ctx, a, b, first, second, kind, difficulty, answer, setId]) => ({ id, ctx, a, b, first, second, kind, difficulty, answer, setId });

const ALL = ROWS.map((r) => buildQuestion(toSpec(r)));
export const BANK_ERRORS = ALL.flatMap(validateQuestion);
if (BANK_ERRORS.length && process.env.NODE_ENV !== "production") {
  // eslint-disable-next-line no-console
  console.error("Question bank validation failed:", BANK_ERRORS);
}
const invalidIds = new Set(BANK_ERRORS.map((e) => e.split(":")[0]));
export const QUESTION_BANK = ALL.filter((q) => !invalidIds.has(q.id));

export const questionsFor = (type) => QUESTION_BANK.filter((q) => q.comparisonType === type);
export const questionById = (id) => QUESTION_BANK.find((q) => q.id === id);

// A simpler, fully visible example of the same comparison type.
export function simplerQuestion(q) {
  const pairs = [[1, 2], [2, 1], [3, 1], [1, 3], [2, 3]];
  const [a, b] = pairs[hashString(q.id) % pairs.length];
  return buildQuestion({ id: `${q.id}-simple`, ctx: "counters", a, b, first: q.firstPos, second: q.secondPos, kind: "choice", difficulty: "easy" });
}
