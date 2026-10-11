// Six intentionally separated curriculum strata. Each row is an independently
// parameterised item; every answer is derived from its numeric data below.
const CONTEXTS = [
  { a: "apples", b: "oranges", ea: "🍎", eb: "🍊", tones: ["red", "orange"] },
  { a: "pencils", b: "erasers", ea: "✏️", eb: "🧽", tones: ["yellow", "pink"] },
  { a: "football cones", b: "training bibs", ea: "⚽", eb: "🦺", tones: ["blue", "orange"] },
  { a: "toy cars", b: "toy trains", ea: "🚗", eb: "🚂", tones: ["red", "green"] },
  { a: "flower pots", b: "seedlings", ea: "🪴", eb: "🌱", tones: ["purple", "green"] },
  { a: "cups of syrup", b: "cups of water", ea: "🥤", eb: "💧", tones: ["pink", "blue"] },
  { a: "storybooks", b: "comic books", ea: "📚", eb: "📖", tones: ["blue", "yellow"] },
  { a: "paintbrushes", b: "paint pots", ea: "🖌️", eb: "🎨", tones: ["purple", "orange"] },
];
const CASES = [
  [6, 9, 2], [8, 12, 4], [10, 15, 5], [12, 18, 6], [14, 21, 7],
  [15, 20, 5], [18, 24, 6], [20, 30, 10], [21, 28, 7], [24, 36, 12],
  [16, 24, 8], [18, 30, 6], [22, 33, 11], [25, 35, 5], [27, 36, 9],
  [28, 42, 14], [30, 45, 15], [32, 40, 8], [35, 49, 7], [36, 54, 18],
  [40, 56, 8], [42, 63, 21], [44, 60, 4], [45, 60, 15], [48, 72, 24],
  [50, 70, 10], [54, 72, 18], [56, 84, 28], [60, 90, 30], [63, 81, 9],
  [64, 80, 16], [66, 88, 22], [70, 98, 14], [72, 96, 24], [75, 100, 25],
  [80, 120, 40], [81, 108, 27], [84, 126, 42], [90, 120, 30], [96, 144, 48],
];
const gcd = (a, b) => b ? gcd(b, a % b) : a;
const pair = (a, b) => `${a} : ${b}`;
const uniqOptions = (answer, candidates) => [...new Set([String(answer), ...candidates.map(String)])].slice(0, 4);
const seeded = (arr, seed) => {
  const copy = [...arr]; let n = seed + 1;
  for (let i = copy.length - 1; i > 0; i -= 1) { n = (n * 48271) % 2147483647; const j = n % (i + 1); [copy[i], copy[j]] = [copy[j], copy[i]]; }
  return copy;
};

const SIMPLIFY_FAMILIES = [
  "read-and-simplify-emoji-collection", "recognise-already-simplest", "identify-greatest-common-factor", "complete-equivalent-ratio-term",
  "choose-valid-simplification", "diagnose-unequal-division", "compare-original-and-simplest", "explain-equal-grouping",
  "word-context-simplification", "select-smallest-equivalent-ratio",
];
const PROPORTION_FAMILIES = [
  "scale-up-first-known", "scale-up-second-known", "identify-scale-factor", "complete-equivalent-ratio-table",
  "scale-down-exactly", "compare-proposed-equivalent-ratio", "spot-additive-reasoning", "emoji-equal-groups",
  "recipe-multiple-batches", "two-step-scale-and-check",
];
const CATEGORY_LEVELS = [
  { category: "simplifying-foundational", standard: "7.2.1", difficulty: "easy", families: SIMPLIFY_FAMILIES.slice(0, 8) },
  { category: "simplifying-intermediate", standard: "7.2.1", difficulty: "medium", families: SIMPLIFY_FAMILIES.slice(2) },
  { category: "simplifying-challenging-contextual", standard: "7.2.1", difficulty: "challenging", families: SIMPLIFY_FAMILIES.slice(0, 4).concat(SIMPLIFY_FAMILIES.slice(6)) },
  { category: "proportion-foundational", standard: "7.3.1", difficulty: "easy", families: PROPORTION_FAMILIES.slice(0, 8) },
  { category: "proportion-intermediate", standard: "7.3.1", difficulty: "medium", families: PROPORTION_FAMILIES.slice(2) },
  { category: "proportion-challenging-contextual", standard: "7.3.1", difficulty: "challenging", families: PROPORTION_FAMILIES.slice(0, 4).concat(PROPORTION_FAMILIES.slice(6)) },
];

function makeRecord(category, family, row, rowIndex, categoryIndex, familyIndex) {
  const [rawA, rawB, rawG] = row;
  const context = CONTEXTS[(rowIndex * 3 + familyIndex + categoryIndex) % CONTEXTS.length];
  const simplifying = category.standard === "7.2.1";
  const factor = rawG;
  let a = simplifying ? rawA : Math.max(2, 2 + ((rowIndex + familyIndex + categoryIndex * 2) % 7));
  let b = simplifying ? rawB : Math.max(3, 3 + ((rowIndex * 2 + familyIndex + categoryIndex * 3) % 8));
  if (!simplifying && family === "scale-down-exactly" && gcd(a, b) === 1) { a *= 2; b *= 2; }
  const scale = simplifying ? factor : 2 + ((rowIndex + familyIndex * 2 + categoryIndex) % 5);
  const simpleA = simplifying ? a / gcd(a, b) : a;
  const simpleB = simplifying ? b / gcd(a, b) : b;
  let question; let answer; let type = "choice"; let hint; let explanation; let visual = null;
  const wrongRatio = pair(simpleA + 1, simpleB + 1);

  if (simplifying) {
    const g = gcd(a, b); const sa = a / g; const sb = b / g;
    visual = { first: { key: `y6-${categoryIndex}-${rowIndex}-a`, plural: context.a, singular: context.a.replace(/s$/, ""), emoji: context.ea, tone: context.tones[0], count: a }, second: { key: `y6-${categoryIndex}-${rowIndex}-b`, plural: context.b, singular: context.b.replace(/s$/, ""), emoji: context.eb, tone: context.tones[1], count: b } };
    switch (family) {
      case "recognise-already-simplest": answer = g === 1 ? "Yes" : "No"; question = `Do ${a} ${context.a} to ${b} ${context.b} already make a ratio in simplest form?`; hint = "Check whether both terms share any whole-number factor greater than 1."; explanation = g === 1 ? `${a} and ${b} have no common factor greater than 1, so the ratio is already simplest.` : `Both terms share a factor of ${g}; divide both by ${g} to get ${pair(sa, sb)}.`; break;
      case "identify-greatest-common-factor": answer = String(g); type = "numeric"; question = `What is the greatest common factor of ${a} and ${b}, the counts of ${context.a} and ${context.b}?`; hint = `List factors of ${a} and ${b}, then choose the greatest factor they share.`; explanation = `${g} is the greatest whole number that divides both ${a} and ${b}.`; break;
      case "complete-equivalent-ratio-term": { const missingFirst = rowIndex % 2 === 0; answer = String(missingFirst ? sa : sb); type = "numeric"; question = missingFirst ? `${a} : ${b} = ? : ${sb}. Divide both terms by the same factor. What is missing?` : `${a} : ${b} = ${sa} : ?. Divide both terms by the same factor. What is missing?`; hint = `Find the common factor ${g} and divide the known and missing terms by it.`; explanation = `${a} : ${b} is divided by ${g}, so the simplest ratio is ${pair(sa, sb)}.`; break; }
      case "choose-valid-simplification": answer = pair(sa, sb); question = `Which is the simplest form of ${a} ${context.ea} : ${b} ${context.eb}?`; hint = "The same number must divide both terms, and the final terms must share no factor greater than 1."; explanation = `Divide ${a} and ${b} by their greatest common factor, ${g}: ${pair(sa, sb)}.`; break;
      case "diagnose-unequal-division": { const wrong = pair(sa, b); answer = "Divide both terms by the same factor"; question = `A pupil changes ${a} : ${b} to ${wrong}. Which correction explains the error?`; hint = "A ratio stays equivalent only when both terms are changed by the same multiplier or divisor."; explanation = `The pupil changed only one term. Divide both terms by ${g} to obtain ${pair(sa, sb)}.`; break; }
      case "compare-original-and-simplest": answer = "Yes"; question = `Are ${a} : ${b} and ${pair(sa, sb)} equivalent ratios? Choose yes or no.`; hint = `Check whether both terms in the first ratio were divided by the same number.`; explanation = `Yes. Both terms were divided by ${g}, so the ratios are equivalent.`; break;
      case "explain-equal-grouping": answer = `Make ${g} equal groups`; question = `There are ${a} ${context.a} and ${b} ${context.b}. Which grouping explains why the ratio simplifies to ${pair(sa, sb)}?`; hint = "The number of equal groups must divide each count exactly."; explanation = `Make ${g} equal groups. Each group contains ${sa} ${context.a} and ${sb} ${context.b}.`; break;
      case "word-context-simplification": question = `A class packs ${a} ${context.a} and ${b} ${context.b} into equal sets. What is the simplest ${context.a}-to-${context.b} ratio?`; answer = pair(sa, sb); hint = "Find the greatest common factor and divide each count by it."; explanation = `${a} : ${b} simplifies by dividing both terms by ${g}, giving ${pair(sa, sb)}.`; break;
      case "select-smallest-equivalent-ratio": answer = pair(sa, sb); question = `Which ratio is equivalent to ${a} : ${b} and has the smallest whole-number terms?`; hint = "Keep dividing both terms by a common factor until none greater than 1 remains."; explanation = `The greatest common factor is ${g}; ${a} ÷ ${g} : ${b} ÷ ${g} = ${pair(sa, sb)}.`; break;
      default: question = `Count the emoji groups: ${a} ${context.ea} ${context.a} and ${b} ${context.eb} ${context.b}. Write their ratio in simplest form.`; answer = pair(sa, sb); hint = "Count in the order named, then divide both terms by their greatest common factor."; explanation = `${a} : ${b}, divided by ${g}, is ${pair(sa, sb)}.`;
    }
    if (family === "recognise-already-simplest") answer = g === 1 ? "Yes" : "No";
  } else {
    const k = scale; const firstKnown = family === "scale-up-first-known" || family === "two-step-scale-and-check";
    const proposedSame = rowIndex % 2 === 0;
    switch (family) {
      case "scale-up-first-known": answer = String(b * k); type = "numeric"; question = `The ratio ${context.a} : ${context.b} is ${a} : ${b}. If ${context.a} is scaled to ${a * k}, how many ${context.b} keep the ratio?`; hint = `Find the multiplier from ${a} to ${a * k}; apply it to ${b} too.`; explanation = `The scale factor is ×${k}, so ${b} × ${k} = ${b * k} ${context.b}.`; break;
      case "scale-up-second-known": answer = String(a * k); type = "numeric"; question = `A mixture has ${a} parts ${context.a} for ${b} parts ${context.b}. If ${context.b} becomes ${b * k}, how many ${context.a} are needed?`; hint = `The second quantity is multiplied by ${k}; use that same factor for the first.`; explanation = `${b} × ${k} = ${b * k}, so multiply ${a} by ${k}: ${a * k}.`; break;
      case "identify-scale-factor": answer = String(k); type = "numeric"; question = `The ratio ${a} : ${b} becomes ${a * k} : ${b * k}. What common scale factor was used?`; hint = `Divide either new term by its matching original term.`; explanation = `${a} × ${k} = ${a * k} and ${b} × ${k} = ${b * k}; the common factor is ${k}.`; break;
      case "complete-equivalent-ratio-table": { const miss = rowIndex % 2 === 0; answer = String(miss ? b * k : a * k); type = "numeric"; question = `Complete the equivalent-ratio table: ${a} : ${b} = ${miss ? `${a * k} : ?` : `? : ${b * k}`}.`; hint = "Use the same scale factor on both rows of the ratio table."; explanation = `The scale factor is ${k}; the completed ratio is ${a * k} : ${b * k}.`; break; }
      case "scale-down-exactly": { const divisor = gcd(a, b); answer = pair(a / divisor, b / divisor); question = `A large batch uses ${a} ${context.a} and ${b} ${context.b}. Divide both quantities by ${divisor} to make a smaller equivalent batch. What is the new ratio?`; hint = "Divide both quantities by the stated divisor."; explanation = `${a} ÷ ${divisor} : ${b} ÷ ${divisor} = ${answer}.`; break; }
      case "compare-proposed-equivalent-ratio": answer = proposedSame ? "Yes" : "No"; { const pa = a * k; const pb = proposedSame ? b * k : b * k + 1; question = `Is ${pa} : ${pb} equivalent to ${a} : ${b}?`; hint = "Check whether both terms use exactly the same multiplier."; explanation = proposedSame ? `Yes. Both terms use ×${k}.` : `No. ${a} becomes ${pa} by ×${k}, but ${b} does not become ${pb} using that same factor.`; } break;
      case "spot-additive-reasoning": answer = "Use one common multiplier"; question = `A pupil says to change ${a} : ${b} into an equivalent ratio, add ${k} to each term. What method should the pupil use instead?`; hint = "Equivalent ratios grow or shrink in equal groups."; explanation = "Adding the same amount does not generally preserve a ratio. Multiply or divide both terms by one common factor."; break;
      case "emoji-equal-groups": answer = `${a * k} and ${b * k}`; question = `One group has ${a} ${context.ea} (${context.a}) and ${b} ${context.eb} (${context.b}). How many of each are in ${k} identical groups?`; hint = `Draw ${k} copies of each group, or multiply both counts by ${k}.`; explanation = `${k} groups contain ${a} × ${k} = ${a * k} ${context.a} and ${b} × ${k} = ${b * k} ${context.b}.`; break;
      case "recipe-multiple-batches": answer = `${a * k} ${context.a} and ${b * k} ${context.b}`; question = `A recipe uses ${a} ${context.a} and ${b} ${context.b}. For ${k} identical batches, how much of each is needed?`; hint = "Multiply each ingredient by the number of batches."; explanation = `${a} × ${k} = ${a * k} and ${b} × ${k} = ${b * k}; both use the same scale factor.`; break;
      case "two-step-scale-and-check": answer = String(firstKnown ? b * k : a * k); type = "numeric"; question = `A class makes ${k} identical packs, each with ${a} ${context.a} and ${b} ${context.b}. Find the total ${firstKnown ? context.b : context.a}, then check the new ratio is equivalent.`; hint = `First scale both counts by ${k}; then compare the new ratio with ${a} : ${b}.`; explanation = `${a} × ${k} = ${a * k} and ${b} × ${k} = ${b * k}; the ratio remains equivalent because both terms use ×${k}.`; break;
      default: answer = pair(a * k, b * k); question = `Scale ${a} : ${b} by ${k}.`; hint = "Multiply both terms by the same factor."; explanation = `${a} × ${k} : ${b} × ${k} = ${answer}.`;
    }
  }

  if (!visual) visual = {
    first: { key: `y6-${categoryIndex}-${rowIndex}-a`, plural: context.a, singular: context.a.replace(/s$/, ""), emoji: context.ea, tone: context.tones[0], count: a },
    second: { key: `y6-${categoryIndex}-${rowIndex}-b`, plural: context.b, singular: context.b.replace(/s$/, ""), emoji: context.eb, tone: context.tones[1], count: b },
    scaledFirst: a * scale, scaledSecond: b * scale, scaleFactor: scale,
  };

  const data = { a, b, multiplier: scale, g: gcd(a, b), context, expectedAnswer: answer, task: family, category: category.category, proposedSame: (rowIndex % 2 === 0), divisor: gcd(a, b) };
  const candidates = String(answer).includes(":")
    ? [pair(simpleA + 1, simpleB + 1), pair(a, b), pair(Math.max(1, simpleA - 1), simpleB), pair(simpleA, simpleB + 1)]
    : ["Yes", "No"].includes(String(answer))
      ? [String(answer) === "Yes" ? "No" : "Yes", "Cannot tell", "Only the first quantity changes"]
      : /^\d+$/.test(String(answer))
        ? [String(Number(answer) + 1), String(Math.max(1, Number(answer) - 1)), String(Number(answer) + 2)]
        : ["Divide only one term", "Subtract the same amount", "Reverse the order"];
  const options = uniqOptions(answer, candidates);
  const id = `y6-${category.category}-${String(rowIndex + 1).padStart(2, "0")}-${family}`;
  return {
    id, yearLevel: 6, learningStandard: category.standard, primaryObjective: simplifying ? "Represent the ratio of two quantities in simplest form" : "Determine proportionate quantities based on a given ratio",
    difficulty: category.difficulty, questionFamily: family, questionCategory: category.category, reasoningSkill: family, contextCategory: `${context.a}/${context.b}`, representationType: visual ? "emoji object groups" : "number sentence and context",
    questionType: type === "numeric" ? (["complete-equivalent-ratio-term", "complete-equivalent-ratio-table"].includes(family) ? "missing-number" : "numeric-short-answer") : family.includes("diagnose") || family.includes("spot-") ? "find-the-mistake" : family.includes("compare") || family.includes("recognise") ? "true-false" : family.includes("emoji") || family.includes("read-") ? "emoji-counting" : family.includes("table") ? "ratio-table" : family.includes("explain") ? "method-selection" : "multiple-choice", data, question, visual, answerType: type === "numeric" ? "numeric" : "choice", correctAnswer: answer, options: seeded(options, rowIndex + categoryIndex * 40 + familyIndex), hint, explanation,
    workedSolution: explanation, misconceptionTarget: simplifying ? "ratio-order-or-unequal-division" : "additive-or-unequal-scaling", feedback: { wrong: simplifying ? "Keep the quantities in the stated order and divide both terms by one common factor." : "Check that both quantities use the same multiplicative scale factor." }, sourceType: "original", validationStatus: "parameter-derived", similarityGroup: `${category.category}-${family}`,
  };
}

export const YEAR6_LIBRARY_QUESTIONS = CATEGORY_LEVELS.flatMap((category, categoryIndex) =>
  category.families.flatMap((family, familyIndex) => Array.from({ length: 5 }, (_, rowIndex) =>
    makeRecord(category, family, CASES[(rowIndex * 7 + familyIndex * 3 + categoryIndex * 5) % CASES.length], rowIndex + familyIndex * 5, categoryIndex, familyIndex)))) ;

export const validateYear6Library = (bank = YEAR6_LIBRARY_QUESTIONS) => {
  const errors = []; const ids = new Set(); const prompts = new Set();
  bank.forEach((q) => {
    if (ids.has(q.id)) errors.push(`${q.id}: duplicate id`); ids.add(q.id);
    const prompt = q.question.trim().toLowerCase(); if (prompts.has(prompt)) errors.push(`${q.id}: duplicate prompt`); prompts.add(prompt);
    if (!q.question || !q.hint || !q.explanation || !q.workedSolution) errors.push(`${q.id}: missing learning text`);
    if (!q.options.includes(String(q.correctAnswer))) errors.push(`${q.id}: correct option missing`);
    if (new Set(q.options).size !== q.options.length) errors.push(`${q.id}: duplicate answer options`);
    if (!q.options.every((option) => typeof option === "string" && option.trim())) errors.push(`${q.id}: invalid answer option`);
    if (!(["easy", "medium", "challenging"].includes(q.difficulty) && ["choice", "numeric", "ratioInput"].includes(q.answerType))) errors.push(`${q.id}: unsupported difficulty or answer format`);
    if (!q.questionType || !q.data || !q.data.context) errors.push(`${q.id}: required question metadata is missing`);
    if ((q.questionCategory.startsWith("simplifying-") && q.learningStandard !== "7.2.1") || (q.questionCategory.startsWith("proportion-") && q.learningStandard !== "7.3.1")) errors.push(`${q.id}: category and standard disagree`);
    const { a, b, multiplier, g, expectedAnswer, task, divisor, proposedSame } = q.data;
    let computed;
    if (q.learningStandard === "7.2.1") {
      const sa = a / g; const sb = b / g;
      computed = task === "recognise-already-simplest" ? (g === 1 ? "Yes" : "No")
        : task === "identify-greatest-common-factor" ? String(g)
        : task === "complete-equivalent-ratio-term" ? (q.question.includes("? :") ? String(sa) : String(sb))
        : task === "diagnose-unequal-division" ? "Divide both terms by the same factor"
        : task === "compare-original-and-simplest" ? "Yes"
        : task === "explain-equal-grouping" ? `Make ${g} equal groups` : pair(sa, sb);
    } else {
      computed = task === "scale-up-first-known" || task === "two-step-scale-and-check" ? String(b * multiplier)
        : task === "scale-up-second-known" ? String(a * multiplier)
        : task === "identify-scale-factor" ? String(multiplier)
        : task === "complete-equivalent-ratio-table" ? (q.question.includes("? :") ? String(a * multiplier) : String(b * multiplier))
        : task === "scale-down-exactly" ? pair(a / divisor, b / divisor)
        : task === "compare-proposed-equivalent-ratio" ? (proposedSame ? "Yes" : "No")
        : task === "spot-additive-reasoning" ? "Use one common multiplier"
        : task === "emoji-equal-groups" ? `${a * multiplier} and ${b * multiplier}`
        : task === "recipe-multiple-batches" ? `${a * multiplier} ${q.data.context.a} and ${b * multiplier} ${q.data.context.b}` : expectedAnswer;
    }
    if (String(computed) !== String(q.correctAnswer) || String(expectedAnswer) !== String(q.correctAnswer)) errors.push(`${q.id}: answer key does not match parameter calculation`);
    if (q.visual && (q.visual.first.count !== a || q.visual.second.count !== b)) errors.push(`${q.id}: emoji counts disagree with ratio data`);
    if (q.visual?.scaledFirst && (q.visual.scaledFirst !== a * multiplier || q.visual.scaledSecond !== b * multiplier)) errors.push(`${q.id}: scaled emoji counts disagree with the common multiplier`);
    if (task === "scale-down-exactly" && (divisor <= 1 || a % divisor !== 0 || b % divisor !== 0)) errors.push(`${q.id}: scale-down is not exact for both quantities`);
    if (q.learningStandard === "7.2.1" && ["read-and-simplify-emoji-collection", "choose-valid-simplification", "word-context-simplification", "select-smallest-equivalent-ratio"].includes(task) && g !== gcd(a, b)) errors.push(`${q.id}: simplification is not in simplest form`);
  });
  return { valid: errors.length === 0, total: bank.length, errors };
};

