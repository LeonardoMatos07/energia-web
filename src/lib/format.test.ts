import { describe, expect, it } from "vitest";
import {
  EMPTY,
  formatBRL,
  formatBRLCompact,
  formatDateTime,
  formatEnergy,
  formatSource,
  formatGWh,
  formatShortMonth,
  formatLongMonth,
  formatMWh,
  formatNumber,
  formatPercent,
} from "./format";

const nbsp = (s: string) => s.replace(/ /g, " ");

describe("formatNumber", () => {
  it("uses Brazilian separators", () => {
    expect(formatNumber(1234567.891, 2)).toBe("1.234.567,89");
    expect(formatNumber(0.5, 1)).toBe("0,5");
  });
  it("returns a dash for missing values", () => {
    expect(formatNumber(null)).toBe(EMPTY);
    expect(formatNumber(undefined)).toBe(EMPTY);
    expect(formatNumber(Number.NaN)).toBe(EMPTY);
  });
});

describe("energy", () => {
  it("always shows the unit", () => {
    expect(formatMWh(850.25)).toBe("850,3 MWh");
    expect(formatGWh(1_234_500)).toBe("1.234,5 GWh");
  });
  it("switches to GWh from 1.000 MWh", () => {
    expect(formatEnergy(999)).toBe("999 MWh");
    expect(formatEnergy(1500)).toBe("1,5 GWh");
    expect(formatEnergy(null)).toBe(EMPTY);
  });
});

describe("formatPercent", () => {
  it("formats a 0-100 value", () => {
    expect(formatPercent(12.345)).toBe("12,3%");
    expect(formatPercent(7, 2)).toBe("7%");
    expect(formatPercent(70, 1, 1)).toBe("70,0%");
    expect(formatPercent(null)).toBe(EMPTY);
  });
});

describe("money", () => {
  it("formats reais", () => {
    expect(nbsp(formatBRL(1234567))).toBe("R$ 1.234.567");
  });
  it("compacts large values with Portuguese words", () => {
    expect(formatBRLCompact(12_345_678)).toBe("R$ 12,3 milhões");
    expect(formatBRLCompact(1_500_000)).toBe("R$ 1,5 milhão");
    expect(formatBRLCompact(2_100_000_000)).toBe("R$ 2,1 bilhões");
    expect(formatBRLCompact(45_000)).toBe("R$ 45 mil");
    expect(formatBRLCompact(7_712)).toBe("R$ 7,7 mil");
    expect(formatBRLCompact(345_600)).toBe("R$ 346 mil");
    expect(nbsp(formatBRLCompact(950))).toBe("R$ 950");
  });
});

describe("months and dates", () => {
  it("formats YYYY-MM", () => {
    expect(formatShortMonth("2026-09")).toBe("set/2026");
    expect(formatLongMonth("2024-03")).toBe("março de 2024");
    expect(formatShortMonth("2026-09-01")).toBe("set/2026");
    expect(formatShortMonth("garbage")).toBe(EMPTY);
    expect(formatShortMonth("2026-13")).toBe(EMPTY);
  });
  it("shows timestamps in Brasília time", () => {
    expect(formatDateTime("2026-10-20T15:05:00Z")).toBe("20/10/2026, 12:05");
  });
});

describe("formatSource", () => {
  it("translates sources", () => {
    expect(formatSource("wind")).toBe("Eólica");
    expect(formatSource("total")).toBe("Eólica + solar");
  });
});
