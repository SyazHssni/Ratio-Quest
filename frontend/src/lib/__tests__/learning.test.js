import { classifyAnswer, classifyTotal, feedbackFor, looksUnstable, workedSteps } from "../misconceptions";
import { QUESTION_BANK, BANK_ERRORS, QUESTION_COUNTS, QUESTION_DIVERSITY_STATS, QUESTION_SIMILARITY_AUDIT, REWRITTEN_QUESTION_IDS, questionsFor, simplerQuestion, validateQuestion, buildQuestion } from "../../data/questionBank";
import { QUESTION_SOURCES } from "../../data/questionSources";
import { lessonMasteryResult, finalResult, buildMasterySet, buildFinalSet, makeMeaningQuestion } from "../mastery";
import { formatRatio } from "../ratio";
import { EMOJI_LIBRARY } from "../../data/objects";
import { pickRandom, seededShuffle, selectPracticeQuestions } from "../random";

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
  test("has 100 questions of each ratio type and difficulty", () => {
    expect(QUESTION_BANK).toHaveLength(300);
    const expectedByLevel = { easy: { p2p: 34, p2w: 33, w2p: 33 }, medium: { p2p: 33, p2w: 34, w2p: 33 }, challenging: { p2p: 33, p2w: 33, w2p: 34 } };
    ["p2p", "p2w", "w2p"].forEach((t) => {
      expect(questionsFor(t)).toHaveLength(100);
      ["easy", "medium", "challenging"].forEach((difficulty) => {
        expect(questionsFor(t).filter((q) => q.difficulty === difficulty)).toHaveLength(expectedByLevel[difficulty][t]);
      });
    });
    expect(QUESTION_COUNTS).toEqual({ easy: 100, medium: 100, challenging: 100 });
  });
  test("ids are unique and referenced sources exist", () => {
    expect(new Set(QUESTION_BANK.map((x) => x.id)).size).toBe(300);
    QUESTION_BANK.forEach((q) => {
      expect(QUESTION_SOURCES[q.sourceId]).toBeDefined();
      expect(q.objective).toBeTruthy();
      expect(q.reasoningSkill).toBeTruthy();
      expect(q.questionFormat).toBeTruthy();
      expect(q.solutionSteps.length).toBeGreaterThan(1);
      expect(q.quantityUnit).toBe("objects");
      if (q.examStyle) expect(QUESTION_SOURCES[q.styleReferenceId]).toBeDefined();
    });
    expect(REWRITTEN_QUESTION_IDS).toHaveLength(30);
    expect(QUESTION_BANK.filter((q) => q.id.startsWith("exp-easy-")).every((q) => q.groups.length === 2)).toBe(true);
    expect(QUESTION_BANK.filter((q) => q.id.startsWith("exp-medium-") || q.id.startsWith("exp-challenging-")).every((q) => q.groups.length === 3)).toBe(true);
  });
  test("all questions keep their emoji labels, counts, order, hints, and solutions aligned", () => {
    const knownEmojis = new Set(EMOJI_LIBRARY.map((item) => item.emoji));
    QUESTION_BANK.forEach((q) => {
      expect(q.groups.length).toBeGreaterThanOrEqual(2);
      expect(q.groups.length).toBeLessThanOrEqual(3);
      q.groups.forEach((group) => {
        expect(knownEmojis.has(group.emoji)).toBe(true);
        expect(Number.isInteger(group.count) && group.count > 0).toBe(true);
        expect(group.name && group.singular && group.plural).toBeTruthy();
      });
      expect(q.prompt).toContain(q.firstQuantityLabel);
      expect(q.prompt).toContain(q.secondQuantityLabel);
      expect(q.hint).toContain(q.firstQuantityLabel);
      expect(q.hint).toContain(q.secondQuantityLabel);
      expect(q.answerExplanation).toContain(q.firstQuantityLabel);
      expect(q.answerExplanation).toContain(q.secondQuantityLabel);
      const whole = q.groups.reduce((sum, g) => sum + g.count, 0);
      expect(q.correctAnswer).toEqual([
        q.first === "whole" ? whole : q.groups.find((g) => g.key === q.first).count,
        q.second === "whole" ? whole : q.groups.find((g) => g.key === q.second).count,
      ]);
      expect(q.solutionSteps[q.solutionSteps.length - 1]).toContain(formatRatio(q.correctAnswer));
    });
  });
  test("shared object labels cover irregular plurals used in the bank", () => {
    const labels = Object.fromEntries(EMOJI_LIBRARY.map((item) => [item.singular, item.plural]));
    expect(labels.tomato).toBe("tomatoes");
    expect(labels.potato).toBe("potatoes");
    expect(labels.mouse).toBe("mice");
    expect(labels.sheep).toBe("sheep");
    expect(labels["sushi piece"]).toBe("sushi pieces");
    expect(labels["broccoli floret"]).toBe("broccoli florets");
  });
  test("no bank prompt is duplicated verbatim and randomized sessions/options are stable and non-repeating", () => {
    const prompts = QUESTION_BANK.map((q) => q.prompt.trim().toLocaleLowerCase());
    expect(new Set(prompts).size).toBe(prompts.length);
    expect(seededShuffle([1, 2, 3, 4], 1234)).toEqual(seededShuffle([1, 2, 3, 4], 1234));
    expect(new Set(pickRandom(QUESTION_BANK, 20).map((q) => q.id)).size).toBe(20);
    const session = selectPracticeQuestions(QUESTION_BANK, 20, 444, QUESTION_BANK.slice(0, 40).map((q) => q.id));
    expect(session).toHaveLength(20);
    expect(new Set(session.map((q) => q.id)).size).toBe(20);
    expect(session.some((q) => QUESTION_BANK.slice(0, 40).some((old) => old.id === q.id))).toBe(false);
    const typeCounts = ["p2p", "p2w", "w2p"].map((type) => session.filter((q) => q.comparisonType === type).length);
    expect(Math.max(...typeCounts) - Math.min(...typeCounts)).toBeLessThanOrEqual(1);
    for (let i = 1; i < session.length; i += 1) {
      expect(session[i].questionStructure).not.toBe(session[i - 1].questionStructure);
      expect(session[i].objectTypes.slice().sort()).not.toEqual(session[i - 1].objectTypes.slice().sort());
    }
    QUESTION_BANK.filter((q) => q.answerOptions).forEach((q) => {
      expect(seededShuffle(q.answerOptions, 1234)).toEqual(seededShuffle(q.answerOptions, 1234));
      expect(q.answerOptions.filter((option) => q.kind === "meaning" ? option.category === "correct" : option === formatRatio(q.correctAnswer))).toHaveLength(1);
    });
  });
  test("similarity audit surfaces shared reasoning templates for human review", () => {
    expect(QUESTION_SIMILARITY_AUDIT.length).toBeGreaterThan(0);
    QUESTION_SIMILARITY_AUDIT.forEach((cluster) => {
      expect(cluster.questionIds.length).toBeGreaterThan(1);
      cluster.questionIds.forEach((id) => expect(QUESTION_BANK.some((q) => q.id === id)).toBe(true));
    });
  });
  test("measured bank diversity meets the documented targets", () => {
    expect(QUESTION_DIVERSITY_STATS.total).toBe(300);
    expect(QUESTION_DIVERSITY_STATS.distinctObjectTypes).toBeGreaterThanOrEqual(40);
    expect(QUESTION_DIVERSITY_STATS.distinctContextCategories).toBeGreaterThanOrEqual(12);
    expect(QUESTION_DIVERSITY_STATS.structuralSignatures).toBeGreaterThanOrEqual(60);
    expect(QUESTION_DIVERSITY_STATS.questionFamilies).toBeGreaterThanOrEqual(25);
    expect(QUESTION_DIVERSITY_STATS.repeatedObjectPairs).toEqual([]);
    expect(QUESTION_DIVERSITY_STATS.maxObjectPairFrequency).toBeLessThanOrEqual(9);
  });
  test("correct option is not always first", () => {
    const firsts = QUESTION_BANK.filter((x) => x.answerOptions).map((x) => x.answerOptions[0] === formatRatio(x.correctAnswer));
    expect(firsts.filter(Boolean).length).toBeLessThan(firsts.length * 0.6);
  });
  test("simpler questions are valid", () => QUESTION_BANK.forEach((x) => expect(validateQuestion(simplerQuestion(x))).toEqual([])));
  test("every single-answer question has exactly one mathematically correct choice", () =>
    QUESTION_BANK.forEach((x) => {
      if (x.kind === "meaning") {
        expect(x.answerOptions.filter((o) => o.category === "correct")).toHaveLength(1);
      } else if (x.answerOptions) {
        expect(x.answerOptions.filter((o) => o === formatRatio(x.correctAnswer))).toHaveLength(1);
        x.answerOptions.forEach((o) => {
          if (o !== formatRatio(x.correctAnswer)) expect(classifyAnswer(x, o.split(" : ").map(Number)).category).not.toBe("correct");
        });
      }
    }));
  test("a contradictory question fails validation", () => {
    const bad = buildQuestion({ id: "bad", ctx: "balls", a: 2, b: 3, first: "a", second: "b", answer: "3:2" });
    expect(validateQuestion(bad).length).toBeGreaterThan(0);
  });
});

describe("mastery rules", () => {
  test("meaning distractors describe a ratio-as-an-amount error without stating an unqualified true total", () => {
    QUESTION_BANK.forEach((q) => {
      const meaning = makeMeaningQuestion(q);
      expect(meaning.answerOptions.filter((option) => option.category === "correct")).toHaveLength(1);
      const amountDistractor = meaning.answerOptions.find((option) => option.category === "H");
      expect(amountDistractor.text).toContain(`The ratio ${formatRatio(q.correctAnswer)} is one amount`);
    });
  });
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
