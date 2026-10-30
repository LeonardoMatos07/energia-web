import { describe, expect, it } from "vitest";
import type { BalancePoint } from "@/lib/api/types";
import {
  dailyAverage,
  interchangeByPair,
  latestRenewableShare,
  mean,
  renewableShare,
  sinHourly,
  thermalByReason,
} from "./system";

const point = (subsystem: BalancePoint["subsystem"], hour: string, mw: number): BalancePoint => ({
  hour,
  hour_utc: hour,
  subsystem,
  hydro_mw_avg: mw,
  thermal_mw_avg: mw / 2,
  wind_mw_avg: null,
  solar_mw_avg: 0,
  load_mw_avg: mw * 2,
  net_interchange_mw_avg: null,
});

describe("sinHourly", () => {
  it("adds the subsystems of each hour and keeps hours in order", () => {
    const rows = sinHourly([
      point("N", "2026-09-01T01:00:00", 100),
      point("SE", "2026-09-01T00:00:00", 200),
      point("S", "2026-09-01T01:00:00", 300),
    ]);
    expect(rows.map((row) => row.hour)).toEqual(["2026-09-01T00:00:00", "2026-09-01T01:00:00"]);
    expect(rows[1]).toMatchObject({
      hydro: 400,
      thermal: 200,
      generation: 600,
      load: 800,
      net: null,
    });
  });
});

describe("renewableShare", () => {
  it("is the renewable part of the generation, or null without generation", () => {
    expect(renewableShare({ hydro: 50, thermal: 25, wind: 20, solar: 5 })).toBe(75);
    expect(renewableShare({ hydro: 0, thermal: 0, wind: 0, solar: 0 })).toBeNull();
  });
});

describe("mean", () => {
  it("ignores missing values", () => {
    expect(mean([2, null, 4])).toBe(3);
    expect(mean([null])).toBeNull();
  });
});

describe("latestRenewableShare", () => {
  it("uses the last month of the SIN", () => {
    const row = (month: string, source: "hydro" | "thermal", energy_mwh: number) => ({
      month,
      subsystem: "SIN" as const,
      source,
      energy_mwh,
      avg_mw: 0,
      peak_mw: 0,
      share_pct: null,
    });
    const result = latestRenewableShare([
      row("2026-07", "hydro", 10),
      row("2026-08", "hydro", 90),
      row("2026-08", "thermal", 10),
    ]);
    expect(result).toEqual({ month: "2026-08", pct: 90 });
  });
});

describe("thermalByReason", () => {
  it("sums every point given per known reason, skipping the total", () => {
    const row = (reason: string, verified_mwh: number) => ({
      month: "2026-09",
      reason,
      subsystem: "N",
      plant_code: null,
      plant_name: null,
      plants: 1,
      verified_mwh,
      programmed_mwh: null,
    });
    const result = thermalByReason([
      row("export", 10),
      row("export", 5),
      row("merit_order", 40),
      row("total", 999),
    ]);
    expect(result.rows.map((r) => [r.reason, r.mwh])).toEqual([
      ["merit_order", 40],
      ["export", 15],
    ]);
    expect(thermalByReason([]).rows).toEqual([]);
  });
});

describe("dailyAverage", () => {
  it("averages the hours of each day", () => {
    const hour = (h: string, mw: number, load: number | null) => ({
      hour: h,
      hydro: mw,
      thermal: 0,
      wind: 0,
      solar: 0,
      generation: mw,
      load,
      net: null,
    });
    const rows = dailyAverage([
      hour("2026-09-02T00:00:00", 10, 100),
      hour("2026-09-01T00:00:00", 10, 100),
      hour("2026-09-01T01:00:00", 30, null),
    ]);
    expect(rows.map((r) => r.hour)).toEqual(["2026-09-01", "2026-09-02"]);
    expect(rows[0]).toMatchObject({ hydro: 20, generation: 20, load: 100 });
  });
});

describe("interchangeByPair", () => {
  const point = (origin: string, destination: string, avg_mw: number, month = "2026-08") => ({
    month,
    origin,
    destination,
    scope: "national" as const,
    energy_mwh: 0,
    scheduled_energy_mwh: null,
    avg_mw,
    peak_mw: Math.abs(avg_mw) * 2,
    min_mw: -Math.abs(avg_mw),
  });

  it("averages the months, orients by sign and sorts by size", () => {
    const rows = interchangeByPair(
      [point("N", "NE", -100), point("N", "NE", -300, "2026-09"), point("S", "SE", 50)],
      "SIN",
    );
    expect(rows.map((r) => [r.from, r.to, r.avgMw])).toEqual([
      ["NE", "N", 200],
      ["S", "SE", 50],
    ]);
  });

  it("keeps only the pairs of the selected subsystem", () => {
    const rows = interchangeByPair([point("N", "NE", 10), point("S", "SE", 50)], "SE");
    expect(rows.map((r) => r.key)).toEqual(["S-SE"]);
  });
});
