import { describe, expect, it } from "vitest";
import { chartRows, parseChartSpec } from "./report-chart";

const valid = {
  type: "stacked-bar",
  title: "Eólica e solar",
  unit: "GWh",
  labels: ["jul/26", "ago/26"],
  series: [
    { name: "Eólica", values: [1.5, 2] },
    { name: "Solar", values: [0.5, 1] },
  ],
};
const parse = (value: unknown) => parseChartSpec(JSON.stringify(value));

describe("parseChartSpec", () => {
  it("accepts a valid chart and defaults the kind to bar", () => {
    expect(parse(valid)?.series).toHaveLength(2);
    expect(parse({ ...valid, type: undefined })?.type).toBe("bar");
  });

  it("refuses anything that is not a chart", () => {
    for (const bad of [
      "not json",
      "null",
      JSON.stringify({ ...valid, type: "pie" }),
      JSON.stringify({ ...valid, labels: [] }),
      JSON.stringify({ ...valid, series: [] }),
      JSON.stringify({ ...valid, series: [{ name: "x", values: [1] }] }),
      JSON.stringify({ ...valid, series: [{ name: "x", values: [1, "2"] }] }),
      JSON.stringify({ ...valid, title: 3 }),
    ]) {
      expect(parseChartSpec(bad), bad).toBeNull();
    }
  });

  it("limits the size of a chart", () => {
    const labels = Array.from({ length: 49 }, (_, i) => `m${i}`);
    expect(
      parse({ ...valid, labels, series: [{ name: "x", values: labels.map(() => 1) }] }),
    ).toBeNull();
  });
});

describe("chartRows", () => {
  it("makes one row per label with a key per series", () => {
    const spec = parse(valid);
    expect(spec && chartRows(spec)).toEqual([
      { label: "jul/26", s0: 1.5, s1: 0.5 },
      { label: "ago/26", s0: 2, s1: 1 },
    ]);
  });
});
