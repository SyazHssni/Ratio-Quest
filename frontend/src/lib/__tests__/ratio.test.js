import {
  wholeOf, partsToParts, firstPartToWhole, wholeToFirstPart, secondPartToWhole, wholeToSecondPart,
  normaliseRatioAnswer, normaliseNumberAnswer, clampCount, MAX_COUNT, ratioFor, formatRatio, comparisonTypeOf,
} from "../ratio";

describe("ratio helpers for a = 2, b = 3", () => {
  test("parts to parts", () => expect(partsToParts(2, 3)).toEqual([2, 3]));
  test("first part to whole", () => expect(firstPartToWhole(2, 3)).toEqual([2, 5]));
  test("whole to first part", () => expect(wholeToFirstPart(2, 3)).toEqual([5, 2]));
  test("second part to whole", () => expect(secondPartToWhole(2, 3)).toEqual([3, 5]));
  test("whole to second part", () => expect(wholeToSecondPart(2, 3)).toEqual([5, 3]));
  test("whole", () => expect(wholeOf(2, 3)).toBe(5));
  test("format", () => expect(formatRatio([2, 3])).toBe("2 : 3"));
});

describe("boundary values", () => {
  test("0 and 3", () => {
    expect(partsToParts(0, 3)).toEqual([0, 3]);
    expect(firstPartToWhole(0, 3)).toEqual([0, 3]);
  });
  test("3 and 0", () => expect(wholeToFirstPart(3, 0)).toEqual([3, 3]));
  test("0 and 0", () => expect(wholeOf(0, 0)).toBe(0));
  test("max counts", () => expect(firstPartToWhole(MAX_COUNT, MAX_COUNT)).toEqual([12, 24]));
  test.each([[-1, 2], [1.5, 2], [undefined, 2], ["2", 3], [null, 1], [NaN, 1]])("rejects invalid %p", (a, b) => {
    expect(() => partsToParts(a, b)).toThrow(TypeError);
    expect(() => wholeOf(a, b)).toThrow(TypeError);
  });
  test("clampCount keeps counts in range", () => {
    expect(clampCount(-1)).toBe(0);
    expect(clampCount(13)).toBe(12);
    expect(clampCount(1.5)).toBeNull();
  });
});

describe("answer normalisation", () => {
  test.each(["2:3", "2 :3", "2: 3", " 2 : 3 ", "2  :  3"])("accepts %p", (s) => expect(normaliseRatioAnswer(s)).toEqual({ ok: true, value: [2, 3] }));
  test.each(["", "   ", "2", "2/3", "a:b", "-2:3", "2.5:3", "2:3:4", "2 3"])("rejects %p with a message", (s) => {
    const r = normaliseRatioAnswer(s);
    expect(r.ok).toBe(false);
    expect(r.error.length).toBeGreaterThan(5);
  });
  test("numbers", () => {
    expect(normaliseNumberAnswer("7")).toEqual({ ok: true, value: 7 });
    expect(normaliseNumberAnswer("")).toMatchObject({ ok: false });
    expect(normaliseNumberAnswer("7.5")).toMatchObject({ ok: false });
  });
});

describe("slot based ratios", () => {
  const groups = [{ key: "red", count: 2 }, { key: "blue", count: 3 }];
  test.each([
    ["red", "blue", [2, 3]], ["blue", "red", [3, 2]], ["red", "whole", [2, 5]],
    ["whole", "red", [5, 2]], ["blue", "whole", [3, 5]], ["whole", "blue", [5, 3]],
  ])("%s to %s", (f, s, exp) => expect(ratioFor(groups, f, s)).toEqual(exp));
  test("comparison types", () => {
    expect(comparisonTypeOf("red", "blue")).toBe("p2p");
    expect(comparisonTypeOf("red", "whole")).toBe("p2w");
    expect(comparisonTypeOf("whole", "red")).toBe("w2p");
    expect(comparisonTypeOf("whole", "whole")).toBeNull();
  });
});
