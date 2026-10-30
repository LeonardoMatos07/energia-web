// @vitest-environment node
import { describe, expect, it, vi } from "vitest";

vi.setConfig({ testTimeout: 60_000 });
import { renderSvg } from "./export";
import { buildOption, buildResidualOption, KINDS } from "./figure";
import { fitCurve } from "./fit";
import { emptyState, type ChartKind, type PlotterState } from "./state";
import { boxStats, histogram, quantile } from "./summary";

type Obj = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

function sample(kind: ChartKind = "scatter"): PlotterState {
  const base = emptyState();
  return {
    ...base,
    columns: [
      ...base.columns,
      { id: "e", name: "erro", kind: "number" },
      { id: "name", name: "nome", kind: "text" },
    ],
    rows: [
      ["1", "10", "0,5", "a"],
      ["10", "100", "5", "b"],
      ["100", "abc", "50", "c"],
      ["", "5", "1", "d"],
      ["1000", "1000", "100", "e"],
    ],
    chart: { ...base.chart, kind, yErrorColumn: "e" },
  };
}

describe("buildOption: cartesian", () => {
  it("uses log axes and keeps error bars aligned with the kept points", () => {
    const state = sample();
    state.chart = { ...state.chart, xLog: true, yLog: true };
    const option = buildOption(state) as Obj;
    expect(option.xAxis.type).toBe("log");
    expect(option.yAxis.type).toBe("log");
    const [points, errors] = option.series;
    expect(points.data).toEqual([
      [1, 10],
      [10, 100],
      [1000, 1000],
    ]);
    expect(errors.type).toBe("custom");
    expect(errors.data).toEqual([
      [1, 10, 0.5, 0],
      [10, 100, 5, 0],
      [1000, 1000, 100, 0],
    ]);
  });

  it("drops non-positive values on a log axis", () => {
    const state = sample();
    state.rows = [
      ["0", "10", "1", ""],
      ["5", "10", "1", ""],
    ];
    state.chart = { ...state.chart, xLog: true, yErrorColumn: null };
    const option = buildOption(state) as Obj;
    expect(option.series[0].data).toEqual([[5, 10]]);
  });

  it("draws horizontal error bars too", () => {
    const state = sample();
    state.chart = { ...state.chart, xErrorColumn: "e", yErrorColumn: null };
    const errors = (buildOption(state) as Obj).series[1];
    expect(errors.data[0]).toEqual([1, 10, 0, 0.5]);
  });

  it("overlays the fitted curve and lists it in the legend", () => {
    const state = sample();
    state.chart = { ...state.chart, yErrorColumn: null };
    const fit = fitCurve("linear", [1, 2, 3, 4], [2, 4, 6, 8]);
    const option = buildOption(state, { fit }) as Obj;
    const curve = option.series.at(-1);
    expect(curve.name).toBe("Ajuste");
    expect(curve.data[0][1]).toBeCloseTo(2, 9);
    expect(option.legend.data).toContain("Ajuste");
  });

  it("draws one series per selected Y column", () => {
    const state = sample("line");
    state.chart = { ...state.chart, yColumns: ["y", "e"], yErrorColumn: null };
    const option = buildOption(state) as Obj;
    expect(option.series.map((s: Obj) => [s.type, s.name])).toEqual([
      ["line", "y"],
      ["line", "erro"],
    ]);
  });

  it("builds bars with the raw text of the label column", () => {
    const state = sample("bar");
    state.chart = { ...state.chart, xColumn: "name" };
    const option = buildOption(state) as Obj;
    expect(option.xAxis.data).toEqual(["a", "b", "c", "d", "e"]);
    expect(option.series[0].type).toBe("bar");
    expect(option.series[0].data[2]).toBeNull();
  });
});

describe("buildOption: other kinds", () => {
  it("histogram counts the first Y series", () => {
    const state = sample("histogram");
    state.chart = { ...state.chart, bins: 2, yColumns: ["e"] };
    const option = buildOption(state) as Obj;
    expect(option.series[0].data.reduce((a: number, b: number) => a + b, 0)).toBe(5);
    expect(option.xAxis.data).toHaveLength(2);
  });

  it("boxplot has one box per column and lists the outliers", () => {
    const state = sample("box");
    state.rows = [1, 2, 3, 4, 5, 100].map((n) => [String(n), String(n), "0", ""]);
    state.chart = { ...state.chart, yColumns: ["y"] };
    const option = buildOption(state) as Obj;
    expect(option.series[0].data).toEqual([[1, 2.25, 3.5, 4.75, 5]]);
    expect(option.series[1].data).toEqual([[0, 100]]);
  });

  it("pie uses the label column and skips non-positive values", () => {
    const state = sample("pie");
    state.rows = [
      ["1", "30", "", "Sol"],
      ["2", "-5", "", "Neg"],
      ["3", "70", "", "Vento"],
    ];
    state.chart = { ...state.chart, xColumn: "name" };
    const option = buildOption(state) as Obj;
    expect(option.series[0].data).toEqual([
      { name: "Sol", value: 30 },
      { name: "Vento", value: 70 },
    ]);
  });

  it("polar plots [radius, angle] pairs", () => {
    const state = sample("polar");
    state.rows = [
      ["0", "1", "", ""],
      ["90", "2", "", ""],
    ];
    state.chart = { ...state.chart, yColumns: ["y"] };
    const option = buildOption(state) as Obj;
    expect(option.series[0].coordinateSystem).toBe("polar");
    expect(option.series[0].data).toEqual([
      [1, 0],
      [2, 90],
    ]);
  });

  it("covers every kind in the selector, and each builds without throwing", () => {
    for (const kind of KINDS) {
      const option = buildOption(sample(kind.id)) as Obj;
      expect(option.series.length, kind.id).toBeGreaterThan(0);
    }
  });

  it("residual chart plots residuals against x", () => {
    const fit = fitCurve("linear", [1, 2, 3, 4], [1, 2.2, 2.8, 4.1]);
    const option = buildResidualOption(fit) as Obj;
    expect(option.series[0].data).toHaveLength(4);
  });
});

describe("SVG export without a DOM", () => {
  it("renders every chart kind to an SVG document", async () => {
    for (const kind of KINDS) {
      const svg = await renderSvg(sample(kind.id));
      expect(svg, kind.id).toMatch(/^<svg[\s\S]*<\/svg>$/);
      expect(svg.length, kind.id).toBeGreaterThan(500);
    }
  });

  it("draws the error bars, the log axis labels and a white background", async () => {
    const state = sample();
    state.chart = { ...state.chart, xLog: true, yLog: true, title: "Teste" };
    const svg = await renderSvg(state);
    expect(svg).toContain("Teste");
    expect(svg).toContain('fill="#ffffff"');
    expect(svg).toMatch(/<path/);
  });

  it("can leave the background out", async () => {
    const svg = await renderSvg(sample(), null, true);
    expect(svg).not.toContain('fill="#ffffff"');
  });
});

describe("summary", () => {
  it("histogram puts the maximum in the last bin", () => {
    const result = histogram([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 5);
    expect(result?.counts).toEqual([2, 2, 2, 2, 3]);
    expect(result?.edges).toEqual([0, 2, 4, 6, 8, 10]);
  });

  it("histogram handles equal values and empty input", () => {
    expect(histogram([3, 3, 3], 5)?.counts).toEqual([3]);
    expect(histogram([null], 5)).toBeNull();
  });

  it("quantiles follow the NumPy default (linear interpolation)", () => {
    expect(quantile([1, 2, 3, 4], 0.25)).toBe(1.75);
    expect(quantile([1, 2, 3, 4], 0.5)).toBe(2.5);
    expect(quantile([1, 2, 3, 4], 0.75)).toBe(3.25);
  });

  it("boxStats puts far points in the outliers, not in the whiskers", () => {
    const stats = boxStats([1, 2, 3, 4, 5, 100]);
    expect(stats).toMatchObject({ q1: 2.25, median: 3.5, q3: 4.75, max: 5, outliers: [100] });
    expect(boxStats([null])).toBeNull();
  });
});
