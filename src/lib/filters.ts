import type { Subsystem } from "@/lib/api/types";
import { SUBSYSTEMS } from "@/lib/geo";
import { resolvePeriod } from "@/lib/period";
import { defaultPeriod } from "@/lib/series";

export type SearchParams = Record<string, string | string[] | undefined>;
export type SubsystemFilter = "SIN" | Subsystem;

/** The grid as a whole plus the four subsystems, in the order the filter shows them. */
export const SUBSYSTEM_FILTERS: readonly { id: SubsystemFilter; label: string }[] = [
  { id: "SIN", label: "Brasil" },
  ...SUBSYSTEMS.map((item) => ({ id: item.id, label: item.name })),
];

/** The API accepts at most this many days of hourly balance per request. */
export const MAX_BALANCE_DAYS = 31;
/** The API accepts at most this many days of daily hydrology per request. */
export const MAX_HYDRO_DAYS = 365;
/** Months shown, at most, in the daily load and generation chart (one request per month). */
export const MAX_DAILY_MONTHS = 6;
/** First month the site has data for; the month pickers start here. */
export const FIRST_MONTH = "2021-01";

const DAY_MS = 86_400_000;

export function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/** Anything that is not one of SIN, N, NE, S or SE falls back to the whole country. */
export function parseSubsystemFilter(value: string | string[] | undefined): SubsystemFilter {
  const upper = (firstParam(value) ?? "").toUpperCase();
  return SUBSYSTEM_FILTERS.some((item) => item.id === upper) ? (upper as SubsystemFilter) : "SIN";
}

export function subsystemFilterLabel(id: SubsystemFilter): string {
  return SUBSYSTEM_FILTERS.find((item) => item.id === id)?.label ?? id;
}

export function currentMonth(now: Date = new Date()): string {
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function lastDayOfMonth(month: string): string {
  const [year, monthNumber] = month.split("-").map(Number) as [number, number];
  const day = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
  return `${month}-${String(day).padStart(2, "0")}`;
}

/** First and last day (YYYY-MM-DD) covered by a range of months. */
export function monthsToDays(start: string, end: string) {
  return { from: `${start}-01`, to: lastDayOfMonth(end) };
}

export function isoDay(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Cuts the range to its last `maxDays` days (the API rejects longer ones). */
export function clampToLastDays(from: string, to: string, maxDays: number) {
  const earliest = isoDay(new Date(Date.parse(`${to}T00:00:00Z`) - (maxDays - 1) * DAY_MS));
  return { from: from < earliest ? earliest : from, to };
}

export interface Filters {
  start: string;
  end: string;
  sub: SubsystemFilter;
  /** True when the URL asks for a period other than the default one. */
  custom: boolean;
}

/**
 * Reads ?de=&ate=&sub= with the same rules as the curtailment dashboard: an invalid or
 * out-of-range period (or half a period) falls back to the default, an invalid subsystem to SIN.
 */
export function parseFilters(params: SearchParams, first: string, last: string): Filters {
  const { start, end } = resolvePeriod(params, first, last);
  const fallback = defaultPeriod(first, last);
  return {
    start,
    end,
    sub: parseSubsystemFilter(params.sub),
    custom: start !== fallback.start || end !== fallback.end,
  };
}

export type BalancePlan =
  | { kind: "recent" }
  | { kind: "hourly"; from: string; to: string }
  | { kind: "daily"; ranges: { from: string; to: string }[] };

function previousMonth(month: string): string {
  const [year, number] = month.split("-").map(Number) as [number, number];
  return number === 1 ? `${year - 1}-12` : `${year}-${String(number - 1).padStart(2, "0")}`;
}

/**
 * What the load and generation chart shows. Without a custom period, the last 7 days hour by
 * hour (what the API returns by default). One month: that month hour by hour. Several months:
 * daily averages of the last MAX_DAILY_MONTHS of them.
 */
export function balancePlan(filters: Pick<Filters, "start" | "end" | "custom">): BalancePlan {
  if (!filters.custom) return { kind: "recent" };
  if (filters.start === filters.end) {
    return { kind: "hourly", ...monthsToDays(filters.start, filters.end) };
  }
  const months: string[] = [];
  for (
    let month = filters.end;
    month >= filters.start && months.length < MAX_DAILY_MONTHS;
    month = previousMonth(month)
  ) {
    months.unshift(month);
  }
  return { kind: "daily", ranges: months.map((month) => monthsToDays(month, month)) };
}

/** Day range for the hydrology API, never longer than MAX_HYDRO_DAYS. */
export function hydroRange(start: string, end: string) {
  const { from, to } = monthsToDays(start, end);
  return clampToLastDays(from, to, MAX_HYDRO_DAYS);
}

/** Most windows of MAX_HYDRO_DAYS fetched for one period (about six years). */
export const MAX_HYDRO_CHUNKS = 6;

/**
 * The whole period as consecutive windows the hydrology API accepts (each at most
 * MAX_HYDRO_DAYS long), oldest first. Very long periods keep only their latest windows.
 */
export function hydroChunks(start: string, end: string, maxChunks = MAX_HYDRO_CHUNKS) {
  const { from, to } = monthsToDays(start, end);
  const chunks: { from: string; to: string }[] = [];
  let chunkEnd = to;
  while (chunks.length < maxChunks && chunkEnd >= from) {
    const chunkStart = clampToLastDays(from, chunkEnd, MAX_HYDRO_DAYS).from;
    chunks.unshift({ from: chunkStart, to: chunkEnd });
    chunkEnd = isoDay(new Date(Date.parse(`${chunkStart}T00:00:00Z`) - DAY_MS));
  }
  return chunks;
}
