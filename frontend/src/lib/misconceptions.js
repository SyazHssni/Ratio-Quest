import { ratioFor, ratioEquals, slotValue, formatRatio } from "./ratio";

export const CATEGORIES = {
  A: { code: "A", name: "Reversed order", pupil: "Checking the order", teacher: "The pupil found both counts but wrote them in the opposite order to the question." },
  B: { code: "B", name: "Part-to-part confused with part-to-whole", pupil: "Telling parts and the whole apart", teacher: "The pupil compared two parts when the question involved the whole, or used the whole when two parts were asked for." },
  C: { code: "C", name: "Whole-to-part confused with part-to-whole", pupil: "Putting the whole in the right place", teacher: "The pupil had the whole and the part but placed them in the wrong order." },
  D: { code: "D", name: "Additive reasoning", pupil: "Adding the same number to both groups", teacher: "The pupil believed adding the same amount to both quantities keeps the ratio the same." },
  E: { code: "E", name: "Incorrect total", pupil: "Counting the whole", teacher: "The pupil identified the part but miscounted the whole (including counting one group twice)." },
  F: { code: "F", name: "Incomplete counting", pupil: "Finding the second group", teacher: "The pupil found one quantity but not the other quantity asked for." },
  G: { code: "G", name: "Possible guessing", pupil: "Slowing down to count", teacher: "Two or more different wrong answers without a stable pattern. Not proof of guessing — offer a simpler, guided example." },
  H: { code: "H", name: "Ratio treated as an amount", pupil: "What each number means", teacher: "The pupil read the ratio as a single amount rather than a comparison of two quantities." },
};

const involvesWhole = (q) => q.first === "whole" || q.second === "whole";

export const correctAnswerOf = (q) => ratioFor(q.groups, q.first, q.second);

export function classifyAnswer(q, ans) {
  const correct = correctAnswerOf(q);
  if (ratioEquals(ans, correct)) return { category: "correct" };
  if (ratioEquals(ans, [correct[1], correct[0]])) return { category: involvesWhole(q) ? "C" : "A" };
  const whole = slotValue(q.groups, "whole");
  if (!involvesWhole(q)) {
    const [fi, se] = correct;
    if (ans.includes(whole) && (ans.includes(fi) || ans.includes(se))) return { category: "B", variant: "usedWhole" };
    if (ans[0] === fi) return { category: "F", missing: q.second };
    if (ans[1] === se) return { category: "F", missing: q.first };
    return { category: "unknown" };
  }
  const wholeIdx = q.first === "whole" ? 0 : 1;
  const partIdx = 1 - wholeIdx;
  const partSlot = wholeIdx === 0 ? q.second : q.first;
  const partVal = slotValue(q.groups, partSlot);
  const otherVals = q.groups.filter((g) => g.key !== partSlot).map((g) => g.count);
  const usedPartsOnly =
    (ans[partIdx] === partVal && otherVals.includes(ans[wholeIdx])) ||
    (ans[wholeIdx] === partVal && otherVals.includes(ans[partIdx]));
  if (usedPartsOnly) return { category: "B", variant: "partsOnly" };
  if (ans[partIdx] === partVal) {
    if (ans[wholeIdx] === partVal) return { category: "F", missing: "whole" };
    return { category: "E", variant: ans[wholeIdx] === whole + partVal ? "double" : "miscount" };
  }
  if (ans[wholeIdx] === whole && otherVals.includes(ans[partIdx])) return { category: "F", variant: "wrongPart", missing: partSlot };
  return { category: "unknown" };
}

const label = (q, slot) => (slot === "whole" ? `all the ${q.wholeWord}` : q.groups.find((g) => g.key === slot).plural);

export function feedbackFor(q, result) {
  const first = label(q, q.first);
  const second = label(q, q.second);
  const whole = slotValue(q.groups, "whole");
  const order = [q.first, q.second];
  const sum = q.groups.map((g) => g.count).join(" + ");
  switch (result.category) {
    case "A":
      return {
        title: "You're close. Check the order.",
        message: `You counted both groups, which is a good start! Now look at the question. It says ${first} first and ${second} second.`,
        guide: `How many ${first} are there? That number goes first.`,
        highlight: { order },
      };
    case "B":
      if (result.variant === "usedWhole")
        return {
          title: "Let's look at the groups again.",
          message: `${whole} is the total number of ${q.wholeWord}. But this question compares ${first} with ${second}, not with all the ${q.wholeWord}.`,
          guide: `How many ${second} are there?`,
          highlight: { order, focus: [q.second] },
        };
      return {
        title: "You found the parts. Now find the whole.",
        message: `You correctly counted the groups. But this question asks about ALL the ${q.wholeWord}. Count every one together to find the whole.`,
        guide: `${sum} = ? How many ${q.wholeWord} are there altogether?`,
        highlight: { whole: true, order },
      };
    case "C":
      return {
        title: "You have the right numbers. Check the order.",
        message: `The question asks for ${first} FIRST and ${second} SECOND.`,
        guide: `Which comes first in the question: the whole or one group?`,
        highlight: { whole: true, order },
      };
    case "E":
      return {
        title: "Let's count every item once.",
        message:
          result.variant === "double"
            ? `It looks like one group was counted twice. Count each item only once: start with the first group, then keep counting the second group.`
            : `Start with the first group, then keep counting the second group. Every item is counted once.`,
        guide: `${sum} = ?`,
        highlight: { whole: true, countAlong: true, order },
      };
    case "F":
      if (result.missing === "whole")
        return {
          title: "You found one part. Now let's find the whole.",
          message: `The whole is every item in the collection, not just one group.`,
          guide: `${sum} = ?`,
          highlight: { whole: true, order },
        };
      if (result.variant === "wrongPart")
        return {
          title: "You found the whole. Now check the group.",
          message: `The question compares the whole with ${label(q, result.missing)}.`,
          guide: `How many ${label(q, result.missing)} are there?`,
          highlight: { order, focus: [result.missing] },
        };
      return {
        title: "You found one group.",
        message: `Which other group does the question ask you to compare it with?`,
        guide: `Look at the ${label(q, result.missing)}. How many are there?`,
        highlight: { order, focus: [result.missing] },
      };
    case "H":
      return {
        title: "Let's look at what each number means.",
        message: "The ratio compares two groups. The first number counts the first group, and the second number counts the second group.",
        guide: "What does each number count?",
        highlight: { order },
      };
    case "D":
      return {
        title: "Let's compare the groups.",
        message: "Adding the same number to both groups changes the relationship in this example.",
        guide: "Do both groups still match in the same way?",
        highlight: { order },
      };
    default:
      return {
        title: "Let's look at the groups again.",
        message: `Count the ${first}. Then count the ${second}.`,
        guide: `How many ${first} are there?`,
        highlight: { order },
      };
  }
}

export function correctMessage(q) {
  const [x, y] = correctAnswerOf(q);
  return `Yes! ${formatRatio([x, y])}. The ${x} counts ${label(q, q.first)} and the ${y} counts ${label(q, q.second)}.`;
}

export function workedSteps(q) {
  const steps = [];
  if (involvesWhole(q)) {
    steps.push(`Find the whole: ${q.groups.map((g) => g.count).join(" + ")} = ${slotValue(q.groups, "whole")} ${q.wholeWord}.`);
  }
  steps.push(`First number: ${label(q, q.first)} = ${slotValue(q.groups, q.first)}.`);
  steps.push(`Second number: ${label(q, q.second)} = ${slotValue(q.groups, q.second)}.`);
  steps.push(`So the ratio is ${formatRatio(correctAnswerOf(q))}.`);
  return steps;
}

// Two or more wrong answers with no stable pattern suggests the pupil may need a simpler example.
export const looksUnstable = (history) => {
  const wrong = history.filter((c) => c !== "correct");
  if (wrong.length < 2) return false;
  return new Set(wrong).size === wrong.length || wrong.every((c) => c === "unknown");
};

export function classifyTotal(q, n) {
  const whole = slotValue(q.groups, "whole");
  if (n === whole) return { category: "correct" };
  if (q.groups.some((g) => g.count === n)) return { category: "F", missing: "whole" };
  return { category: "E", variant: q.groups.some((g) => g.count + whole === n) ? "double" : "miscount" };
}

export function totalFeedback(q, result) {
  const sum = q.groups.map((g) => g.count).join(" + ");
  if (result.category === "F")
    return {
      title: "That is one group.",
      message: `The whole includes every group: ${q.groups.map((g) => g.plural).join(" and ")}.`,
      guide: `${sum} = ?`,
      highlight: { whole: true },
    };
  return {
    title: "Let's count every item once.",
    message: "Count the first group, then keep counting the second group.",
    guide: `${sum} = ?`,
    highlight: { whole: true, countAlong: true },
  };
}
