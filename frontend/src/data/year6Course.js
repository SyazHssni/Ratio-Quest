// Year 6 course items are separate from the Year 5 question bank.
import { YEAR6_LIBRARY_QUESTIONS, validateYear6Library } from "./year6QuestionLibrary";
export const YEAR6_LESSONS = [
  { id: "meaning", standard: "7.2.1", title: "A ratio compares two quantities", goal: "Name the quantities and keep their order.", teach: "A ratio compares two quantities in a stated order. If a basket has 8 apples and 12 oranges, apples : oranges is 8 : 12. Reversing the order gives oranges : apples = 12 : 8. The order changes what each number counts.", model: ["Apples : oranges", "8 : 12"] },
  { id: "simplest", standard: "7.2.1", title: "What simplest form means", goal: "Represent an equivalent ratio using the smallest whole-number terms.", teach: "Eight apples and twelve oranges can be arranged into four identical groups. Each group has 2 apples and 3 oranges, so 8 : 12 = 2 : 3. Dividing both terms by 4 preserves the relationship because every group is reduced by the same number of equal groups.", model: ["8 apples ÷ 4 = 2", "12 oranges ÷ 4 = 3", "8 : 12 = 2 : 3"] },
  { id: "factors", standard: "7.2.1", title: "Find a common factor", goal: "Divide both terms by the same common factor.", teach: "For 12 : 18, both terms are divisible by 2, giving 6 : 9. Both are then divisible by 3, giving 2 : 3. Or divide both directly by 6. In simplest form the terms have no common factor greater than 1.", model: ["12 : 18", "6 : 9", "2 : 3"] },
  { id: "preserve", standard: "7.2.1", title: "Keep the relationship", goal: "Explain why a transformation is or is not equivalent.", teach: "Dividing both terms by the same common factor makes equal-sized groups. Subtracting the same number usually does not. For example, 12 apples : 18 oranges is equivalent to 2 : 3, while subtracting 6 gives 6 : 12, which is 1 : 2 and changes the relationship.", model: ["Valid: 12 : 18 → 2 : 3", "Invalid: 12 : 18 → 6 : 12"] },
  { id: "scale", standard: "7.3.1", title: "Scale both quantities together", goal: "Use the same multiplier for corresponding quantities.", teach: "A concentrate : water mixture of 2 : 3 has two scoops and three scoops in one batch. Two identical batches use 4 and 6 scoops; three use 6 and 9. Both quantities use the same multiplier, so the relationship is maintained.", model: ["2 : 3", "× 2", "4 : 6"] },
  { id: "missing", standard: "7.3.1", title: "Find one missing quantity", goal: "Work out the scale factor from the known quantity.", teach: "If syrup : water = 2 : 3 and there are 8 cups of syrup, 2 became 8 by multiplying by 4. Water must also be multiplied by 4, so there are 12 cups of water. Check: 8 : 12 simplifies to 2 : 3.", model: ["2 cups syrup → 8 (× 4)", "3 cups water → 12 (× 4)"] },
  { id: "both", standard: "7.3.1", title: "Find both quantities and check", goal: "Use a known number of equal groups to find both counts.", teach: "Each complete recipe has 3 cups of syrup and 5 cups of water. Four identical recipes have 12 cups of syrup and 20 cups of water. Both counts use ×4. Check by simplifying 12 : 20 to 3 : 5.", model: ["3 × 4 = 12 cups syrup", "5 × 4 = 20 cups water"] },
  { id: "connect", standard: "Integrated", title: "Connect simplest form and proportion", goal: "Simplify a ratio, then use it to find a corresponding quantity.", teach: "A basket has 12 apples and 18 oranges. Simplify 12 : 18 to 2 : 3. If a new basket has 8 apples, the apple count is multiplied by 4, so multiply the orange count by 4 too: 12 oranges. The new ratio 8 : 12 also simplifies to 2 : 3.", model: ["12 apples : 18 oranges = 2 : 3", "2 → 8 apples (× 4)", "3 → 12 oranges (× 4)"] },
];

const gcd = (a, b) => b ? gcd(b, a % b) : a;
const contexts = [
  { a: "red beads", b: "blue beads", icon: "🔴🔵" },
  { a: "storybooks", b: "comic books", icon: "📚📖" },
  { a: "football cones", b: "training bibs", icon: "⚽🦺" },
  { a: "mangoes", b: "guavas", icon: "🥭🍈" },
  { a: "pencils", b: "erasers", icon: "✏️🧽" },
  { a: "seedlings", b: "flower pots", icon: "🌱🪴" },
  { a: "toy cars", b: "toy trains", icon: "🚗🚂" },
  { a: "rice scoops", b: "water scoops", icon: "🍚💧" },
];
const simplifyCases = [
  [8, 12, "easy", "compute"], [15, 25, "easy", "compute"], [18, 24, "medium", "multistep"], [21, 35, "medium", "compute"], [24, 36, "challenging", "explain"], [27, 45, "challenging", "error"],
  [6, 9, "easy", "identify"], [4, 7, "easy", "already"], [16, 20, "medium", "choose"], [30, 42, "medium", "multistep"], [32, 48, "challenging", "compare"], [35, 49, "challenging", "already"],
];
const scaleCases = [
  [2, 3, 2, "easy", "firstKnown"], [3, 4, 3, "easy", "groups"], [4, 5, 3, "easy", "secondKnown"], [2, 5, 4, "medium", "firstKnown"], [3, 7, 4, "medium", "secondKnown"], [5, 6, 3, "medium", "groups"],
  [4, 7, 5, "challenging", "table"], [6, 5, 4, "challenging", "check"], [7, 8, 3, "challenging", "both"], [5, 9, 4, "challenging", "word"], [8, 3, 5, "medium", "additive"], [3, 5, 6, "easy", "additive"],
];
const choice = (correct, wrongs) => [...new Set([correct, ...wrongs])].slice(0, 4).map(String);
export const YEAR6_QUESTIONS = [
  ...simplifyCases.map(([a, b, difficulty, family], i) => {
    const c = contexts[i % contexts.length]; const g = gcd(a, b); const answer = `${a / g} : ${b / g}`;
    const distractors = [`${a} : ${b}`, `${a / g} : ${b}`, `${a} : ${b / g}`, `${Math.max(1, a / g - 1)} : ${Math.max(1, b / g - 1)}`];
    return { id: `y6-72-${String(i + 1).padStart(3, "0")}`, yearLevel: 6, learningStandard: "7.2.1", primaryObjective: "Represent a ratio in simplest form", difficulty, questionFamily: family, reasoningSkill: family, contextCategory: c.a, representationType: family === "explain" || family === "error" ? "student reasoning" : "collection", data: { a, b, context: c }, question: family === "already" ? `A display has ${a} ${c.a} and ${b} ${c.b}. Is ${a} : ${b} already in simplest form?` : `${c.icon} There are ${a} ${c.a} and ${b} ${c.b}. What is the ratio ${c.a} : ${c.b} in simplest form?`, answerType: family === "compute" || family === "multistep" ? "ratioInput" : "choice", correctAnswer: family === "already" ? (g === 1 ? "Yes" : "No") : answer, options: family === "already" ? choice(g === 1 ? "Yes" : "No", ["Yes", "No", "Cannot tell"]) : choice(answer, distractors), hint: `Find a number greater than 1 that divides both ${a} and ${b}. Divide both terms by that same factor.`, explanation: family === "already" ? (g === 1 ? "The terms have no common factor greater than 1, so this ratio is already in simplest form." : `Both terms share a factor of ${g}; divide both terms by ${g}.`) : `${a} ÷ ${g} = ${a / g} and ${b} ÷ ${g} = ${b / g}. Dividing both counts by the same factor preserves equal groups.`, misconceptionTarget: "unequal-factor-or-incomplete-simplification", feedback: { wrong: "Check that both terms are divided by the same common factor and that no common factor greater than 1 remains." }, sourceType: "original", sourceId: null, validationStatus: "validated", similarityGroup: `simplify-${family}` };
  }),
  ...scaleCases.map(([a, b, k, difficulty, family], i) => {
    const c = contexts[(i + 3) % contexts.length]; const answer = `${a * k} : ${b * k}`;
    const question = family === "additive" ? `A student changes ${a} : ${b} to ${a + 2} : ${b + 2} by adding 2 to both terms. Does this always preserve the ratio?` : family === "groups" || family === "both" ? `One group has ${a} ${c.a} and ${b} ${c.b}. How many of each are in ${k} identical groups?` : family === "secondKnown" ? `The ratio ${c.a} : ${c.b} is ${a} : ${b}. If there are ${b * k} ${c.b}, how many ${c.a} are there?` : `The ratio ${c.a} : ${c.b} is ${a} : ${b}. If there are ${a * k} ${c.a}, how many ${c.b} are there?`;
    const correct = family === "additive" ? "No" : family === "secondKnown" ? String(a * k) : family === "groups" || family === "both" ? `${a * k} and ${b * k}` : String(b * k);
    const options = family === "additive" ? choice("No", ["Yes", "Only if both are even", "Cannot tell"]) : family === "groups" || family === "both" ? choice(correct, [`${a + k} and ${b + k}`, `${a * k} and ${b}`, `${a} and ${b * k}`]) : choice(correct, [String((family === "secondKnown" ? a : b) + k), String((family === "secondKnown" ? a : b) * (k + 1)), String((family === "secondKnown" ? a : b) * k + 2)]);
    return { id: `y6-73-${String(i + 1).padStart(3, "0")}`, yearLevel: 6, learningStandard: "7.3.1", primaryObjective: "Determine proportionate quantities from a given ratio", difficulty, questionFamily: family, reasoningSkill: family, contextCategory: c.a, representationType: family === "table" ? "ratio table" : family === "word" ? "word problem" : "repeated groups", data: { a, b, multiplier: k, context: c }, question, answerType: family === "firstKnown" || family === "secondKnown" ? "numeric" : "choice", correctAnswer: correct, options, hint: family === "additive" ? "Compare the relationship after adding with the relationship before." : "Work out the factor for the known quantity. Apply the same factor to its partner.", explanation: family === "additive" ? `Adding the same amount changes a ratio in general. Equivalent ratios use a common multiplier; for example ${a} : ${b} scales to ${a * 2} : ${b * 2}.` : family === "groups" || family === "both" ? `There are ${k} equal groups: ${a} × ${k} = ${a * k} and ${b} × ${k} = ${b * k}. Both counts use the same multiplier.` : `The known quantity shows a scale factor of ${k}. Apply ×${k} to its partner too, then check by comparing the equivalent ratio.`, misconceptionTarget: "additive-or-single-quantity-scaling", feedback: { wrong: "Check whether both quantities use the same multiplier. Adding the same amount is not the same as scaling." }, sourceType: "original", sourceId: null, validationStatus: "validated", similarityGroup: `proportion-${family}` };
  }),
  ...[[12, 18, 8, "red counters", "blue counters"], [15, 25, 9, "mangoes", "guavas"], [21, 35, 12, "pencils", "erasers"], [16, 24, 10, "toy cars", "toy trains"]].map(([a, b, newA, first, second], i) => {
    const g = gcd(a, b); const simpleA = a / g; const simpleB = b / g; const multiplier = newA / simpleA; const answer = `${simpleA} : ${simpleB}; ${simpleB * multiplier} ${second}`;
    return { id: `y6-integrated-${i + 1}`, yearLevel: 6, learningStandard: "7.2.1", secondaryLearningStandard: "7.3.1", primaryObjective: "Simplify a ratio and use it to determine a proportionate quantity", difficulty: ["easy", "medium", "medium", "challenging"][i], questionFamily: "integrated-simplify-then-scale", reasoningSkill: "connect simplification and multiplicative scaling", contextCategory: `${first} and ${second}`, representationType: "two-step word problem", data: { a, b, newA, multiplier, simpleA, simpleB, second }, question: `A collection has ${a} ${first} and ${b} ${second}. Simplify the ratio ${first} : ${second}. A new collection has ${newA} ${first} and keeps the same ratio. How many ${second} are there?`, answerType: "choice", correctAnswer: answer, options: choice(answer, [`${simpleA} : ${simpleB}; ${simpleB + multiplier} ${second}`, `${a} : ${b}; ${newA} ${second}`, `${simpleA} : ${simpleB}; ${simpleB * (multiplier + 1)} ${second}`]), hint: `First divide ${a} : ${b} by their common factor. Then find how the first simplified term changes to ${newA}.`, explanation: `${a} : ${b} simplifies to ${simpleA} : ${simpleB}. The first term is scaled by ×${multiplier}, so the second is too: ${simpleB} × ${multiplier} = ${simpleB * multiplier} ${second}.`, misconceptionTarget: "confusing-simplification-with-proportional-scaling", feedback: { wrong: "Solve it in two stages: simplify the original ratio, then apply one common multiplier to both terms." }, sourceType: "original", sourceId: null, validationStatus: "validated", similarityGroup: "integrated-two-step" };
  }),
  ...YEAR6_LIBRARY_QUESTIONS,
];

// Guard the bank at import time: all records are unique, mapped, and internally consistent.
export function validateYear6Bank(bank = YEAR6_QUESTIONS) {
  const ids = new Set(); const errors = [];
  bank.forEach((q) => {
    if (ids.has(q.id)) errors.push(`${q.id}: duplicate id`); ids.add(q.id);
    if (q.yearLevel !== 6 || !["7.2.1", "7.3.1"].includes(q.learningStandard)) errors.push(`${q.id}: invalid curriculum mapping`);
    if (!q.options.includes(String(q.correctAnswer))) errors.push(`${q.id}: answer missing from options`);
    if (q.questionCategory) return;
    if (q.learningStandard === "7.2.1" && q.secondaryLearningStandard === "7.3.1") { const { a, b, newA, simpleA, simpleB, second } = q.data; const g = gcd(a, b); const expected = `${a / g} : ${b / g}; ${simpleB * (newA / simpleA)} ${second}`; if (expected !== q.correctAnswer) errors.push(`${q.id}: incorrect integrated answer`); }
    else if (q.learningStandard === "7.2.1") { const { a, b } = q.data; const g = gcd(a, b); const expected = q.questionFamily === "already" ? (g === 1 ? "Yes" : "No") : `${a / g} : ${b / g}`; if (expected !== q.correctAnswer) errors.push(`${q.id}: incorrect simplest form`); }
    if (q.learningStandard === "7.3.1" && q.questionFamily !== "additive") { const { a, b, multiplier: k } = q.data; const expected = q.questionFamily === "groups" || q.questionFamily === "both" ? `${a * k} and ${b * k}` : q.questionFamily === "secondKnown" ? String(a * k) : String(b * k); if (expected !== q.correctAnswer) errors.push(`${q.id}: incorrect proportionate answer`); }
  });
  const libraryReport = validateYear6Library(bank.filter((q) => q.questionCategory));
  errors.push(...libraryReport.errors);
  return { valid: errors.length === 0, total: bank.length, errors };
}

export const YEAR6_QUESTION_REPORT = {
  total: YEAR6_QUESTIONS.length,
  byCategory: Object.fromEntries([...new Set(YEAR6_QUESTIONS.map((q) => q.questionCategory).filter(Boolean))].map((category) => [category, YEAR6_QUESTIONS.filter((q) => q.questionCategory === category).length])),
  byStandard: Object.fromEntries(["7.2.1", "7.3.1"].map((standard) => [standard, YEAR6_QUESTIONS.filter((q) => q.learningStandard === standard).length])),
  byDifficulty: Object.fromEntries(["easy", "medium", "challenging"].map((difficulty) => [difficulty, YEAR6_QUESTIONS.filter((q) => q.difficulty === difficulty).length])),
};
