import { buildQuestion, questionsFor } from "./questionBank";
import { makeTotalQuestion, makeMeaningQuestion } from "../lib/mastery";
import { pickRandom, seededShuffle, hashString } from "../lib/random";
import { ratioFor, slotValue } from "../lib/ratio";
import { countedObject } from "./objects";

const total = (spec) => makeTotalQuestion(buildQuestion(spec));
const cap = (text) => text.charAt(0).toUpperCase() + text.slice(1);
const objectLabel = (q, slot) => slot === "whole" ? `all the ${q.wholeWord}` : q.groups.find((g) => g.key === slot).plural;

const numberMeaning = (spec) => {
  const q = buildQuestion(spec);
  const firstName = objectLabel(q, q.first);
  const secondName = objectLabel(q, q.second);
  const firstCount = slotValue(q.groups, q.first);
  const secondCount = slotValue(q.groups, q.second);
  const whole = slotValue(q.groups, "whole");
  const options = [
    { text: `${firstCount} counts ${firstName}`, category: "correct" },
    { text: `${secondCount} counts ${secondName}`, category: "A" },
    { text: `${whole} counts all the ${q.wholeWord}`, category: "B" },
  ];
  return {
    ...q,
    kind: "meaning",
    prompt: `In ${cap(firstName)} : ${cap(secondName)} = ${firstCount} : ${secondCount}, which group does ${firstCount} count?`,
    answerOptions: seededShuffle(options, hashString(q.id)),
    correctText: `The first number, ${firstCount}, counts ${firstName}. The second number, ${secondCount}, counts ${secondName}.`,
    hint: `The ratio is in this order: ${firstName} first, then ${secondName}. The first number counts ${firstName}.`,
  };
};

const firstNumber = (spec) => {
  const q = buildQuestion(spec);
  const firstName = objectLabel(q, q.first);
  const secondName = objectLabel(q, q.second);
  const firstCount = slotValue(q.groups, q.first);
  const secondCount = slotValue(q.groups, q.second);
  const whole = slotValue(q.groups, "whole");
  return {
    ...q,
    kind: "meaning",
    prompt: `Which number comes first when we compare ${firstName} to ${secondName}?`,
    answerOptions: seededShuffle([
      { text: `${secondCount} — the number of ${secondName}`, category: "A" },
      { text: `${firstCount} — the number of ${firstName}`, category: "correct" },
      { text: `${whole} — all the ${q.wholeWord}`, category: "B" },
    ], hashString(q.id)),
    feedback: { B: { title: "Let's look at the groups again.", message: `${whole} is the total number of ${q.wholeWord}. This question compares ${firstName} with ${secondName}.`, guide: `How many ${firstName} are there?`, highlight: { order: [q.first, q.second], focus: [q.first] } } },
    correctText: `${cap(firstName)} come first in the question, so ${firstCount} comes first.`,
    hint: `Count the ${firstName} first. Then count the ${secondName}. The first number represents ${firstName}.`,
  };
};

const wholeMeaning = (spec) => {
  const q = buildQuestion(spec);
  const total = slotValue(q.groups, "whole");
  const first = q.groups[0];
  const second = q.groups[1];
  const options = [
    { text: `The whole is only the ${first.plural}`, category: "F" },
    { text: `${countedObject(first, first.count)} + ${countedObject(second, second.count)} = ${total} ${q.wholeWord}`, category: "correct" },
    { text: "The whole is the biggest group", category: "F" },
  ];
  return {
    ...q,
    kind: "meaning",
    prompt: `Why is the number of ${q.secondQuantityLabel} ${total} and not ${countedObject(first, first.count)}?`,
    answerOptions: seededShuffle(options, hashString(q.id)),
    feedback: { F: { title: "You found one part. Now let's find the whole.", message: `The whole includes every group: ${first.plural} and ${second.plural}.`, guide: `${first.count} + ${second.count} = ?`, highlight: { whole: true } } },
    correctText: `The whole includes every group: ${first.count} + ${second.count} = ${total} ${q.wholeWord}.`,
    hint: `Add both groups: ${countedObject(first, first.count)} + ${countedObject(second, second.count)}.`,
  };
};

export const LESSONS = {
  p2p: {
    id: "p2p",
    number: 1,
    title: "Parts to Parts",
    zone: "The Colour Garden",
    goal: "I can compare one group with another group and write the ratio in the right order.",
    story: "Rafi has 2 ⚽ footballs and 3 🏀 basketballs. He wants to compare the footballs with the basketballs.",
    explain: [
      "Parts to parts means comparing one group with another group.",
      "We count the first group, then the second group. The order of the question tells us the order of the numbers.",
    ],
    examplesCtx: { ctx: "balls", a: 2, b: 3 },
    examples: [
      { first: "a", second: "b" },
      { first: "b", second: "a" },
    ],
    checks: () => [
      firstNumber({ id: "l1-check-first", ctx: "balls", a: 2, b: 3, first: "a", second: "b" }),
      { ...makeMeaningQuestion(buildQuestion({ id: "l1-check-meaning", ctx: "balls", a: 2, b: 3, first: "a", second: "b" })), id: "l1-check-meaning" },
    ],
    worked: { id: "l1-worked", ctx: "toys", a: 3, b: 5, first: "a", second: "b", prompt: "A toy box has 3 toy cars and 5 toy bikes. What is the ratio of toy cars to toy bikes?" },
    guided: () => [
      buildQuestion({ id: "l1-guided", ctx: "stars", a: 4, b: 2, first: "a", second: "b" }),
      numberMeaning({ id: "l1-guided-follow", ctx: "stars", a: 4, b: 2, first: "a", second: "b" }),
    ],
  },
  p2w: {
    id: "p2w",
    number: 2,
    title: "Parts to Whole",
    zone: "The Fruit Market",
    goal: "I can find the whole and write the ratio of one part to the whole.",
    story: "A fruit basket contains 3 apples and 2 bananas. How many fruits are there altogether? What is the ratio of apples to all fruits?",
    explain: [
      "Parts to whole means comparing one group with everything in the collection.",
      "First find the whole: 3 apples + 2 bananas = 5 fruits. The whole is 5, not 3 or 2, because it includes the apples AND the bananas.",
    ],
    examplesCtx: { ctx: "fruit", a: 3, b: 2 },
    examples: [
      { first: "a", second: "whole" },
      { first: "b", second: "whole" },
    ],
    checks: () => [
      wholeMeaning({ id: "l2-check-whole", ctx: "fruit", a: 3, b: 2, first: "a", second: "whole" }),
    ],
    worked: { id: "l2-worked", ctx: "garden", a: 4, b: 2, first: "a", second: "whole", prompt: "A garden bed has 4 flowers and 2 leaves. What is the ratio of flowers to all the plants?" },
    guided: () => [
      total({ id: "l2-guided", ctx: "stationery", a: 4, b: 3, first: "a", second: "whole" }),
      buildQuestion({ id: "l2-guided-ratio", ctx: "stationery", a: 4, b: 3, first: "a", second: "whole" }),
    ],
  },
  w2p: {
    id: "w2p",
    number: 3,
    title: "Whole to Part",
    zone: "The Treasure Cave",
    goal: "I can compare the whole collection with one part, with the whole first.",
    story: "A basket contains 3 apples and 2 bananas. Rafi wants to compare all the fruits with the number of apples.",
    explain: [
      "Whole to part means we count everything first, then compare the total with one group.",
      "Whole = 3 + 2 = 5. So Whole : Apples = 5 : 3 and Whole : Bananas = 5 : 2.",
      "The objects have not changed. The question has changed, so the ratio has changed.",
    ],
    examplesCtx: { ctx: "fruit", a: 3, b: 2 },
    examples: [
      { first: "a", second: "b" },
      { first: "a", second: "whole" },
      { first: "whole", second: "a" },
      { first: "whole", second: "b" },
    ],
    checks: () => [
      buildQuestion({ id: "l3-check", ctx: "fruit", a: 3, b: 2, first: "whole", second: "a" }),
    ],
    worked: { id: "l3-worked", ctx: "party", a: 2, b: 4, first: "whole", second: "b", prompt: "A party plate has 2 cookies and 4 sweets. What is the ratio of all the treats to sweets?" },
    guided: () => [
      total({ id: "l3-guided", ctx: "counters", a: 4, b: 5, first: "whole", second: "b" }),
      buildQuestion({ id: "l3-guided-ratio", ctx: "counters", a: 4, b: 5, first: "whole", second: "b" }),
    ],
  },
};

export const LESSON_ORDER = ["p2p", "p2w", "w2p"];

export const independentQuestion = (type) =>
  pickRandom(questionsFor(type).filter((q) => q.difficulty !== "challenging" && (q.kind === "input" || q.kind === "build")), 1);

export const workedQuestion = (lesson) => buildQuestion({ ...lesson.worked });
