import { questionsFor, buildQuestion } from "../data/questionBank";
import { CONTEXTS, countedObject } from "../data/objects";
import { pickRandom, shuffle, seededShuffle, hashString } from "./random";

export const TYPES = ["p2p", "p2w", "w2p"];
export const TYPE_NAMES = { p2p: "Parts to Parts", p2w: "Parts to Whole", w2p: "Whole to Part" };

export function makeTotalQuestion(q) {
  const whole = q.groups.reduce((t, g) => t + g.count, 0);
  const [A, B] = q.groups;
  const opts = [...new Set([A.count, B.count, whole, whole + 1])].slice(0, 4);
  return {
    ...q,
    id: `${q.id}-total`,
    kind: "total",
    comparisonType: q.comparisonType,
    groups: q.groups,
    wholeWord: q.wholeWord,
    first: q.first,
    second: q.second,
    showVisual: true,
    tag: "whole",
    prompt: `${q.place.charAt(0).toUpperCase() + q.place.slice(1)} has ${countedObject(A, A.count)} and ${countedObject(B, B.count)}. How many ${q.wholeWord} are there altogether?`,
    answerOptions: seededShuffle(opts.map(String), hashString(q.id)),
    correctTotal: whole,
    objective: "Find the total number of objects in both groups",
    questionFormat: "select-total",
    reasoningSkill: "add-the-parts-once",
    answerExplanation: `The whole is ${A.count} + ${B.count} = ${whole} ${q.wholeWord}.`,
    solutionSteps: [`Count each group once: ${A.count} + ${B.count} = ${whole}.`, `There are ${whole} ${q.wholeWord} altogether.`],
  };
}

export function makeMeaningQuestion(q) {
  const [x, y] = q.correctAnswer;
  const lab = (slot) => (slot === "whole" ? `all the ${q.wholeWord}` : q.groups.find((g) => g.key === slot).plural);
  const f = lab(q.first);
  const s = lab(q.second);
  return {
    ...q,
    id: `${q.id}-meaning`,
    kind: "meaning",
    comparisonType: q.comparisonType,
    groups: q.groups,
    wholeWord: q.wholeWord,
    first: q.first,
    second: q.second,
    showVisual: true,
    tag: "meaning",
    prompt: `Rafi writes ${f} : ${s} = ${x} : ${y}. What does the ratio ${x} : ${y} mean?`,
    answerOptions: seededShuffle(
      [
        { text: `The first number, ${x}, counts ${f}; the second number, ${y}, counts ${s}.`, category: "correct" },
        { text: `The first number, ${x}, counts ${s}; the second number, ${y}, counts ${f}.`, category: q.comparisonType === "p2p" ? "A" : "C" },
        { text: `The ratio ${x} : ${y} is one amount that tells the total number of ${q.wholeWord}: ${x + y}.`, category: "H" },
      ],
      hashString(q.id)
    ),
    correctText: `The ratio ${x} : ${y} means that the first number, ${x}, counts ${f}, and the second number, ${y}, counts ${s}. The order matters: ${f} come first.`,
    hint: `Count the ${f} first, then the ${s}. The first number represents ${f}; the second represents ${s}.`,
    answerExplanation: `The first number counts ${f}; the second number counts ${s}. The order matters.`,
    objective: "Interpret the meaning of both terms in a ratio",
    questionFormat: "select-explanation",
    reasoningSkill: "interpret-ratio-order",
  };
}

export function buildMasterySet(type) {
  const pool = questionsFor(type).filter((q) => !q.setId);
  if (type === "p2p") {
    const reversed = pickRandom(pool.filter((q) => q.firstPos === "b"), 1).map((q) => ({ ...q, tag: "reversed" }));
    const rest = pickRandom(pool.filter((q) => q.id !== reversed[0].id), 4);
    return shuffle([...reversed, ...rest]);
  }
  const four = pickRandom(pool, 4);
  if (type === "p2w") return [makeTotalQuestion(pickRandom(pool.filter((q) => !four.includes(q)), 1)[0]), ...four];
  return [...four, makeMeaningQuestion(pickRandom(pool.filter((q) => !four.includes(q)), 1)[0])];
}

const RULE_TAG = { p2p: "reversed", p2w: "whole", w2p: "meaning" };
const RULE_TEXT = {
  p2p: "Answer the reversed-order question correctly",
  p2w: "Find the whole correctly",
  w2p: "Explain what both numbers mean",
};

export function lessonMasteryResult(type, answers) {
  const score = answers.filter((a) => a.correct).length;
  const ruleOk = answers.some((a) => a.tag === RULE_TAG[type] && a.correct);
  const orderConfusions = answers.filter((a) => a.category === "A" || a.category === "C").length;
  return {
    score,
    total: answers.length,
    passed: score >= 4 && ruleOk,
    ruleOk,
    ruleText: RULE_TEXT[type],
    needsOrderReview: orderConfusions >= 2,
  };
}

export function buildFinalSet() {
  const items = TYPES.flatMap((t) => {
    const all = questionsFor(t);
    return [...pickRandom(all.filter((q) => !q.setId), 4), ...all.filter((q) => q.setId === "S1")];
  });
  return shuffle(items);
}

export function finalResult(answers) {
  const byType = Object.fromEntries(TYPES.map((t) => [t, { correct: 0, total: 0 }]));
  answers.forEach((a) => {
    byType[a.type].total += 1;
    if (a.correct) byType[a.type].correct += 1;
  });
  const score = answers.filter((a) => a.correct).length;
  const sameSetOk = answers.some((a) => a.setId && a.correct);
  const weak = TYPES.filter((t) => byType[t].correct < 4);
  const passed = score >= 12 && weak.length === 0 && sameSetOk;
  const weakest = weak.sort((x, y) => byType[x].correct - byType[y].correct)[0];
  let next;
  if (passed) next = { label: "Play Ratio Detective", path: "/games/detective", text: "You are a Ratio Master! Keep your skills sharp with a game." };
  else if (weakest) next = { label: `Revisit ${TYPE_NAMES[weakest]}`, path: `/practice?topic=${weakest}`, text: `Practise ${TYPE_NAMES[weakest]} a little more, then try again.`, type: weakest };
  else next = { label: "Try the challenge again", path: "/final", text: "You are very close. Look carefully at questions that use the same objects in different ways." };
  return {
    score,
    total: answers.length,
    byType,
    sameSetOk,
    passed,
    demonstrated: TYPES.filter((t) => byType[t].correct >= 4).map((t) => TYPE_NAMES[t]),
    needsPractice: weak.map((t) => TYPE_NAMES[t]),
    next,
  };
}

export const ZONES = [
  { id: "p2p", name: "The Garden Grove", ctx: "garden", story: "Rafi is sorting flowers and leaves. Help him compare one group with another." },
  { id: "p2w", name: "The Fruit Market", ctx: "fruit", story: "Market stalls are packing baskets. Compare one kind of fruit with the whole basket." },
  { id: "w2p", name: "The Treasure Cave", ctx: "treasure", story: "The cave is full of gems and coins. Compare all the treasure with one kind." },
];

export const zoneQuestions = (type) => {
  const pool = questionsFor(type);
  return pickRandom(pool, 4);
};

export const contextName = (ctx) => CONTEXTS[ctx].place;
export { buildQuestion };
