import type {
  BalancePoint,
  GenerationMixPoint,
  GenerationSource,
  ThermalDispatchPoint,
} from "@/lib/api/types";
import { normalizeMonth } from "@/lib/series";

/** One hour of the whole grid (SIN): the subsystems of the hour added up, in MW. */
export interface SinHour {
  hour: string;
  hydro: number;
  thermal: number;
  wind: number;
  solar: number;
  generation: number;
  load: number | null;
  net: number | null;
}

const add = (a: number | null, b: number | null) => (b === null ? a : a === null ? b : a + b);

/** Adds the four subsystems of each hour; hours come back in order. */
export function sinHourly(points: readonly BalancePoint[]): SinHour[] {
  const byHour = new Map<string, SinHour>();
  for (const point of points) {
    const row = byHour.get(point.hour) ?? {
      hour: point.hour,
      hydro: 0,
      thermal: 0,
      wind: 0,
      solar: 0,
      generation: 0,
      load: null,
      net: null,
    };
    row.hydro += point.hydro_mw_avg ?? 0;
    row.thermal += point.thermal_mw_avg ?? 0;
    row.wind += point.wind_mw_avg ?? 0;
    row.solar += point.solar_mw_avg ?? 0;
    row.load = add(row.load, point.load_mw_avg);
    row.net = add(row.net, point.net_interchange_mw_avg);
    byHour.set(point.hour, row);
  }
  return [...byHour.values()]
    .map((row) => ({ ...row, generation: row.hydro + row.thermal + row.wind + row.solar }))
    .sort((a, b) => a.hour.localeCompare(b.hour));
}

/** Share of the generation that is renewable (hydro, wind and solar), 0 to 100. */
export function renewableShare(row: Pick<SinHour, "hydro" | "thermal" | "wind" | "solar">) {
  const total = row.hydro + row.thermal + row.wind + row.solar;
  return total > 0 ? ((row.hydro + row.wind + row.solar) / total) * 100 : null;
}

export function mean(values: readonly (number | null)[]): number | null {
  const present = values.filter((value): value is number => value !== null);
  return present.length ? present.reduce((sum, value) => sum + value, 0) / present.length : null;
}

export const SOURCE_LABELS: Record<GenerationSource, string> = {
  hydro: "Hidrelétrica",
  thermal: "Termelétrica",
  wind: "Eólica",
  solar: "Solar",
};

/** Fixed colour per source, the same in the pie, the stacked charts and the legends. */
export const SOURCE_FILL: Record<GenerationSource, string> = {
  hydro: "#2f6fb5",
  wind: "#2a9d8f",
  solar: "#e9a820",
  thermal: "#d9532f",
};

export const SOURCE_ORDER: readonly GenerationSource[] = ["hydro", "wind", "solar", "thermal"];

/** SIN total generation per month, in MWh, oldest first. */
export function sinMonthlyTotals(points: readonly GenerationMixPoint[]) {
  const totals = new Map<string, number>();
  for (const point of points) {
    if (point.subsystem !== "SIN") continue;
    const month = normalizeMonth(point.month);
    totals.set(month, (totals.get(month) ?? 0) + point.energy_mwh);
  }
  return [...totals]
    .map(([month, energy_mwh]) => ({ month, energy_mwh }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

/** Renewable share of the SIN in the last month of the mix. */
export function latestRenewableShare(points: readonly GenerationMixPoint[]) {
  const sin = points.filter((point) => point.subsystem === "SIN");
  const month = sin
    .map((point) => normalizeMonth(point.month))
    .sort()
    .at(-1);
  if (!month) return null;
  const rows = sin.filter((point) => normalizeMonth(point.month) === month);
  const total = rows.reduce((sum, row) => sum + row.energy_mwh, 0);
  const renewable = rows
    .filter((row) => row.source !== "thermal")
    .reduce((sum, row) => sum + row.energy_mwh, 0);
  return total > 0 ? { month, pct: (renewable / total) * 100 } : null;
}

/**
 * Why thermal plants were dispatched. "total" and the finer inflexibility/merit splits are left
 * out so nothing is counted twice.
 */
export const THERMAL_REASONS: Record<string, string> = {
  merit_order: "Ordem de mérito (custo)",
  inflexibility: "Inflexibilidade",
  electrical_reason: "Razão elétrica",
  export: "Exportação",
  unit_commitment: "Compromisso de unidade",
  constrained_off: "Restrição de operação",
  gsub: "GSUB",
};

export function thermalByReason(points: readonly ThermalDispatchPoint[]) {
  const month = points
    .map((point) => normalizeMonth(point.month))
    .sort()
    .at(-1);
  if (!month) return null;
  const totals = new Map<string, number>();
  for (const point of points) {
    if (normalizeMonth(point.month) !== month || !(point.reason in THERMAL_REASONS)) continue;
    totals.set(point.reason, (totals.get(point.reason) ?? 0) + point.verified_mwh);
  }
  const rows = [...totals]
    .map(([reason, mwh]) => ({ reason, label: THERMAL_REASONS[reason]!, mwh }))
    .filter((row) => row.mwh > 0)
    .sort((a, b) => b.mwh - a.mwh);
  return { month, rows };
}
