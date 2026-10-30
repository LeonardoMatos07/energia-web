import type { PldPoint, ReliabilityDistributor, Subsystem } from "@/lib/api/types";
import { SUBSYSTEMS } from "@/lib/geo";

export const PLD_COLORS: Record<Subsystem, string> = {
  SE: "var(--color-series-1)",
  NE: "var(--color-series-2)",
  S: "var(--color-series-3)",
  N: "var(--color-series-4)",
};

export function parseSubsystem(value: string | undefined): Subsystem {
  const upper = (value ?? "").toUpperCase();
  return SUBSYSTEMS.some((item) => item.id === upper) ? (upper as Subsystem) : "SE";
}

export function subsystemLabel(id: Subsystem): string {
  return SUBSYSTEMS.find((item) => item.id === id)?.name ?? id;
}

export const toMonth = (isoDate: string) => isoDate.slice(0, 7);

/** One row per month with a column per submarket, for the line chart. */
export function pldRows(points: readonly PldPoint[]) {
  const rows = new Map<string, Record<string, string | number>>();
  for (const point of points) {
    const month = toMonth(point.period);
    const row = rows.get(month) ?? { month };
    row[point.subsystem] = point.pld_avg_brl_per_mwh;
    rows.set(month, row);
  }
  return [...rows.values()].sort((a, b) => String(a.month).localeCompare(String(b.month)));
}

export type LimitStatus = "within" | "above" | "partial" | "unknown";

/** The ANEEL limit is annual: it only applies to a full year of data. */
export function limitStatus(item: ReliabilityDistributor, kind: "dec" | "fec"): LimitStatus {
  const limit = kind === "dec" ? item.dec_limit_hours : item.fec_limit_count;
  const value = kind === "dec" ? item.dec_hours : item.fec_count;
  if (limit === null) return "unknown";
  if (item.months_with_data < 12) return "partial";
  return value > limit ? "above" : "within";
}

export const LIMIT_LABEL: Record<LimitStatus, string> = {
  within: "Dentro do limite",
  above: "Acima do limite",
  partial: "Ano em andamento",
  unknown: "Sem limite informado",
};
