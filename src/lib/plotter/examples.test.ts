// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { resolveTable } from "./data";
import { EXAMPLES } from "./examples";
import { renderSvg } from "./export";
import { buildOption } from "./figure";
import { fitCurve } from "./fit";
import { decodeHash, encodeHash } from "./share";

vi.setConfig({ testTimeout: 60_000 });

describe("plotter examples", () => {
  it("has eight examples with unique slugs", () => {
    expect(EXAMPLES).toHaveLength(8);
    expect(new Set(EXAMPLES.map((example) => example.slug)).size).toBe(8);
  });

  it.each(EXAMPLES.map((example) => [example.slug, example] as const))(
    "%s parses, charts and shares",
    async (_slug, example) => {
      const resolved = resolveTable(example.state);
      expect(resolved.every((item) => !item.error)).toBe(true);
      expect(resolved.every((item) => item.ignored === 0)).toBe(true);

      const option = buildOption(example.state) as { series: { data?: unknown[] }[] };
      expect(option.series.some((series) => (series.data?.length ?? 0) > 0)).toBe(true);

      const { hash, tooLong } = encodeHash(example.state);
      expect(tooLong).toBe(false);
      expect(decodeHash(hash)).toEqual(example.state);

      expect(await renderSvg(example.state)).toMatch(/^<svg/);
    },
  );

  it("fits the declared models close to the values the data was built from", () => {
    const fitOf = (slug: string) => {
      const example = EXAMPLES.find((item) => item.slug === slug)!;
      const resolved = resolveTable(example.state);
      const x = resolved.find((item) => item.column.id === example.state.chart.xColumn)!.values;
      const y = resolved.find((item) => item.column.id === example.state.chart.yColumns[0])!.values;
      return fitCurve(example.fit!, x, y);
    };
    expect(fitOf("lei-de-ohm").params[0]).toBeCloseTo(10, 0);
    expect(fitOf("curva-do-diodo").params[1]).toBeCloseTo(20, 0);
    expect(fitOf("descarga-do-capacitor-rc").params[1]).toBeCloseTo(-1, 1);
    expect(fitOf("torque-e-velocidade-de-um-motor").params[0]).toBeCloseTo(-2.4 / 1800, 4);
  });

  it("the solar power column is the product of voltage and current", () => {
    const solar = EXAMPLES.find((item) => item.slug === "curva-do-painel-solar")!;
    const [v, i, p] = resolveTable(solar.state);
    p!.values.forEach((value, row) => {
      expect(value).toBeCloseTo(v!.values[row]! * i!.values[row]!, 9);
    });
  });
});
