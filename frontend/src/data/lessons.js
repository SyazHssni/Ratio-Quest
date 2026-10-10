import { buildQuestion, questionsFor } from "./questionBank";
import { makeTotalQuestion } from "../lib/mastery";
import { pickRandom } from "../lib/random";

const concept = ({ options, feedback, correctText, ...spec }) => ({
  ...buildQuestion({ ...spec, kind: "choice" }),
  kind: "meaning",
  showVisual: true,
  answerOptions: options,
  feedback,
  correctText,
});

const total = (spec, prompt, options) => ({ ...makeTotalQuestion(buildQuestion(spec)), prompt, answerOptions: options });

export const LESSONS = {
  p2p: {
    id: "p2p",
    number: 1,
    title: "Parts to Parts",
    zone: "The Colour Garden",
    goal: "I can compare one group with another group and write the ratio in the right order.",
    story: "Rafi has 2 red balls and 3 blue balls. He wants to tell his friend how many red balls there are compared with blue balls.",
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
      concept({
        id: "l1-check-first", ctx: "balls", a: 2, b: 3, first: "a", second: "b",
        prompt: "Which number comes first when we compare red balls to blue balls?",
        options: [
          { text: "3 — the number of blue balls", category: "A" },
          { text: "2 — the number of red balls", category: "correct" },
          { text: "5 — all the balls", category: "B" },
        ],
        feedback: { B: { title: "Let's look at the groups again.", message: "5 is all the balls together. This question compares red balls with blue balls.", guide: "How many red balls are there?", highlight: { order: ["redBall", "blueBall"], focus: ["redBall"] } } },
        correctText: "Red balls come first in the question, so the number of red balls, 2, comes first.",
      }),
      concept({
        id: "l1-check-meaning", ctx: "balls", a: 2, b: 3, first: "a", second: "b",
        prompt: "Rafi writes Red : Blue = 2 : 3. What does 2 : 3 mean?",
        options: [
          { text: "2 red balls are compared with 3 blue balls", category: "correct" },
          { text: "There are 5 red balls", category: "H" },
          { text: "There are 3 red balls and 2 blue balls", category: "A" },
        ],
        correctText: "The 2 counts the red balls and the 3 counts the blue balls. The ratio compares two groups.",
      }),
    ],
    worked: { id: "l1-worked", ctx: "toys", a: 3, b: 5, first: "a", second: "b", prompt: "A toy box has 3 toy cars and 5 toy bikes. What is the ratio of toy cars to toy bikes?" },
    guided: () => [
      buildQuestion({ id: "l1-guided", ctx: "stars", a: 4, b: 2, first: "a", second: "b", prompt: "There are 4 green stars and 2 yellow stars. What is the ratio of green stars to yellow stars?", options: ["4 : 2", "2 : 4", "4 : 6"] }),
      concept({
        id: "l1-guided-follow", ctx: "stars", a: 4, b: 2, first: "a", second: "b",
        prompt: "In Green : Yellow = 4 : 2, which group does the 4 count?",
        options: [
          { text: "The yellow stars", category: "A" },
          { text: "All the stars", category: "B" },
          { text: "The green stars", category: "correct" },
        ],
        feedback: { B: { title: "Let's look at the groups again.", message: "All the stars together make 6, not 4.", guide: "Which group has 4 stars?", highlight: { order: ["greenStar", "yellowStar"] } } },
        correctText: "Green stars come first, so the 4 counts the green stars. The 2 counts the yellow stars.",
      }),
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
      concept({
        id: "l2-check-whole", ctx: "fruit", a: 3, b: 2, first: "a", second: "whole",
        prompt: "Why is the whole 5 and not 3?",
        options: [
          { text: "The whole is only the apples", category: "F" },
          { text: "3 apples + 2 bananas = 5 fruits", category: "correct" },
          { text: "The whole is the biggest group", category: "F" },
        ],
        feedback: { F: { title: "You found one part. Now let's find the whole.", message: "The whole is every item in the basket — the apples and the bananas.", guide: "3 + 2 = ?", highlight: { whole: true } } },
        correctText: "The whole includes every fruit: 3 + 2 = 5.",
      }),
    ],
    worked: { id: "l2-worked", ctx: "garden", a: 4, b: 2, first: "a", second: "whole", prompt: "A garden bed has 4 flowers and 2 leaves. What is the ratio of flowers to all the plants?" },
    guided: () => [
      total({ id: "l2-guided", ctx: "stationery", a: 4, b: 3, first: "a", second: "whole" }, "A box contains 4 pencils and 3 erasers. How many items are there altogether?", ["4", "3", "7"]),
      buildQuestion({ id: "l2-guided-ratio", ctx: "stationery", a: 4, b: 3, first: "a", second: "whole", prompt: "A box contains 4 pencils and 3 erasers. What is the ratio of pencils to all the items?", options: ["4 : 3", "4 : 7", "4 : 8"] }),
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
      concept({
        id: "l3-check", ctx: "fruit", a: 3, b: 2, first: "whole", second: "a",
        prompt: "Which ratio shows all the fruits compared with the apples?",
        options: [
          { text: "3 : 5", category: "C" },
          { text: "3 : 2", category: "B" },
          { text: "5 : 3", category: "correct" },
        ],
        correctText: "The whole (5 fruits) comes first, then the apples (3). So the ratio is 5 : 3.",
      }),
    ],
    worked: { id: "l3-worked", ctx: "party", a: 2, b: 4, first: "whole", second: "b", prompt: "A party plate has 2 cookies and 4 sweets. What is the ratio of all the treats to sweets?" },
    guided: () => [
      total({ id: "l3-guided", ctx: "counters", a: 4, b: 5, first: "whole", second: "b" }, "A bag contains 4 red counters and 5 blue counters. How many counters are there altogether?", ["5", "9", "4"]),
      buildQuestion({ id: "l3-guided-ratio", ctx: "counters", a: 4, b: 5, first: "whole", second: "b", prompt: "A bag contains 4 red counters and 5 blue counters. What is the ratio of all the counters to blue counters?", options: ["9 : 5", "5 : 9", "4 : 5"] }),
    ],
  },
};

export const LESSON_ORDER = ["p2p", "p2w", "w2p"];

export const independentQuestion = (type) =>
  pickRandom(questionsFor(type).filter((q) => q.difficulty !== "challenging" && (q.kind === "input" || q.kind === "build")), 1);

export const workedQuestion = (lesson) => buildQuestion({ ...lesson.worked });
