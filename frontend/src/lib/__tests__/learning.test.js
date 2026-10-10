import { classifyAnswer, classifyTotal, feedbackFor, looksUnstable, workedSteps } from "../misconceptions";
import { QUESTION_BANK, BANK_ERRORS, questionsFor, simplerQuestion, validateQuestion, buildQuestion } from "../../data/questionBank";
import { lessonMasteryResult, finalResult, buildMasterySet, buildFinalSet } from "../mastery";
import { formatRatio } from "../ratio";

const q = (first, second) => buildQuestion({ id: `t-${first}-${second}`, ctx: "balls", a: 2, b: 3, first, second });

describe("learning logic with 2 red and 3 blue", () => {
  test.each([
    ["a", "b", [2, 3]], ["b", "a", [3, 2]], ["a", "whole", [2, 5]],
    ["whole", "a", [5, 2]], ["b", "whole", [3, 5]], ["whole", "b", [5, 3]],
  ])("%s to %s correct answer", (f, s, ans) => expect(classifyAnswer(q(f, s), ans).category).toBe("correct"));

  test("reversed part to part is A", () => expect(classifyAnswer(q("a", "b"), [3, 2]).category).toBe("A"));
  test("parts used for part to whole is B", () => expect(classifyAnswer(q("a", "whole"), [2, 3]).category).toBe("B"));
  test("whole used for part to part is B", () => expect(classifyAnswer(q("a", "b"), [2, 5]).category).toBe("B"));
  test("whole to part reversed is C", () => expect(classifyAnswer(q("whole", "b"), [3, 5]).category).toBe("C"));
  test("miscounted whole is E (not B)", () => {
    expect(classifyAnswer(q("a", "whole"), [2, 4]).category).toBe("E");
    expect(classifyAnswer(q("a", "whole"), [2, 7]).variant).toBe("double");
  });
  test("incomplete counting is F", () => expect(classifyAnswer(q("a", "b"), [2, 7]).category).toBe("F"));
  test("stars example from lesson 1", () => {
    const s = buildQuestion({ id: "s", ctx: "stars", a: 4, b: 2, first: "a", second: "b" });
    expect(classifyAnswer(s, [2, 4]).category).toBe("A");
    expect(classifyAnswer(s, [4, 6]).category).toBe("B");
  });
  test("pencils example from lesson 2", () => {
    const s = buildQuestion({ id: "p", ctx: "stationery", a: 4, b: 3, first: "a", second: "whole" });
    expect(classifyAnswer(s, [4, 3]).category).toBe("B");
    expect(classifyAnswer(s, [4, 8]).category).toBe("E");
    expect(classifyTotal(s, 7).category).toBe("correct");
    expect(classifyTotal(s, 4).category).toBe("F");
    expect(classifyTotal(s, 6).category).toBe("E");
  });
  test("counters example from lesson 3", () => {
    const s = buildQuestion({ id: "c", ctx: "counters", a: 4, b: 5, first: "whole", second: "b" });
    expect(classifyAnswer(s, [5, 9]).category).toBe("C");
    expect(classifyAnswer(s, [9, 5]).category).toBe("correct");
  });
  test("feedback is supportive and has a guiding question", () => {
    ["A", "B", "C", "E", "F", "H", "D", "unknown"].forEach((c) => {
      const fb = feedbackFor(q("a", "whole"), { category: c, missing: "whole" });
      expect(fb.message).not.toMatch(/stupid|careless|bad at/i);
      expect(fb.guide.length).toBeGreaterThan(3);
    });
  });
  test("worked steps include the whole when needed", () => expect(workedSteps(q("whole", "a"))[0]).toMatch("2 + 3 = 5"));
  test("guessing pattern needs two different wrong answers", () => {
    expect(looksUnstable(["A"])).toBe(false);
    expect(looksUnstable(["A", "A"])).toBe(false);
    expect(looksUnstable(["A", "E"])).toBe(true);
  });
});

describe("question bank", () => {
  test("has no validation errors", () => expect(BANK_ERRORS).toEqual([]));
  test("has 20 questions of each type", () => {
    expect(QUESTION_BANK).toHaveLength(60);
    ["p2p", "p2w", "w2p"].forEach((t) => expect(questionsFor(t)).toHaveLength(20));
  });
  test("ids are unique", () => expect(new Set(QUESTION_BANK.map((x) => x.id)).size).toBe(60));
  test("correct option is not always first", () => {
    const firsts = QUESTION_BANK.filter((x) => x.answerOptions).map((x) => x.answerOptions[0] === formatRatio(x.correctAnswer));
    expect(firsts.filter(Boolean).length).toBeLessThan(firsts.length * 0.6);
  });
  test("simpler questions are valid", () => QUESTION_BANK.forEach((x) => expect(validateQuestion(simplerQuestion(x))).toEqual([])));
  test("every distractor is not the correct answer", () =>
    QUESTION_BANK.forEach((x) => x.answerOptions.forEach((o) => {
      if (o !== formatRatio(x.correctAnswer)) expect(classifyAnswer(x, o.split(" : ").map(Number)).category).not.toBe("correct");
    })));
  test("a contradictory question fails validation", () => {
    const bad = buildQuestion({ id: "bad", ctx: "balls", a: 2, b: 3, first: "a", second: "b", answer: "3:2" });
    expect(validateQuestion(bad).length).toBeGreaterThan(0);
  });
});

describe("mastery rules", () => {
  test("p2p mastery set has 5 with a reversed question", () => {
    const set = buildMasterySet("p2p");
    expect(set).toHaveLength(5);
    expect(set.some((x) => x.tag === "reversed")).toBe(true);
  });
  test("p2w set includes a find-the-whole question; w2p includes meaning", () => {
    expect(buildMasterySet("p2w").some((x) => x.kind === "total")).toBe(true);
    expect(buildMasterySet("w2p").some((x) => x.kind === "meaning")).toBe(true);
  });
  test("4/5 with rule passes, without rule fails", () => {
    const ans = (ruleCorrect) => [
      { correct: ruleCorrect, tag: "reversed" }, { correct: true }, { correct: true }, { correct: true }, { correct: true },
    ];
    expect(lessonMasteryResult("p2p", ans(true)).passed).toBe(true);
    expect(lessonMasteryResult("p2p", ans(false)).passed).toBe(false);
  });
  test("final set has 5 of each type including the same-objects set", () => {
    const set = buildFinalSet();
    expect(set).toHaveLength(15);
    ["p2p", "p2w", "w2p"].forEach((t) => expect(set.filter((x) => x.comparisonType === t)).toHaveLength(5));
    expect(set.filter((x) => x.setId === "S1")).toHaveLength(3);
  });
  test("final result recommends the weakest lesson", () => {
    const answers = [
      ...Array(5).fill({ type: "p2p", correct: true }),
      ...Array(5).fill({ type: "p2w", correct: true, setId: "S1" }),
      ...[true, true, false, false, true].map((c) => ({ type: "w2p", correct: c })),
    ];
    const r = finalResult(answers);
    expect(r.score).toBe(13);
    expect(r.passed).toBe(false);
    expect(r.next.type).toBe("w2p");
  });
});
