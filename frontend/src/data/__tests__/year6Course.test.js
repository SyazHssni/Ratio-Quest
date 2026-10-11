import { YEAR6_LESSONS, YEAR6_QUESTIONS, YEAR6_QUESTION_REPORT, validateYear6Bank } from "../year6Course";

describe("Year 6 ratio course data", () => {
  test("maps lessons and all bank items to the two required standards", () => {
    expect(YEAR6_LESSONS.some((lesson) => lesson.standard === "7.2.1")).toBe(true);
    expect(YEAR6_LESSONS.some((lesson) => lesson.standard === "7.3.1")).toBe(true);
    expect(YEAR6_QUESTIONS.every((q) => q.yearLevel === 6 && ["7.2.1", "7.3.1"].includes(q.learningStandard))).toBe(true);
    expect(validateYear6Bank().valid).toBe(true);
  });

  test("contains separate standards and difficulty levels", () => {
    for (const standard of ["7.2.1", "7.3.1"]) {
      const items = YEAR6_QUESTIONS.filter((q) => q.learningStandard === standard);
      expect(items.length).toBeGreaterThan(0);
      for (const level of ["easy", "medium", "challenging"]) expect(items.some((q) => q.difficulty === level)).toBe(true);
    }
  });

  test("validates simplest-form answers and catches an incorrect answer", () => {
    const item = YEAR6_QUESTIONS.find((q) => q.learningStandard === "7.2.1" && q.questionFamily !== "already");
    expect(item.correctAnswer).toMatch(/^\d+ : \d+$/);
    const broken = YEAR6_QUESTIONS.map((q) => q.id === item.id ? { ...q, correctAnswer: "999 : 1" } : q);
    expect(validateYear6Bank(broken).valid).toBe(false);
  });

  test("validates proportionate quantities and catches an incorrect answer", () => {
    const item = YEAR6_QUESTIONS.find((q) => q.learningStandard === "7.3.1" && q.questionFamily !== "additive");
    const broken = YEAR6_QUESTIONS.map((q) => q.id === item.id ? { ...q, correctAnswer: "999" } : q);
    expect(validateYear6Bank(broken).valid).toBe(false);
  });

  test("contains integrated items mapped to both outcomes", () => {
    const integrated = YEAR6_QUESTIONS.filter((q) => q.secondaryLearningStandard === "7.3.1");
    expect(integrated.length).toBeGreaterThan(0);
    expect(integrated.every((q) => q.learningStandard === "7.2.1" && q.data.multiplier > 0)).toBe(true);
  });

  test("meets all six 40-item library category minimums with unique prompts", () => {
    expect(Object.keys(YEAR6_QUESTION_REPORT.byCategory)).toHaveLength(6);
    Object.values(YEAR6_QUESTION_REPORT.byCategory).forEach((count) => expect(count).toBeGreaterThanOrEqual(40));
    const library = YEAR6_QUESTIONS.filter((q) => q.questionCategory);
    expect(library).toHaveLength(240);
    expect(new Set(library.map((q) => q.question.trim().toLowerCase())).size).toBe(library.length);
    expect(library.every((q) => q.hint && q.explanation && q.workedSolution && q.data.expectedAnswer === q.correctAnswer)).toBe(true);
  });

  test("covers parameterised formats and exact emoji object counts", () => {
    const library = YEAR6_QUESTIONS.filter((q) => q.questionCategory);
    expect(new Set(library.map((q) => q.questionType)).size).toBeGreaterThanOrEqual(6);
    expect(library.filter((q) => q.answerType === "numeric").length).toBeGreaterThan(0);
    expect(library.filter((q) => q.visual).every((q) => q.visual.first.count === q.data.a && q.visual.second.count === q.data.b)).toBe(true);
    expect(validateYear6Bank(library).valid).toBe(true);
  });

  test("rejects an altered proportion answer key and missing explanation", () => {
    const item = YEAR6_QUESTIONS.find((q) => q.questionCategory === "proportion-foundational" && q.questionFamily === "scale-up-first-known");
    const wrongAnswer = YEAR6_QUESTIONS.map((q) => q.id === item.id ? { ...q, correctAnswer: "999", data: { ...q.data, expectedAnswer: "999" } } : q);
    expect(validateYear6Bank(wrongAnswer).valid).toBe(false);
    const noExplanation = YEAR6_QUESTIONS.map((q) => q.id === item.id ? { ...q, explanation: "" } : q);
    expect(validateYear6Bank(noExplanation).valid).toBe(false);
  });

  test("rejects duplicate IDs and an answer absent from the options", () => {
    const duplicated = [...YEAR6_QUESTIONS, { ...YEAR6_QUESTIONS[0] }];
    expect(validateYear6Bank(duplicated).errors.some((e) => e.includes("duplicate id"))).toBe(true);
    const broken = YEAR6_QUESTIONS.map((q, i) => i ? q : { ...q, options: ["not the answer"] });
    expect(validateYear6Bank(broken).errors.some((e) => e.includes("answer missing"))).toBe(true);
  });
});
