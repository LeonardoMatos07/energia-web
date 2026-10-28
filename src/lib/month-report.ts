import type { ReportSummary } from "@/lib/api/types";

/** The report written for a month ("2026-09"), if one was published. */
export function reportForMonth(
  reports: readonly ReportSummary[] | undefined,
  month: string,
): ReportSummary | null {
  return reports?.find((report) => report.month.slice(0, 7) === month) ?? null;
}
