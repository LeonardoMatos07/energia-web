import { describe, expect, it } from "vitest";
import {
  applyViewParams,
  buildMetricRows,
  buildSeparateRows,
  groupMetrics,
  attachShare,
  defaultMetrics,
  groupUnit,
  isCurtailmentSource,
  MAX_ENTITIES,
  metricsFor,
  mixSourceRows,
  reconcileMetrics,
  metricUnit,
  parseEntities,
  parseView,
  scaleDisparity,
  serializeEntities,
  type CompareEntity,
  type MetricKey,
  withSource,
} from "./compare";

function entity(key: string, rows: CompareEntity["rows"]): CompareEntity {
  return {
    kind: "state",
    id: key,
    key,
    label: key,
    color: "#000",
    rows,
    bySource: { all: rows, wind: rows, solar: [] },
  };
}

describe("parseEntities", () => {
  it("accepts plants, states and subsystems and ignores invalid or duplicate tokens", () => {
    const refs = parseEntities(
      "u:sao-fernando-4-rnesf4,e:ba,e:BA,s:ne,x:foo,e:ZZ,u:Bad Slug,s:XX,u:",
    );
    expect(refs).toEqual([
      { kind: "plant", id: "sao-fernando-4-rnesf4" },
      { kind: "state", id: "BA" },
      { kind: "subsystem", id: "NE" },
    ]);
  });

  it("round-trips and caps the number of entities", () => {
    expect(serializeEntities(parseEntities("e:RN,s:SIN"))).toBe("e:RN,s:SIN");
    const many = Array.from({ length: 20 }, (_, i) => `u:plant-${i}`).join(",");
    expect(parseEntities(many)).toHaveLength(MAX_ENTITIES);
    expect(parseEntities(undefined)).toEqual([]);
  });
});

describe("metric rows", () => {
  const a = entity("k0", [
    { month: "2026-01", verified: 4000, curtailed: 1000, pct: 20, loss: 5_000_000 },
    { month: "2026-02", verified: 6000, curtailed: 2000, pct: 25, loss: 9_000_000 },
  ]);
  const b = entity("k1", [
    { month: "2026-02", verified: 100, curtailed: 50, pct: 33.3, loss: null },
    { month: "2026-03", verified: 200, curtailed: 10, pct: 4.8, loss: 100_000 },
  ]);

  it("aligns entities on the union of months and scales by the divisor", () => {
    expect(buildMetricRows([a, b], "curtailed", 1000)).toEqual([
      { month: "2026-01", k0: 1, k1: undefined },
      { month: "2026-02", k0: 2, k1: 0.05 },
      { month: "2026-03", k0: undefined, k1: 0.01 },
    ]);
    expect(buildMetricRows([a, b], "loss", 1e6)[1]).toEqual({
      month: "2026-02",
      k0: 9,
      k1: undefined,
    });
  });

  it("picks units per metric", () => {
    expect(metricUnit([a, b], "pct")).toEqual({ unit: "%", divisor: 1, digits: 1 });
    expect(metricUnit([a, b], "curtailed").unit).toBe("MWh");
    expect(metricUnit([a, b], "verified").unit).toBe("MWh");
    const big = entity("k2", [
      { month: "2026-01", verified: 50_000, curtailed: 20_000, pct: 28, loss: 2e7 },
    ]);
    expect(metricUnit([big], "verified")).toEqual({ unit: "GWh", divisor: 1000, digits: 1 });
    expect(metricUnit([big], "loss").unit).toBe("R$ milhões");
    expect(metricUnit([a, b], "loss").unit).toBe("R$ mil");
  });

  it("measures how different in size the compared entities are", () => {
    const small = entity("s", [
      { month: "2026-01", verified: 10, curtailed: 2, pct: 17, loss: null },
    ]);
    const large = entity("l", [
      { month: "2026-01", verified: 5000, curtailed: 2000, pct: 29, loss: null },
    ]);
    const none = entity("n", [{ month: "2026-01", verified: 1, curtailed: 0, pct: 0, loss: null }]);
    expect(scaleDisparity([small, large])).toBe(1000);
    expect(scaleDisparity([small, none])).toBe(1);
    expect(scaleDisparity([large])).toBe(1);
  });

  it("builds one chart row per month with only the chosen metrics", () => {
    expect(buildSeparateRows(a, ["verified", "curtailed"], 1000)[0]).toEqual({
      month: "2026-01",
      verified: 4,
      curtailed: 1,
    });
    expect(buildSeparateRows(b, ["pct", "loss"], 1)[0]).toEqual({
      month: "2026-02",
      pct: 33.3,
      loss: undefined,
    });
  });

  it("groups metrics by unit and sizes the energy axis by what is stacked", () => {
    expect(groupMetrics(["pct", "verified", "loss", "curtailed"])).toEqual([
      { group: "energy", metrics: ["verified", "curtailed"] },
      { group: "money", metrics: ["loss"] },
      { group: "percent", metrics: ["pct"] },
    ]);
    expect(groupUnit(a, ["verified", "curtailed"]).unit).toBe("MWh");
    expect(groupUnit(a, ["curtailed"])).toEqual({ unit: "MWh", divisor: 1, digits: 0 });
  });
});

describe("view state in the URL", () => {
  it("defaults to generated and curtailed lines with the layout left automatic", () => {
    expect(parseView({})).toEqual({
      metrics: ["verified", "curtailed"],
      layout: null,
      kind: "line",
      source: "all",
    });
  });

  it("reads metrics in a fixed order, ignores unknown values and accepts any subset", () => {
    expect(
      parseView({ metricas: "percentual,perda,xyz", modo: "separado", grafico: "pizza" }),
    ).toEqual({
      metrics: ["loss", "pct"],
      layout: "separate",
      kind: "pie",
      source: "all",
    });
    expect(parseView({ metricas: "nada", modo: "x", grafico: "y" }).metrics).toEqual([
      "verified",
      "curtailed",
    ]);
  });

  it("reads and writes the source filter", () => {
    expect(parseView({ fonte: "solar" }).source).toBe("solar");
    expect(parseView({ fonte: "eolica" }).source).toBe("wind");
    expect(parseView({ fonte: "carvao" }).source).toBe("all");
    const base = new URLSearchParams("itens=e:BA");
    const view = {
      metrics: ["verified", "curtailed"] as MetricKey[],
      layout: null,
      kind: "line" as const,
    };
    expect(applyViewParams(base, { ...view, source: "wind" }).get("fonte")).toBe("eolica");
    expect(
      applyViewParams(new URLSearchParams("fonte=solar"), { ...view, source: "all" }).has("fonte"),
    ).toBe(false);
  });

  it("switches an entity to the rows of the chosen source", () => {
    const wind = [{ month: "2026-01", verified: 7, curtailed: 1, pct: 12, loss: null }];
    const both = [{ month: "2026-01", verified: 10, curtailed: 2, pct: 17, loss: null }];
    const state: CompareEntity = {
      ...entity("sp", both),
      bySource: { all: both, wind, solar: [] },
    };
    expect(withSource(state, "wind").rows).toBe(wind);
    expect(withSource(state, "all").rows).toBe(both);
    expect(withSource(state, "solar").rows).toEqual([]);
  });

  it("writes only what differs from the defaults and keeps unrelated params", () => {
    const base = new URLSearchParams("itens=e:BA");
    const same = applyViewParams(base, {
      metrics: ["verified", "curtailed"],
      layout: null,
      kind: "line",
      source: "all",
    });
    expect(same.toString()).toBe("itens=e%3ABA");
    const custom = applyViewParams(base, {
      metrics: ["loss"],
      layout: "items",
      kind: "bar",
      source: "all",
    });
    expect(custom.get("itens")).toBe("e:BA");
    expect(custom.get("metricas")).toBe("perda");
    expect(custom.get("modo")).toBe("itens");
    expect(custom.get("grafico")).toBe("barras");
  });
});

const mixPoint = (
  month: string,
  source: "hydro" | "thermal" | "wind" | "solar",
  mwh: number,
  pct: number,
) => ({
  month,
  subsystem: "SE" as const,
  source,
  energy_mwh: mwh,
  avg_mw: 0,
  peak_mw: 0,
  share_pct: pct,
});

describe("sources beyond wind and solar", () => {
  it("knows which sources have curtailment", () => {
    for (const source of ["all", "wind", "solar"] as const) {
      expect(isCurtailmentSource(source)).toBe(true);
    }
    for (const source of ["hydro", "thermal", "nuclear", "generation"] as const) {
      expect(isCurtailmentSource(source)).toBe(false);
    }
  });

  it("offers curtailment metrics only for wind and solar", () => {
    expect(metricsFor("wind")).toContain("curtailed");
    expect(metricsFor("hydro")).not.toContain("curtailed");
    expect(metricsFor("hydro")).toEqual(["verified", "share", "cf"]);
  });

  it("falls back to the source defaults when the chosen metrics do not apply", () => {
    expect(reconcileMetrics(["curtailed", "loss"], "hydro")).toEqual(defaultMetrics("hydro"));
    expect(reconcileMetrics(["verified", "pct"], "thermal")).toEqual(["verified"]);
    expect(reconcileMetrics(["share"], "wind")).toEqual(["share"]);
  });

  it("reads the source from the link and picks metrics that exist for it", () => {
    expect(parseView({ fonte: "hidreletrica" })).toMatchObject({
      source: "hydro",
      metrics: ["verified", "share"],
    });
    expect(parseView({ fonte: "hidreletrica", metricas: "perda,fator" })).toMatchObject({
      metrics: ["cf"],
    });
    expect(parseView({ fonte: "inexistente" })).toMatchObject({ source: "all" });
  });

  it("keeps the URL clean when the metrics are the source defaults", () => {
    const next = applyViewParams(new URLSearchParams("itens=s:SE"), {
      metrics: ["verified", "share"],
      layout: null,
      kind: "line",
      source: "hydro",
    });
    expect(next.get("metricas")).toBeNull();
    expect(next.get("fonte")).toBe("hidreletrica");
  });

  it("builds monthly generation and share for one source, and for all of them", () => {
    const points = [
      mixPoint("2026-08", "hydro", 100, 60),
      mixPoint("2026-08", "wind", 50, 30),
      mixPoint("2026-08", "thermal", 17, 10),
      mixPoint("2026-07", "hydro", 90, 55),
    ];
    const hydro = mixSourceRows(points, "hydro");
    expect(hydro.map((r) => [r.month, r.verified, r.share])).toEqual([
      ["2026-07", 90, 55],
      ["2026-08", 100, 60],
    ]);
    const all = mixSourceRows(points, "generation");
    expect(all.at(-1)).toMatchObject({
      month: "2026-08",
      verified: 167,
      curtailed: 0,
      share: null,
    });
  });

  it("adds the share of wind and solar to the curtailment rows", () => {
    const rows = [{ month: "2026-08", verified: 1, curtailed: 1, pct: 50, loss: null }];
    const points = [mixPoint("2026-08", "wind", 5, 20), mixPoint("2026-08", "solar", 5, 15)];
    expect(attachShare(rows, points, ["wind", "solar"])[0]?.share).toBe(35);
    expect(attachShare(rows, points, ["wind"])[0]?.share).toBe(20);
    expect(attachShare(rows, [], ["wind"])[0]?.share).toBeUndefined();
  });
});
