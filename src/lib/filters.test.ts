import { describe, expect, it } from "vitest";
import {
  balancePlan,
  clampToLastDays,
  currentMonth,
  hydroRange,
  lastDayOfMonth,
  MAX_DAILY_MONTHS,
  monthsToDays,
  parseFilters,
  parseSubsystemFilter,
} from "./filters";

const params = (query: string) =>
  Object.fromEntries(new URLSearchParams(query)) as Record<string, string>;

describe("parseSubsystemFilter", () => {
  it("accepts the grid and the four subsystems, in any case", () => {
    expect(parseSubsystemFilter("ne")).toBe("NE");
    expect(parseSubsystemFilter("SIN")).toBe("SIN");
    expect(parseSubsystemFilter(["S", "N"])).toBe("S");
  });

  it("falls back to SIN for anything else", () => {
    for (const value of [undefined, "", "XX", "SE;drop", "<script>"]) {
      expect(parseSubsystemFilter(value)).toBe("SIN");
    }
  });
});

describe("parseFilters", () => {
  const first = "2021-01";
  const last = "2026-09";

  it("uses the default 12 months when there is no period", () => {
    expect(parseFilters({}, first, last)).toEqual({
      start: "2025-10",
      end: "2026-09",
      sub: "SIN",
      custom: false,
    });
  });

  it("reads a valid period and subsystem", () => {
    expect(parseFilters(params("de=2026-01&ate=2026-06&sub=SE"), first, last)).toEqual({
      start: "2026-01",
      end: "2026-06",
      sub: "SE",
      custom: true,
    });
  });

  it("falls back safely on invalid, reversed, out-of-range or half periods", () => {
    for (const query of [
      "de=abc&ate=2026-06",
      "de=2026-06&ate=2026-01",
      "de=2020-01&ate=2026-06",
      "de=2026-01&ate=2027-01",
      "de=2026-01",
      "de=2026-13&ate=2026-14",
    ]) {
      expect(parseFilters(params(query), first, last).custom, query).toBe(false);
    }
  });

  it("keeps a valid subsystem when the period is invalid", () => {
    expect(parseFilters(params("de=x&sub=n"), first, last)).toMatchObject({
      custom: false,
      sub: "N",
    });
  });
});

describe("dates", () => {
  it("finds the last day of a month, leap years included", () => {
    expect(lastDayOfMonth("2026-09")).toBe("2026-09-30");
    expect(lastDayOfMonth("2024-02")).toBe("2024-02-29");
    expect(lastDayOfMonth("2026-12")).toBe("2026-12-31");
  });

  it("turns months into days", () => {
    expect(monthsToDays("2026-02", "2026-04")).toEqual({ from: "2026-02-01", to: "2026-04-30" });
  });

  it("names the current month", () => {
    expect(currentMonth(new Date("2026-10-30T12:00:00Z"))).toBe("2026-10");
  });

  it("keeps only the last days of a range that is too long", () => {
    expect(clampToLastDays("2020-01-01", "2026-09-30", 365)).toEqual({
      from: "2025-10-01",
      to: "2026-09-30",
    });
    expect(clampToLastDays("2026-09-10", "2026-09-30", 365).from).toBe("2026-09-10");
  });

  it("never asks the hydrology API for more than 365 days", () => {
    const { from, to } = hydroRange("2021-01", "2026-09");
    expect(to).toBe("2026-09-30");
    expect((Date.parse(to) - Date.parse(from)) / 86_400_000 + 1).toBeLessThanOrEqual(365);
  });
});

describe("balancePlan", () => {
  it("shows the last 7 days without a custom period", () => {
    expect(balancePlan({ start: "2025-10", end: "2026-09", custom: false })).toEqual({
      kind: "recent",
    });
  });

  it("shows one month hour by hour (within the 31 days the API allows)", () => {
    expect(balancePlan({ start: "2026-08", end: "2026-08", custom: true })).toEqual({
      kind: "hourly",
      from: "2026-08-01",
      to: "2026-08-31",
    });
  });

  it("shows several months as daily averages, one request per month, capped", () => {
    const plan = balancePlan({ start: "2026-08", end: "2026-09", custom: true });
    expect(plan).toEqual({
      kind: "daily",
      ranges: [
        { from: "2026-08-01", to: "2026-08-31" },
        { from: "2026-09-01", to: "2026-09-30" },
      ],
    });
    const long = balancePlan({ start: "2021-01", end: "2026-02", custom: true });
    expect(long.kind === "daily" && long.ranges.length).toBe(MAX_DAILY_MONTHS);
    expect(long.kind === "daily" && long.ranges[0]!.from).toBe("2025-09-01");
    expect(long.kind === "daily" && long.ranges.at(-1)!.to).toBe("2026-02-28");
  });
});
