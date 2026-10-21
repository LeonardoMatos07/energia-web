import type { ChartRow } from "@/components/charts/types";

export function sortByMonth<T extends { month: string }>(rows: readonly T[]): T[] {
  return [...rows].sort((a, b) => a.month.localeCompare(b.month));
}

export function latest<T extends { month: string }>(rows: readonly T[]): T | undefined {
  return sortByMonth(rows).at(-1);
}

export function normalizeMonth(month: string): string {
  return month.slice(0, 7);
}

export type EnergyUnit = { unit: "MWh" | "GWh"; divisor: number; digits: number };

export function pickEnergyUnit(maxMwh: number): EnergyUnit {
  return maxMwh >= 10_000
    ? { unit: "GWh", divisor: 1000, digits: 1 }
    : { unit: "MWh", divisor: 1, digits: maxMwh >= 100 ? 0 : 1 };
}

export function pivotByMonth<T extends { month: string }>(
  rows: readonly T[],
  categoryOf: (row: T) => string,
  valueOf: (row: T) => number | null,
): ChartRow[] {
  const byMonth = new Map<string, ChartRow>();
  for (const row of rows) {
    const month = normalizeMonth(row.month);
    const entry = byMonth.get(month) ?? { month };
    entry[categoryOf(row)] = valueOf(row);
    byMonth.set(month, entry);
  }
  return [...byMonth.values()].sort((a, b) => a.month.localeCompare(b.month));
}

export function fillMonthGaps(rows: readonly ChartRow[]): ChartRow[] {
  const first = rows[0];
  const last = rows[rows.length - 1];
  if (!first || !last) return [];
  const byMonth = new Map(rows.map((row) => [row.month, row]));
  const filled: ChartRow[] = [];
  let [year, monthNumber] = first.month.split("-").map(Number) as [number, number];
  for (let month = first.month; month <= last.month;) {
    filled.push(byMonth.get(month) ?? { month });
    monthNumber += 1;
    if (monthNumber > 12) {
      monthNumber = 1;
      year += 1;
    }
    month = `${year}-${String(monthNumber).padStart(2, "0")}`;
  }
  return filled;
}
