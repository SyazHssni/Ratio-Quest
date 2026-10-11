const fs = require("node:fs");
const path = require("node:path");
const babel = require("@babel/core");

const originalJsLoader = require.extensions[".js"];
require.extensions[".js"] = (module, filename) => {
  if (!path.basename(filename).startsWith("year6")) return originalJsLoader(module, filename);
  const source = fs.readFileSync(filename, "utf8");
  const { code } = babel.transformSync(source, {
    filename,
    presets: [["@babel/preset-env", { targets: { node: "current" } }]],
    plugins: ["@babel/plugin-transform-modules-commonjs"],
  });
  module._compile(code, filename);
};

const { YEAR6_QUESTIONS, YEAR6_QUESTION_REPORT, validateYear6Bank } = require("../src/data/year6Course.js");
const validation = validateYear6Bank();
const library = YEAR6_QUESTIONS.filter((question) => question.questionCategory);
const counts = (field) => Object.fromEntries([...new Set(library.map((question) => question[field]))].sort().map((value) => [value, library.filter((question) => question[field] === value).length]));
const promptCounts = new Map();
library.forEach((question) => {
  const prompt = question.question.trim().toLowerCase();
  promptCounts.set(prompt, (promptCounts.get(prompt) || 0) + 1);
});
const structuralSignatures = new Set(library.map((question) => [question.learningStandard, question.questionFamily, question.data.a, question.data.b, question.data.multiplier].join("|")));
const gcd = (a, b) => b ? gcd(b, a % b) : a;
const mathExamples = {
  "6:9 simplifies to 2:3": `${6 / gcd(6, 9)} : ${9 / gcd(6, 9)}` === "2 : 3",
  "5:7 is already simplest": gcd(5, 7) === 1,
  "8:12 simplifies to 2:3": `${8 / gcd(8, 12)} : ${12 / gcd(8, 12)}` === "2 : 3",
  "2:3 scaled by 2 gives 4:6": `${2 * 2} : ${3 * 2}` === "4 : 6",
  "3:4 = 12:? gives 16": 12 / 3 * 4 === 16,
  "different scale factors rejected": 12 * 4 !== 15 * 3,
  "8:12 is not simplest": gcd(8, 12) > 1,
};
const report = {
  total: YEAR6_QUESTIONS.length,
  parameterisedLibrary: library.length,
  standardCounts: YEAR6_QUESTION_REPORT.byStandard,
  difficultyCounts: YEAR6_QUESTION_REPORT.byDifficulty,
  categoryCounts: YEAR6_QUESTION_REPORT.byCategory,
  questionTypeCounts: counts("questionType"),
  answerFormatCounts: counts("answerType"),
  distinctTaskFamilies: new Set(library.map((question) => question.questionFamily)).size,
  structuralSignatures: structuralSignatures.size,
  duplicateIds: YEAR6_QUESTIONS.length - new Set(YEAR6_QUESTIONS.map((question) => question.id)).size,
  duplicatePrompts: [...promptCounts.values()].filter((count) => count > 1).length,
  answerAndVisualValidation: validation.valid,
  exampleMathChecks: mathExamples,
  validationErrors: validation.errors,
};
console.log(JSON.stringify(report, null, 2));
fs.writeFileSync(path.resolve(__dirname, "../YEAR6_QUESTION_AUDIT.json"), `${JSON.stringify(report, null, 2)}\n`);
if (!validation.valid || Object.values(mathExamples).some((passed) => !passed) || report.duplicateIds || report.duplicatePrompts || structuralSignatures.size !== library.length) process.exitCode = 1;
