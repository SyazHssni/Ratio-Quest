import { CONTEXTS, ITEMS, EMOJI_LIBRARY, makeGroups, labelFor, countedObject } from "./objects";
import { ratioFor, formatRatio, ratioEquals, normaliseRatioAnswer, isValidCount, comparisonTypeOf } from "../lib/ratio";
import { classifyAnswer } from "../lib/misconceptions";
import { hashString, seededShuffle } from "../lib/random";
import { QUESTION_SOURCES } from "./questionSources";

// [id, context, countA, countB, first, second, kind, difficulty, statedAnswer, setId]
const ROWS = [
  ["p2p-01", "pool", 2, 3, "a", "b", "choice", "easy", "2:3"],
  ["p2p-02", "balls", 2, 3, "b", "a", "choice", "easy", "3:2"],
  ["p2p-03", "stars", 4, 2, "a", "b", "choice", "easy", "4:2"],
  ["p2p-04", "toys", 5, 1, "b", "a", "choice", "easy", "1:5"],
  ["p2p-05", "stationery", 6, 4, "a", "b", "input", "easy", "6:4"],
  ["p2p-06", "garden", 3, 7, "b", "a", "input", "medium", "7:3"],
  ["p2p-07", "bowl", 8, 5, "a", "b", "build", "easy", "8:5"],
  ["p2p-08", "party", 2, 9, "b", "a", "build", "medium", "9:2"],
  ["p2p-09", "pool", 7, 3, "a", "b", "choice", "medium", "7:3"],
  ["p2p-10", "bowl", 4, 6, "b", "a", "choice", "medium", "6:4"],
  ["p2p-11", "stationery", 5, 2, "a", "b", "mistake", "medium", "5:2"],
  ["p2p-12", "stars", 3, 8, "b", "a", "mistake", "challenging", "8:3"],
  ["p2p-13", "apples", 6, 1, "a", "b", "input", "medium", "6:1"],
  ["p2p-14", "stars", 9, 4, "b", "a", "input", "challenging", "4:9"],
  ["p2p-15", "counters", 1, 7, "a", "b", "build", "medium", "1:7"],
  ["p2p-16", "fruit", 3, 6, "a", "b", "choice", "easy", "3:6"],
  ["p2p-17", "pool", 5, 9, "a", "b", "choice", "challenging", "5:9"],
  ["p2p-18", "toys", 2, 6, "b", "a", "mistake", "challenging", "6:2"],
  ["p2p-19", "bowl", 8, 3, "a", "b", "input", "challenging", "8:3"],
  ["p2p-20", "treasure", 4, 7, "a", "b", "choice", "challenging", "4:7", "S1"],
  ["p2w-01", "fruit", 3, 2, "a", "whole", "choice", "easy", "3:5"],
  ["p2w-02", "fruit", 3, 2, "b", "whole", "choice", "easy", "2:5"],
  ["p2w-03", "stationery", 4, 3, "a", "whole", "choice", "easy", "4:7"],
  ["p2w-04", "garden", 2, 3, "a", "whole", "choice", "easy", "2:5"],
  ["p2w-05", "balls", 2, 3, "b", "whole", "input", "easy", "3:5"],
  ["p2w-06", "pool", 5, 4, "b", "whole", "input", "medium", "4:9"],
  ["p2w-07", "apples", 6, 2, "a", "whole", "build", "medium", "6:8"],
  ["p2w-08", "party", 3, 5, "b", "whole", "build", "medium", "5:8"],
  ["p2w-09", "toys", 1, 6, "a", "whole", "choice", "medium", "1:7"],
  ["p2w-10", "pool", 4, 5, "b", "whole", "choice", "medium", "5:9"],
  ["p2w-11", "stars", 3, 7, "a", "whole", "mistake", "medium", "3:10"],
  ["p2w-12", "bowl", 5, 6, "b", "whole", "mistake", "challenging", "6:11"],
  ["p2w-13", "apples", 7, 2, "a", "whole", "input", "medium", "7:9"],
  ["p2w-14", "apples", 2, 9, "b", "whole", "input", "challenging", "9:11"],
  ["p2w-15", "treasure", 8, 1, "a", "whole", "build", "challenging", "8:9"],
  ["p2w-16", "stationery", 6, 6, "b", "whole", "choice", "challenging", "6:12"],
  ["p2w-17", "garden", 4, 8, "b", "whole", "choice", "challenging", "8:12"],
  ["p2w-18", "bowl", 5, 3, "a", "whole", "mistake", "challenging", "5:8"],
  ["p2w-19", "party", 9, 2, "a", "whole", "input", "challenging", "9:11"],
  ["p2w-20", "treasure", 4, 7, "b", "whole", "choice", "challenging", "7:11", "S1"],
  ["w2p-01", "fruit", 3, 2, "whole", "a", "choice", "easy", "5:3"],
  ["w2p-02", "fruit", 3, 2, "whole", "b", "choice", "easy", "5:2"],
  ["w2p-03", "garden", 4, 5, "whole", "b", "choice", "easy", "9:5"],
  ["w2p-04", "balls", 2, 3, "whole", "a", "choice", "easy", "5:2"],
  ["w2p-05", "toys", 2, 3, "whole", "b", "input", "easy", "5:3"],
  ["w2p-06", "stars", 6, 3, "whole", "a", "input", "medium", "9:6"],
  ["w2p-07", "bowl", 2, 5, "whole", "b", "build", "medium", "7:5"],
  ["w2p-08", "pool", 7, 1, "whole", "a", "build", "medium", "8:7"],
  ["w2p-09", "garden", 3, 4, "whole", "a", "choice", "medium", "7:3"],
  ["w2p-10", "party", 5, 5, "whole", "b", "choice", "medium", "10:5"],
  ["w2p-11", "stationery", 2, 6, "whole", "a", "mistake", "medium", "8:2"],
  ["w2p-12", "bowl", 3, 9, "whole", "b", "mistake", "challenging", "12:9"],
  ["w2p-13", "apples", 4, 3, "whole", "b", "input", "medium", "7:3"],
  ["w2p-14", "party", 7, 6, "whole", "a", "input", "challenging", "13:7"],
  ["w2p-15", "treasure", 1, 8, "whole", "a", "build", "challenging", "9:1"],
  ["w2p-16", "stars", 2, 7, "whole", "b", "choice", "challenging", "9:7"],
  ["w2p-17", "toys", 6, 4, "whole", "a", "choice", "challenging", "10:6"],
  ["w2p-18", "garden", 8, 2, "whole", "b", "mistake", "challenging", "10:2"],
  ["w2p-19", "pool", 5, 3, "whole", "b", "input", "challenging", "8:3"],
  ["w2p-20", "treasure", 4, 7, "whole", "a", "choice", "challenging", "11:4", "S1"],
];

const NAMES = ["Mia", "Arjun", "Zara", "Leo", "Aisha", "Tom", "Priya", "Sam"];
const VARIED_ROWS = [
  // Easy: interpret a representation and identify what each quantity means.
  ["v-e-p2p-01", "balls", 2, 3, "a", "b", "easy", "read"],
  ["v-e-p2p-02", "toys", 3, 5, "b", "a", "easy", "meaning"],
  ["v-e-p2p-03", "stationery", 4, 2, "a", "b", "easy", "compare"],
  ["v-e-p2w-01", "fruit", 3, 2, "a", "whole", "easy", "read"],
  ["v-e-p2w-02", "balls", 1, 4, "b", "whole", "easy", "meaning"],
  ["v-e-p2w-03", "toys", 4, 2, "a", "whole", "easy", "compare"],
  ["v-e-p2w-04", "pool", 3, 2, "b", "whole", "easy", "read"],
  ["v-e-p2w-05", "party", 3, 3, "a", "whole", "easy", "meaning"],
  ["v-e-w2p-01", "apples", 2, 3, "whole", "a", "easy", "meaning"],
  ["v-e-w2p-02", "treasure", 4, 1, "whole", "b", "easy", "read"],
  ["v-e-w2p-03", "party", 2, 5, "whole", "a", "easy", "compare"],
  ["v-e-w2p-04", "stars", 3, 2, "whole", "b", "easy", "meaning"],
  ["v-e-w2p-05", "party", 3, 3, "whole", "a", "easy", "meaning"],
  // Medium: examine claims, read tables, and separate the relevant quantities.
  ["v-m-p2p-01", "balls", 4, 7, "b", "a", "medium", "diagnose"],
  ["v-m-p2p-02", "toys", 2, 5, "a", "b", "medium", "table"],
  ["v-m-p2p-03", "stationery", 5, 3, "b", "a", "medium", "irrelevant"],
  ["v-m-p2w-01", "fruit", 3, 5, "a", "whole", "medium", "diagnose"],
  ["v-m-p2w-02", "garden", 4, 3, "b", "whole", "medium", "table"],
  ["v-m-p2w-03", "stars", 2, 6, "a", "whole", "medium", "compare"],
  ["v-m-w2p-01", "balls", 6, 2, "whole", "b", "medium", "diagnose"],
  ["v-m-w2p-02", "treasure", 3, 5, "whole", "a", "medium", "table"],
  ["v-m-w2p-03", "party", 4, 4, "whole", "b", "medium", "irrelevant"],
  // Challenging: infer a missing part, handle extra facts, and compare explanations.
  ["v-c-p2p-01", "garden", 4, 5, "b", "a", "challenging", "missing"],
  ["v-c-p2p-02", "stationery", 7, 3, "a", "b", "challenging", "irrelevant"],
  ["v-c-p2p-03", "toys", 5, 8, "b", "a", "challenging", "claims"],
  ["v-c-p2w-01", "fruit", 4, 5, "b", "whole", "challenging", "missing"],
  ["v-c-p2w-02", "garden", 6, 3, "a", "whole", "challenging", "table"],
  ["v-c-p2p-04", "bowl", 4, 7, "a", "b", "challenging", "compare"],
  ["v-c-w2p-01", "balls", 5, 4, "whole", "a", "challenging", "missing"],
  ["v-c-w2p-02", "treasure", 8, 3, "whole", "b", "challenging", "irrelevant"],
];

const VARIED_OBJECTIVES = {
  read: ["Interpret a displayed ratio", "Match the stated comparison to its two quantities"],
  meaning: ["Explain what the first and second terms count", "Interpret ratio order in words"],
  compare: ["Distinguish two valid comparisons of one collection", "Select the statement that matches the requested quantities"],
  diagnose: ["Identify a pupil's order or whole error", "Explain why a part-to-part answer does not answer a part-to-whole question"],
  table: ["Read quantities from a compact table", "Translate a table entry into the requested ordered ratio"],
  irrelevant: ["Select only the quantities named in the question", "Ignore an unrelated category without including it in the ratio"],
  missing: ["Find a missing part from the stated total, then represent the comparison", "Use subtraction to complete a collection before writing the ratio"],
  claims: ["Compare two pupils' interpretations", "Choose the explanation consistent with the same collection"],
};

const labelForSlot = (q, slot) => slot === "whole" ? `all the ${q.wholeWord}` : q.groups.find((g) => g.key === slot).plural;

function explanationOptions(q) {
  const [x, y] = q.correctAnswer;
  const f = q.firstQuantityLabel;
  const s = q.secondQuantityLabel;
  const whole = q.groups.reduce((n, g) => n + g.count, 0);
  const partsOnly = q.comparisonType === "p2p"
    ? `This uses the whole, all the ${q.wholeWord}, instead of comparing ${f} with ${s}.`
    : `This compares the two parts, ${q.groups[0].plural} and ${q.groups[1].plural}, instead of the part and whole asked for.`;
  return [
    { text: `The ratio is ${formatRatio([x, y])}: ${x} counts ${f}, and ${y} counts ${s}.`, category: "correct" },
    { text: `The order is reversed: ${y} counts ${f}, and ${x} counts ${s}.`, category: q.comparisonType === "p2p" ? "A" : "C" },
    { text: partsOnly, category: "B" },
    { text: `The ratio ${formatRatio([x, y])} is the total number of ${q.wholeWord} (${whole}).`, category: "H" },
  ];
}

function variedPrompt(q, style, id) {
  const [A, B] = q.groups;
  const f = q.firstQuantityLabel;
  const s = q.secondQuantityLabel;
  const story = `${countedObject(A, A.count)} and ${countedObject(B, B.count)} are in ${q.place}.`;
  const total = A.count + B.count;
  if (style === "table") return `Record: Group 1 — ${A.plural}, ${A.count}; Group 2 — ${B.plural}, ${B.count}. Build the ratio of ${f} to ${s}.`;
  if (style === "missing") {
    return `A collection has ${total} ${q.wholeWord}. It contains ${countedObject(A, A.count)}; the rest are ${B.plural}. Work out the missing count, then write the ratio of ${f} to ${s}.`;
  }
  if (style === "irrelevant") return `A note lists ${story} It also mentions 2 books, which are not part of this comparison. Which explanation matches ${f} to ${s}?`;
  if (style === "diagnose") return `Rafi says ${f} to ${s} is ${formatRatio([q.correctAnswer[1], q.correctAnswer[0]])}. Which response checks his statement correctly?`;
  if (style === "claims") return `Mia says the first number counts ${f}. Arjun says it counts ${s}. Which pupil's explanation matches the ratio of ${f} to ${s}?`;
  if (style === "compare") return `The collection is shown in ${q.place}. The ratio ${formatRatio(q.correctAnswer)} compares ${f} with ${s}. Which sentence says exactly what each number counts?`;
  if (style === "meaning") return `Rafi writes ${f} : ${s} = ${formatRatio(q.correctAnswer)}. What does each number in this ratio count?`;
  if (style === "read") return `Look at the collection: ${story} Which ratio represents ${f} to ${s}?`;
  return `Look at the collection: ${story} Which explanation correctly describes ${f} to ${s}?`;
}

function buildVariedQuestion(row) {
  const [id, ctx, a, b, first, second, difficulty, style] = row;
  const responseKind = style === "read" ? "choice" : style === "table" ? "build" : style === "missing" ? "input" : "meaning";
  const base = buildQuestion({ id, ctx, a, b, first, second, kind: responseKind, difficulty });
  const B = base.groups[1];
  const objectiveList = VARIED_OBJECTIVES[style] || VARIED_OBJECTIVES.read;
  const objective = objectiveList[hashString(id) % objectiveList.length];
  const q = {
    ...base,
    prompt: variedPrompt(base, style, id),
    answerOptions: responseKind === "meaning"
      ? seededShuffle(explanationOptions(base), hashString(id))
      : responseKind === "choice"
      ? seededShuffle([base.correctAnswer, ...distractorsFor(base).slice(0, 2)].map(formatRatio), hashString(id))
      : undefined,
    hint: style === "missing"
      ? `Use the total and the known group to find the missing count. Then keep ${base.firstQuantityLabel} first and ${base.secondQuantityLabel} second.`
      : `Read the requested order: ${base.firstQuantityLabel} first, then ${base.secondQuantityLabel}. Check whether the whole or only one part is being counted.`,
    correctText: `The answer is ${formatRatio(base.correctAnswer)}. The first number counts ${base.firstQuantityLabel}; the second counts ${base.secondQuantityLabel}.${style === "missing" ? ` The total is ${a + b}, so the missing part is found by subtracting the known part.` : ""}`,
    objective,
    questionFormat: responseKind === "meaning" ? "select-explanation" : responseKind === "choice" ? "select-ratio" : responseKind === "build" ? "construct-ratio" : "enter-ratio",
    reasoningSkill: style,
    misconceptionTarget: style === "diagnose" ? "reversed-order-or-whole-confusion" : style === "missing" ? "whole-and-missing-part" : "ratio-meaning",
    representationType: ["table", "irrelevant", "missing"].includes(style) ? "word-problem" : "emoji-collection",
    sourceType: "original",
    sourceId: "dskp-year5-mathematics-7-2-1",
    examStyle: difficulty === "challenging",
    styleReferenceId: difficulty === "challenging" ? "uk-ks2-mathematics-2026-paper-2" : null,
    estimatedTimeSeconds: difficulty === "easy" ? 35 : difficulty === "medium" ? 55 : 80,
    solutionSteps: [
      ...(style === "missing"
        ? [`Find the missing ${B.plural}: ${a + b} - ${a} = ${b}.`]
        : base.comparisonType === "p2p" ? [] : [`Whole: ${a} + ${b} = ${a + b} ${base.wholeWord}.`]),
      `First quantity, ${base.firstQuantityLabel}: ${base.correctAnswer[0]}.`,
      `Second quantity, ${base.secondQuantityLabel}: ${base.correctAnswer[1]}.`,
      `Therefore the ratio is ${formatRatio(base.correctAnswer)}.`,
    ],
    answerExplanation: `The correct ratio is ${formatRatio(base.correctAnswer)}: the first term counts ${base.firstQuantityLabel}, and the second term counts ${base.secondQuantityLabel}.`,
    showVisual: !["table", "irrelevant", "missing"].includes(style),
    promptStyle: style,
  };
  return q;
}

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const slotKey = (ctx, pos) => (pos === "whole" ? "whole" : CONTEXTS[ctx].items[pos === "a" ? 0 : 1]);

function buildPrompt({ ctx, groups, first, second, difficulty, kind, id, rafi }) {
  const c = CONTEXTS[ctx];
  const f = labelFor(groups, first, c.whole);
  const s = labelFor(groups, second, c.whole);
  const [A, B] = groups;
  const story = `${cap(c.place)} has ${countedObject(A, A.count)} and ${countedObject(B, B.count)}.`;
  if (kind === "mistake") return `${story} Rafi says the ratio of ${f} to ${s} is ${rafi}. Can you help Rafi fix the answer?`;
  if (difficulty === "easy") return `Look at ${c.place}. What is the ratio of ${f} to ${s}?`;
  if (difficulty === "medium") {
    if (first === "whole") return `${story} Compare the total number of ${c.whole} with the ${s}. What is the ratio of ${f} to ${s}?`;
    return `${story} What is the ratio of ${f} to ${s}?`;
  }
  const name = NAMES[hashString(id) % NAMES.length];
  return `${name} looks in ${c.place}. There are ${countedObject(A, A.count)} and ${countedObject(B, B.count)}. Write the ratio of ${f} to ${s}.`;
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
  const groups = spec.groups || makeGroups(ctx, a, b);
  const first = spec.groups ? fp : slotKey(ctx, fp);
  const second = spec.groups ? sp : slotKey(ctx, sp);
  const wholeWord = spec.wholeWord || CONTEXTS[ctx]?.whole || "items";
  const q = {
    id,
    ctx,
    lessonId: comparisonTypeOf(first, second),
    comparisonType: comparisonTypeOf(first, second),
    kind,
    difficulty,
    groups,
    wholeWord,
    place: spec.place || CONTEXTS[ctx]?.place || "the collection",
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
    objective: spec.objective || "Represent the requested comparison in the stated order",
    questionFormat: spec.questionFormat || (kind === "input" ? "enter-ratio" : kind === "build" ? "construct-ratio" : kind === "mistake" ? "correct-a-mistake" : "select-ratio"),
    reasoningSkill: spec.reasoningSkill || (first === "whole" || second === "whole" ? "identify-whole-and-order" : "count-and-track-order"),
    misconceptionTarget: spec.misconceptionTarget || (kind === "mistake" ? "diagnose-a-ratio-error" : null),
    representationType: spec.representationType || "emoji-collection",
    sourceType: spec.sourceType || "original",
    sourceId: spec.sourceId || "dskp-year5-mathematics-7-2-1",
    examStyle: spec.examStyle ?? false,
    styleReferenceId: spec.styleReferenceId || (spec.examStyle ? "uk-ks2-mathematics-2026-paper-2" : null),
    estimatedTimeSeconds: spec.estimatedTimeSeconds || (difficulty === "easy" ? 30 : difficulty === "medium" ? 45 : 60),
    solutionSteps: spec.solutionSteps || [
      ...(comparisonTypeOf(first, second) === "p2p" ? [] : [
        `Find the whole: ${groups.map((g) => g.count).join(" + ")} = ${groups.reduce((t, g) => t + g.count, 0)} ${wholeWord}.`,
      ]),
      `First quantity, ${labelFor(groups, first, wholeWord)}: ${ratioFor(groups, first, second)[0]}.`,
      `Second quantity, ${labelFor(groups, second, wholeWord)}: ${ratioFor(groups, first, second)[1]}.`,
      `Write the ratio in that order: ${formatRatio(ratioFor(groups, first, second))}.`,
    ],
    answerExplanation: spec.answerExplanation || `The first number counts ${labelFor(groups, first, wholeWord)}; the second number counts ${labelFor(groups, second, wholeWord)}. Keep the quantities in the order named.`,
    quantityUnit: "objects",
    taskType: spec.taskType || `represent-${kind}`,
    contextCategory: spec.contextCategory || groups.map((g) => g.category).filter(Boolean).join("+") || "mixed",
    objectTypes: groups.map((g) => g.key),
    data: groups.map(({ key, count }) => ({ key, count })),
    answerType: kind === "input" ? "ratio-text" : kind === "build" ? "ratio-build" : kind === "meaning" ? "explanation-choice" : "ratio-choice",
    questionStructure: spec.questionStructure || "two-group-count-and-represent",
    validationStatus: "validated",
    similarityGroup: spec.similarityGroup || null,
  };
  const ds = distractorsFor(q);
  if (kind === "mistake") q.rafiAnswer = formatRatio(ds.find((d) => classifyAnswer(q, d).category === "B") || ds.find((d) => ["A", "C"].includes(classifyAnswer(q, d).category)) || ds[0]);
  q.prompt = spec.prompt || (CONTEXTS[ctx] ? buildPrompt({ ...q, rafi: q.rafiAnswer }) : "");
  const optionPool = kind === "mistake" ? ds.filter((d) => formatRatio(d) !== q.rafiAnswer) : ds;
  q.answerOptions =
    spec.options ||
    seededShuffle([q.correctAnswer, ...optionPool.slice(0, 2)].map(formatRatio), hashString(id));
  q.hint = q.comparisonType === "p2p"
    ? `Count the ${q.firstQuantityLabel} first. Then count the ${q.secondQuantityLabel}.`
    : `Find the whole first: ${groups.map((g) => g.count).join(" + ")} = ? Then compare ${q.firstQuantityLabel} first with ${q.secondQuantityLabel} second.`;
  return q;
}

const EXPANSION_FAMILIES = [
  { name: "inventory", lead: "An inventory at {place} lists {items}.", request: "Which ratio answers {f} to {s}?" },
  { name: "three-category", lead: "A collection at {place} contains {items}.", request: "Write the ratio of {f} to {s}." },
  { name: "student-claim", lead: "The record shows {items}. Hana says {f} to {s} is {wrong}.", request: "Is Hana correct? Choose the best explanation." },
  { name: "report-check", lead: "A report about {place} gives {f} : {s} as {wrong}.", request: "Which response checks the report?" },
  { name: "table-reading", lead: "A table records {items} at {place}.", request: "Use the table to find {f} to {s}." },
  { name: "whole-check", lead: "There are {items} at {place}.", request: "A pupil uses only two categories to find {f} to {s}. Which explanation is correct?" },
  { name: "two-statements", lead: "For {place}, one statement compares {f} with {s}; another reverses that order.", request: "Choose the statement with the requested order, {f} to {s}." },
  { name: "meaning-first", lead: "A display at {place} contains {items}.", request: "In the ratio of {f} to {s}, what does the first number count?" },
  { name: "meaning-second", lead: "A display at {place} contains {items}.", request: "In the ratio of {f} to {s}, what does the second number count?" },
  { name: "same-collection", lead: "The same display at {place} contains {items}.", request: "Why can {f} to {s} and {s} to {f} have different ratios?" },
  { name: "identify-whole", lead: "A class record at {place} lists {items}.", request: "What is the whole, and what is {f} to all items?" },
  { name: "error-type", lead: "The counts at {place} are {items}. A pupil writes {wrong} for {f} to {s}.", request: "What is the main error?" },
  { name: "choose-valid", lead: "A note at {place} records {items}.", request: "Which statement correctly describes {f} to {s}?" },
  { name: "worked-step", lead: "A solution uses the counts {items} at {place}.", request: "Which is the first correct step for finding {f} to {s}?" },
  { name: "compare-meanings", lead: "A collection at {place} contains {items}.", request: "What is different about {f} to {s} and {s} to {f}?" },
  { name: "select-total", lead: "A stock list at {place} shows {items}.", request: "Which number is the total, and which ratio compares {f} with the whole?" },
  { name: "irrelevant-row", lead: "A record at {place} lists {items}. It also lists 4 chairs that are outside this collection.", request: "Which ratio uses only the collection and answers {f} to {s}?" },
  { name: "counting-error", lead: "A pupil reads {items} from a display at {place}.", request: "The pupil says the whole is {wrong}. What should the pupil do?" },
  { name: "match-description", lead: "A display at {place} contains {items}.", request: "Which description matches the ratio {f} to {s}?" },
  { name: "order-check", lead: "A class list at {place} records {items}.", request: "Which ratio keeps the requested order, {f} first and {s} second?" },
  { name: "explain-total", lead: "The categories at {place} are {items}.", request: "Which explanation correctly finds the total before forming {f} to {s}?" },
];

const COLLECTION_CONTEXTS = ["the school exhibition", "a classroom inventory", "the community fair", "a museum display", "the school collection"];

const USED_EXPANSION_GROUPS = new Set();
function expansionGroups(index) {
  const categoryCount = new Set(EMOJI_LIBRARY.map((item) => item.category)).size;
  const catalogue = EMOJI_LIBRARY;
  let start = (index * 7 + Math.floor(index / categoryCount)) % catalogue.length;
  let selected = [];
  let counts = [];
  for (let attempt = 0; attempt < catalogue.length; attempt += 1) {
    selected = [0, 1, 2].map((offset) => catalogue[(start + offset * 17) % catalogue.length]);
    counts = selected.map((_, itemIndex) => 1 + ((index * 5 + itemIndex * 3 + selected[itemIndex].category.length) % 8));
    const signature = selected.map((item, itemIndex) => `${item.emoji}:${item.plural}:${counts[itemIndex]}`).join("+");
    if (new Set(selected.map((item) => `${item.emoji}:${item.plural}`)).size === 3 && !USED_EXPANSION_GROUPS.has(signature)) {
      USED_EXPANSION_GROUPS.add(signature);
      break;
    }
    start = (start + 1) % catalogue.length;
  }
  const groups = selected.map((item, groupIndex) => ({ ...ITEMS[item.key], key: item.key, count: counts[groupIndex] }));
  const categories = [...new Set(groups.map((g) => g.category))];
  const place = COLLECTION_CONTEXTS[index % COLLECTION_CONTEXTS.length];
  return { groups, category: categories.join("+"), wholeWord: "items", place };
}

function buildExpansionQuestion(difficulty, index, levelIndex) {
  const family = EXPANSION_FAMILIES[index % EXPANSION_FAMILIES.length];
  const { groups: allGroups, wholeWord, place } = expansionGroups(index + levelIndex * 70);
  const type = ["p2p", "p2w", "w2p"][(index + levelIndex) % 3];
  const firstGroup = allGroups[(index + 1) % allGroups.length];
  const secondGroup = allGroups[(index + 2) % allGroups.length];
  const groups = difficulty === "easy" ? [firstGroup, secondGroup] : allGroups;
  const category = [...new Set(groups.map((g) => g.category))].join("+");
  if (["student-claim", "report-check", "error-type"].includes(family.name) && type === "p2p" && firstGroup.count === secondGroup.count) {
    secondGroup.count = secondGroup.count === 6 ? 5 : secondGroup.count + 1;
  }
  const first = type === "w2p" ? "whole" : firstGroup.key;
  const second = type === "p2w" ? "whole" : type === "w2p" ? secondGroup.key : secondGroup.key;
  const modeByFamily = { inventory: "input", "three-category": "build", "student-claim": "meaning", "report-check": "meaning", "table-reading": "input", "whole-check": "meaning", "two-statements": "meaning", "meaning-first": "meaning", "meaning-second": "meaning", "same-collection": "meaning", "identify-whole": "meaning", "error-type": "meaning", "choose-valid": "choice", "worked-step": "meaning", "compare-meanings": "meaning", "select-total": "meaning", "irrelevant-row": "choice", "counting-error": "meaning", "match-description": "choice", "order-check": "choice", "explain-total": "meaning" };
  const kind = modeByFamily[family.name];
  const id = `exp-${difficulty}-${String(index + 1).padStart(3, "0")}`;
  const base = buildQuestion({ id, groups, ctx: "custom", a: 0, b: 0, first, second, kind, difficulty, wholeWord, place, contextCategory: category, taskType: family.name, questionStructure: `${family.name}-${kind}`, similarityGroup: `${difficulty}-${family.name}` });
  const values = groups.map((g) => `${g.count} ${g.emoji} ${g.count === 1 ? g.singular : g.plural}`).join(", ").replace(/, ([^,]*)$/, " and $1");
  const wrong = formatRatio([base.correctAnswer[1], base.correctAnswer[0]]);
  const lead = family.lead.replace("{place}", place).replace("{items}", values)
    .replaceAll("{f}", base.firstQuantityLabel).replaceAll("{s}", base.secondQuantityLabel).replaceAll("{wrong}", wrong);
  const dataText = family.lead.includes("{items}") ? "" : ` Record: ${values}.`;
  const request = kind === "choice"
    ? `Which ratio represents ${base.firstQuantityLabel} to ${base.secondQuantityLabel}?`
    : kind === "input" || kind === "build"
    ? `Write the ratio of ${base.firstQuantityLabel} to ${base.secondQuantityLabel}.`
    : family.name === "meaning-first"
    ? `Which explanation tells what the first number in ${base.firstQuantityLabel} to ${base.secondQuantityLabel} counts?`
    : family.name === "meaning-second"
    ? `Which explanation tells what the second number in ${base.firstQuantityLabel} to ${base.secondQuantityLabel} counts?`
    : ["identify-whole", "select-total", "explain-total"].includes(family.name)
    ? `Which explanation identifies the total and correctly represents ${base.firstQuantityLabel} to ${base.secondQuantityLabel}?`
    : `Which explanation correctly represents ${base.firstQuantityLabel} to ${base.secondQuantityLabel}?`;
  base.prompt = `${lead}${dataText} ${request}`;
  base.taskType = family.name;
  base.contextCategory = category;
  base.questionStructure = `${family.name}-${type}-${kind}`;
  base.similarityGroup = `expansion-${family.name}`;
  base.objectTypes = groups.map((g) => g.key);
  base.data = groups.map(({ key, count }) => ({ key, count }));
  base.reasoningSkill = family.name;
  base.objective = `Represent and interpret ${type} in a ${family.name.replaceAll("-", " ")} situation`;
  base.questionFormat = kind === "input" ? "enter-ratio" : kind === "build" ? "construct-ratio" : kind === "meaning" ? "select-explanation" : "select-ratio";
  base.answerType = kind === "input" ? "ratio-text" : kind === "build" ? "ratio-build" : kind === "meaning" ? "explanation-choice" : "ratio-choice";
  base.hint = `Identify the two quantities in order: ${base.firstQuantityLabel} first and ${base.secondQuantityLabel} second. The whole includes all ${groups.length} listed categories.`;
  base.answerExplanation = `There are ${groups.map((g) => g.count).join(" + ")} ${wholeWord} in all. The first term counts ${base.firstQuantityLabel} (${base.correctAnswer[0]}); the second counts ${base.secondQuantityLabel} (${base.correctAnswer[1]}). So the ratio is ${formatRatio(base.correctAnswer)}.`;
  base.solutionSteps = [`Total: ${groups.map((g) => g.count).join(" + ")} = ${groups.reduce((sum, g) => sum + g.count, 0)} ${wholeWord}.`, `First quantity, ${base.firstQuantityLabel}: ${base.correctAnswer[0]}.`, `Second quantity, ${base.secondQuantityLabel}: ${base.correctAnswer[1]}.`, `Ratio: ${formatRatio(base.correctAnswer)}.`];
  base.correctText = base.answerExplanation;
  base.examStyle = difficulty === "challenging" && index % 3 !== 0;
  base.styleReferenceId = base.examStyle ? "uk-ks2-mathematics-2026-paper-2" : null;
  if (kind === "meaning") {
    const whole = groups.reduce((sum, g) => sum + g.count, 0);
    const wrongPair = type === "p2p" ? [base.correctAnswer[0], whole] : [groups[0].count, groups[1].count];
    base.answerOptions = seededShuffle([
      { text: `There are ${whole} ${wholeWord} altogether. ${formatRatio(base.correctAnswer)} counts ${base.firstQuantityLabel} first and ${base.secondQuantityLabel} second.`, category: "correct" },
      { text: `${formatRatio([base.correctAnswer[1], base.correctAnswer[0]])} puts the requested quantities in reverse order.`, category: type === "p2p" ? "A" : "C" },
      { text: `${formatRatio(wrongPair)} uses a different comparison from the one requested.`, category: "B" },
      { text: `The ratio ${formatRatio(base.correctAnswer)} is the total number of ${wholeWord} (${whole}).`, category: "H" },
    ], hashString(id));
  } else if (kind === "choice") {
    base.answerOptions = seededShuffle([base.correctAnswer, ...distractorsFor(base).slice(0, 2)].map(formatRatio), hashString(id));
  }
  return base;
}

const EXPANSION = ["easy", "medium", "challenging"].flatMap((difficulty, levelIndex) =>
  Array.from({ length: 70 }, (_, index) => buildExpansionQuestion(difficulty, index, levelIndex))
);

export function validateQuestion(q) {
  const errors = [];
  if (!q.objective || !q.questionFormat || !q.reasoningSkill || !q.representationType) errors.push("question metadata is incomplete");
  if (!q.solutionSteps?.length || !q.answerExplanation) errors.push("solution or explanation is missing");
  if (!q.sourceType || !["original", "adapted", "authentic"].includes(q.sourceType)) errors.push("source type is invalid");
  if (!QUESTION_SOURCES[q.sourceId]) errors.push("curriculum source record is missing");
  if (q.styleReferenceId && !QUESTION_SOURCES[q.styleReferenceId]) errors.push("style reference record is missing");
  if (q.examStyle && (!q.styleReferenceId || !QUESTION_SOURCES[q.styleReferenceId])) errors.push("exam-style question is missing its style reference");
  if (q.quantityUnit !== "objects") errors.push("question quantities do not share the declared unit");
  const normalPrompt = (q.prompt || "").toLocaleLowerCase();
  if (!q.groups.every((g) => isValidCount(g.count))) errors.push("invalid counts");
  if (!q.groups.every((g) => g.emoji && g.name && g.singular && g.plural)) errors.push("object is missing its emoji or explicit labels");
  if (q.groups.length > 2 && !q.groups.every((g) => normalPrompt.includes(`${g.count} ${g.emoji} ${g.count === 1 ? g.singular : g.plural}`.toLocaleLowerCase()))) errors.push("multi-category prompt does not show every object label and count");
  if (q.groups.reduce((t, g) => t + g.count, 0) === 0) errors.push("empty collection");
  if (q.first === q.second) errors.push("first equals second");
  if (!q.comparisonType) errors.push("no comparison type");
  if (comparisonTypeOf(q.first, q.second) !== q.comparisonType) errors.push("comparison type disagrees with the requested order");
  if (!ratioEquals(ratioFor(q.groups, q.first, q.second), q.correctAnswer)) errors.push("correct answer disagrees with the object counts and requested order");
  const firstLabel = q.firstQuantityLabel?.toLocaleLowerCase();
  const secondLabel = q.secondQuantityLabel?.toLocaleLowerCase();
  if (q.kind === "total") {
    if (!q.groups.every((g) => normalPrompt.includes(g.plural.toLocaleLowerCase()))) errors.push("total prompt does not name every displayed object group");
    if (!q.groups.every((g) => normalPrompt.includes(String(g.count)))) errors.push("total prompt quantities disagree with displayed groups");
  } else if (!firstLabel || !secondLabel || !normalPrompt.includes(firstLabel) || !normalPrompt.includes(secondLabel)) {
    errors.push("prompt does not name the requested objects in order");
  }
  if (!q.hint || (q.kind !== "total" && (!q.hint.toLocaleLowerCase().includes(firstLabel || "\u0000") || !q.hint.toLocaleLowerCase().includes(secondLabel || "\u0000")))) errors.push("hint does not name the requested objects in order");
  if (q.statedAnswer) {
    const parsed = normaliseRatioAnswer(q.statedAnswer);
    if (!parsed.ok || !ratioEquals(parsed.value, q.correctAnswer)) errors.push(`stated answer ${q.statedAnswer} disagrees with counts`);
  }
  if (q.kind === "meaning") {
    if ((q.answerOptions || []).filter((o) => o.category === "correct").length !== 1) errors.push("meaning question must have exactly one correct answer");
    if (!(q.answerOptions || []).every((o) => o.text && o.category)) errors.push("meaning answer option is missing its text or feedback category");
  } else if (q.kind !== "build" && q.kind !== "input") {
    const opts = q.answerOptions || [];
    const correctOption = q.kind === "total" ? String(q.correctTotal) : formatRatio(q.correctAnswer);
    if (opts.filter((o) => o === correctOption).length !== 1) errors.push("correct option missing or duplicated");
    if (new Set(opts).size !== opts.length) errors.push("duplicate options");
    if (opts.length < 3) errors.push("too few options");
  }
  if (q.kind === "mistake" && q.rafiAnswer === formatRatio(q.correctAnswer)) errors.push("Rafi's mistake is correct");
  if (q.kind !== "total" && (!q.prompt.includes(q.firstQuantityLabel) || !q.prompt.includes(q.secondQuantityLabel))) errors.push("prompt does not state the comparison");
  return errors.map((e) => `${q.id}: ${e}`);
}

const toSpec = ([id, ctx, a, b, first, second, kind, difficulty, answer, setId]) => ({ id, ctx, a, b, first, second, kind, difficulty, answer, setId });

const UPGRADED_ROWS = ROWS
  .filter(([id]) => /-(?:0[2468]|1[02468]|19)$/.test(id))
  .map((row) => {
    const [id, ctx, a, b, first, second, kind, difficulty] = row;
    const styles = difficulty === "easy"
      ? ["read", "meaning", "compare"]
      : difficulty === "medium"
      ? ["diagnose", "table", "irrelevant", "compare", "meaning"]
      : ["missing", "irrelevant", "claims", "table", "diagnose"];
    return [id, ctx, a, b, first, second, difficulty, styles[hashString(id) % styles.length]];
  });
const UPGRADED_IDS = new Set(UPGRADED_ROWS.map(([id]) => id));
const ALL = [
  ...ROWS.map((row) => UPGRADED_IDS.has(row[0])
    ? buildVariedQuestion(UPGRADED_ROWS.find(([id]) => id === row[0]))
    : buildQuestion(toSpec(row))),
  ...VARIED_ROWS.map(buildVariedQuestion),
  ...EXPANSION,
];
export const REWRITTEN_QUESTION_IDS = [...UPGRADED_IDS];
export const BANK_ERRORS = ALL.flatMap(validateQuestion);
if (BANK_ERRORS.length && process.env.NODE_ENV !== "production") {
  // eslint-disable-next-line no-console
  console.error("Question bank validation failed:", BANK_ERRORS);
}
const invalidIds = new Set(BANK_ERRORS.map((e) => e.split(":")[0]));
export const QUESTION_BANK = ALL.filter((q) => !invalidIds.has(q.id));

export const QUESTION_COUNTS = Object.fromEntries(
  ["easy", "medium", "challenging"].map((difficulty) => [difficulty, QUESTION_BANK.filter((q) => q.difficulty === difficulty).length])
);
export const QUESTION_SOURCE = QUESTION_SOURCES;

// Curriculum-aware near-duplicate screen: questions sharing the same assessed
// comparison, level, response format, reasoning objective, and requested order
// are surfaced for review even when names, counts, or wording differ.
const similarityBuckets = QUESTION_BANK.reduce((buckets, q) => {
  const key = [q.comparisonType, q.difficulty, q.questionFormat, q.reasoningSkill, q.objective, q.firstPos, q.secondPos].join("|");
  buckets[key] = [...(buckets[key] || []), q.id];
  return buckets;
}, {});
export const QUESTION_SIMILARITY_AUDIT = Object.entries(similarityBuckets)
  .filter(([, ids]) => ids.length > 1)
  .map(([key, questionIds]) => ({ key, questionIds }));
const objectPairCounts = QUESTION_BANK.reduce((counts, q) => {
  q.groups.forEach((group, index) => q.groups.slice(index + 1).forEach((other) => {
    const key = [`${group.emoji} ${group.plural}`, `${other.emoji} ${other.plural}`].sort().join(" + ");
    counts[key] = (counts[key] || 0) + 1;
  }));
  return counts;
}, {});
export const QUESTION_DIVERSITY_STATS = {
  total: QUESTION_BANK.length,
  distinctObjectTypes: new Set(QUESTION_BANK.flatMap((q) => q.groups.map((g) => `${g.emoji} ${g.plural}`))).size,
  distinctContextCategories: new Set(QUESTION_BANK.flatMap((q) => q.groups.map((g) => g.category))).size,
  structuralSignatures: new Set(QUESTION_BANK.map((q) => [q.difficulty, q.comparisonType, q.taskType, q.contextCategory, q.answerType, q.questionStructure].join("|"))).size,
  questionFamilies: new Set(QUESTION_BANK.map((q) => q.similarityGroup || q.taskType)).size,
  similarityReviewClusters: QUESTION_SIMILARITY_AUDIT.length,
  questionsInSharedTemplateClusters: new Set(QUESTION_SIMILARITY_AUDIT.flatMap((cluster) => cluster.questionIds)).size,
  repeatedObjectPairs: Object.entries(objectPairCounts).filter(([, count]) => count > QUESTION_BANK.length * 0.03).map(([pair, count]) => ({ pair, count })),
  maxObjectPairFrequency: Math.max(...Object.values(objectPairCounts)),
};

export const questionsFor = (type) => QUESTION_BANK.filter((q) => q.comparisonType === type);
export const questionById = (id) => QUESTION_BANK.find((q) => q.id === id);

// A simpler, fully visible example of the same comparison type.
export function simplerQuestion(q) {
  const pairs = [[1, 2], [2, 1], [3, 1], [1, 3], [2, 3]];
  const [a, b] = pairs[hashString(q.id) % pairs.length];
  return buildQuestion({ id: `${q.id}-simple`, ctx: "counters", a, b, first: q.first === "whole" ? "whole" : "a", second: q.second === "whole" ? "whole" : q.first === "whole" ? "a" : "b", kind: "choice", difficulty: "easy" });
}
