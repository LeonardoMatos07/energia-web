import type { ChartRow } from "@/components/charts/types";

/** Rows sorted by `mes` ascending (YYYY-MM sorts lexicographically). */
export function sortByMes<T extends { mes: string }>(rows: readonly T[]): T[] {
  return [...rows].sort((a, b) => a.mes.localeCompare(b.mes));
}

export function latest<T extends { mes: string }>(rows: readonly T[]): T | undefined {
  return sortByMes(rows).at(-1);
}

/** The API returns `mes` as `YYYY-MM`; tolerate a full date just in case. */
export function normalizeMes(mes: string): string {
  return mes.slice(0, 7);
}

export type EnergyUnit = { unit: "MWh" | "GWh"; divisor: number; digits: number };

/** GWh when the largest value is at least 10 GWh; MWh otherwise (small plants). */
export function pickEnergyUnit(maxMwh: number): EnergyUnit {
  return maxMwh >= 10_000
    ? { unit: "GWh", divisor: 1000, digits: 1 }
    : { unit: "MWh", divisor: 1, digits: maxMwh >= 100 ? 0 : 1 };
}

/**
 * Pivots long rows (one per month and category) into chart rows (one per month).
 * `categoryOf` picks the series key; `valueOf` the value (already converted to the unit).
 */
export function pivotByMonth<T extends { mes: string }>(
  rows: readonly T[],
  categoryOf: (row: T) => string,
  valueOf: (row: T) => number | null,
): ChartRow[] {
  const byMonth = new Map<string, ChartRow>();
  for (const row of rows) {
    const mes = normalizeMes(row.mes);
    const entry = byMonth.get(mes) ?? { mes };
    entry[categoryOf(row)] = valueOf(row);
    byMonth.set(mes, entry);
  }
  return [...byMonth.values()].sort((a, b) => a.mes.localeCompare(b.mes));
}
