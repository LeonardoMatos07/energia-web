import { describe, expect, it } from "vitest";
import type { PldPoint, ReliabilityDistributor } from "@/lib/api/types";
import { limitStatus, parseSubsystem, pldRows } from "./market";

const distributor = (overrides: Partial<ReliabilityDistributor> = {}): ReliabilityDistributor => ({
  cnpj: "1",
  acronym: "EDP ES",
  consumers: 100,
  dec_hours: 8,
  fec_count: 4,
  dec_limit_hours: 10,
  fec_limit_count: 5,
  months_with_data: 12,
  sets: 3,
  ...overrides,
});

describe("market helpers", () => {
  it("parses the submarket and falls back to Sudeste", () => {
    expect(parseSubsystem("ne")).toBe("NE");
    expect(parseSubsystem("xx")).toBe("SE");
    expect(parseSubsystem(undefined)).toBe("SE");
  });

  it("turns monthly points into one row per month", () => {
    const point = (period: string, subsystem: PldPoint["subsystem"], value: number): PldPoint => ({
      period,
      subsystem,
      pld_avg_brl_per_mwh: value,
      pld_min_brl_per_mwh: null,
      pld_max_brl_per_mwh: null,
      pld_std_brl_per_mwh: null,
      hours_at_floor: null,
      hours_at_cap: null,
      hours: null,
    });

    expect(
      pldRows([
        point("2026-02-01", "SE", 100),
        point("2026-01-01", "SE", 90),
        point("2026-01-01", "NE", 80),
      ]),
    ).toEqual([
      { month: "2026-01", SE: 90, NE: 80 },
      { month: "2026-02", SE: 100 },
    ]);
  });

  it("only compares with the annual limit when the year is complete", () => {
    expect(limitStatus(distributor(), "dec")).toBe("within");
    expect(limitStatus(distributor({ dec_hours: 11 }), "dec")).toBe("above");
    expect(limitStatus(distributor({ months_with_data: 8, dec_hours: 11 }), "dec")).toBe("partial");
    expect(limitStatus(distributor({ dec_limit_hours: null }), "dec")).toBe("unknown");
    expect(limitStatus(distributor({ fec_count: 6 }), "fec")).toBe("above");
  });
});
