import { questionsFor, buildQuestion } from "../data/questionBank";
import { CONTEXTS } from "../data/objects";
import { pickRandom, shuffle, seededShuffle, hashString } from "./random";

export const TYPES = ["p2p", "p2w", "w2p"];
export const TYPE_NAMES = { p2p: "Parts to Parts", p2w: "Parts to Whole", w2p: "Whole to Part" };

export function makeTotalQuestion(q) {
  const whole = q.groups.reduce((t, g) => t + g.count, 0);
  const [A, B] = q.groups;
  const opts = [...new Set([A.count, B.count, whole, whole + 1])].slice(0, 4);
  return {
    id: `${q.id}-total`,
    kind: "total",
    comparisonType: q.comparisonType,
    groups: q.groups,
    wholeWord: q.wholeWord,
    first: q.first,
    second: q.second,
    showVisual: true,
    tag: "whole",
    prompt: `${q.place.charAt(0).toUpperCase() + q.place.slice(1)} has ${A.count} ${A.plural} and ${B.count} ${B.plural}. How many ${q.wholeWord} are there altogether?`,
    answerOptions: seededShuffle(opts.map(String), hashString(q.id)),
    correctTotal: whole,
  };
}

export function makeMeaningQuestion(q) {
  const [x, y] = q.correctAnswer;
  const lab = (slot) => (slot === "whole" ? `all the ${q.wholeWord}` : q.groups.find((g) => g.key === slot).plural);
  const f = lab(q.first);
  const s = lab(q.second);
  return {
    id: `${q.id}-meaning`,
    kind: "meaning",
    comparisonType: q.comparisonType,
    groups: q.groups,
    wholeWord: q.wholeWord,
    first: q.first,
    second: q.second,
    showVisual: true,
    tag: "meaning",
    prompt: `Rafi writes ${f} : ${s} = ${x} : ${y}. What do the two numbers stand for?`,
    answerOptions: seededShuffle(
      [
        { text: `${x} counts ${f}, and ${y} counts ${s}`, category: "correct" },
        { text: `${x} counts ${s}, and ${y} counts ${f}`, category: q.comparisonType === "p2p" ? "A" : "C" },
        { text: `There are ${x + y} ${q.wholeWord} altogether`, category: "H" },
      ],
      hashString(q.id)
    ),
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
  { id: "p2p", name: "The Colour Garden", ctx: "garden", story: "Rafi is sorting flowers and leaves. Help him compare one group with another." },
  { id: "p2w", name: "The Fruit Market", ctx: "fruit", story: "Market stalls are packing baskets. Compare one kind of fruit with the whole basket." },
  { id: "w2p", name: "The Treasure Cave", ctx: "treasure", story: "The cave is full of gems and coins. Compare all the treasure with one kind." },
];

export const zoneQuestions = (type) => {
  const pool = questionsFor(type);
  return pickRandom(pool, 4);
};

export const contextName = (ctx) => CONTEXTS[ctx].place;
export { buildQuestion };
