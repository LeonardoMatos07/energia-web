import { describe, expect, it } from "vitest";
import type { ReportSummary } from "@/lib/api/types";
import { reportForMonth } from "./month-report";

const report = (month: string, slug: string) => ({ month, slug }) as ReportSummary;

describe("reportForMonth", () => {
  const reports = [
    report("2026-09-01", "curtailment-2026-09"),
    report("2026-08", "curtailment-2026-08"),
  ];

  it("finds the report of a month whatever the date format", () => {
    expect(reportForMonth(reports, "2026-09")?.slug).toBe("curtailment-2026-09");
    expect(reportForMonth(reports, "2026-08")?.slug).toBe("curtailment-2026-08");
  });

  it("returns null when there is none, or no list", () => {
    expect(reportForMonth(reports, "2021-10")).toBeNull();
    expect(reportForMonth(undefined, "2026-09")).toBeNull();
  });
});
