import { describe, expect, it } from "vitest";
import { pageCount, pageNumbers, paginate, parsePage } from "./pagination";

describe("parsePage", () => {
  it("reads a valid page and falls back to 1", () => {
    expect(parsePage("3")).toBe(3);
    expect(parsePage(["2", "5"])).toBe(2);
    for (const bad of [undefined, "", "0", "-1", "abc", "1.5x", "999999"]) {
      expect(parsePage(bad), String(bad)).toBe(bad === "1.5x" ? 1 : 1);
    }
  });
});

describe("paginate", () => {
  const items = Array.from({ length: 45 }, (_, i) => i + 1);

  it("slices a page and numbers the start", () => {
    const second = paginate(items, 2, 20);
    expect(second.items[0]).toBe(21);
    expect(second.items).toHaveLength(20);
    expect(second).toMatchObject({ page: 2, pages: 3, start: 20 });
  });

  it("clamps a page past the end and handles an empty list", () => {
    expect(paginate(items, 9, 20)).toMatchObject({ page: 3, items: [41, 42, 43, 44, 45] });
    expect(paginate([], 1, 20)).toMatchObject({ page: 1, pages: 1, items: [] });
    expect(pageCount(0, 20)).toBe(1);
  });
});

describe("pageNumbers", () => {
  it("shows the ends and the neighbours with gaps", () => {
    expect(pageNumbers(1, 3)).toEqual([1, 2, 3]);
    expect(pageNumbers(5, 10)).toEqual([1, null, 4, 5, 6, null, 10]);
    expect(pageNumbers(2, 10)).toEqual([1, 2, 3, null, 10]);
  });
});
