import type { ChartRow } from "@/components/charts/types";
import { findState } from "./geo";
import { pickEnergyUnit } from "./series";

export type EntityKind = "plant" | "state" | "subsystem";

export interface EntityRef {
  kind: EntityKind;
  id: string;
}

export const MAX_ENTITIES = 6;

const TOKEN_PREFIX: Record<EntityKind, string> = { plant: "u", state: "e", subsystem: "s" };
const SUBSYSTEM_IDS = new Set(["N", "NE", "S", "SE", "SIN"]);
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function entityToken(ref: EntityRef): string {
  return `${TOKEN_PREFIX[ref.kind]}:${ref.id}`;
}

/** A comparison that starts with the page's own state, plant or subsystem already chosen. */
export function compareHref(ref: EntityRef): string {
  return `/comparar?itens=${encodeURIComponent(entityToken(ref))}`;
}

export function serializeEntities(refs: readonly EntityRef[]): string {
  return refs.map(entityToken).join(",");
}

function parseToken(token: string): EntityRef | null {
  const separator = token.indexOf(":");
  if (separator < 1) return null;
  const prefix = token.slice(0, separator);
  const value = token.slice(separator + 1).trim();
  if (prefix === TOKEN_PREFIX.plant && value.length <= 120 && SLUG_RE.test(value)) {
    return { kind: "plant", id: value };
  }
  if (prefix === TOKEN_PREFIX.state) {
    const state = findState(value);
    return state ? { kind: "state", id: state.state } : null;
  }
  if (prefix === TOKEN_PREFIX.subsystem && SUBSYSTEM_IDS.has(value.toUpperCase())) {
    return { kind: "subsystem", id: value.toUpperCase() };
  }
  return null;
}

export function parseEntities(raw: string | null | undefined): EntityRef[] {
  const seen = new Set<string>();
  const refs: EntityRef[] = [];
  for (const token of (raw ?? "").split(",")) {
    const ref = parseToken(token.trim());
    if (!ref) continue;
    const key = entityToken(ref);
    if (seen.has(key)) continue;
    seen.add(key);
    refs.push(ref);
    if (refs.length === MAX_ENTITIES) break;
  }
  return refs;
}

export interface MonthValues {
  month: string;
  verified: number;
  curtailed: number;
  pct: number | null;
  loss: number | null;
}

export type SourceFilter = "all" | "wind" | "solar";

export const SOURCE_FILTERS: { value: SourceFilter; label: string; param: string }[] = [
  { value: "all", label: "Todas", param: "todas" },
  { value: "wind", label: "Eólica", param: "eolica" },
  { value: "solar", label: "Solar", param: "solar" },
];

export interface CompareEntity extends EntityRef {
  key: string;
  label: string;
  color: string;
  rows: MonthValues[];
  bySource: Record<SourceFilter, MonthValues[]>;
}

export function withSource(entity: CompareEntity, source: SourceFilter): CompareEntity {
  return { ...entity, rows: entity.bySource[source] };
}

export type MetricKey = "verified" | "curtailed" | "loss" | "pct";
export type UnitGroup = "energy" | "money" | "percent";

export const METRIC_ORDER: readonly MetricKey[] = ["verified", "curtailed", "loss", "pct"];

export const METRICS: Record<
  MetricKey,
  { label: string; additive: boolean; group: UnitGroup; param: string }
> = {
  verified: { label: "Geração verificada", additive: true, group: "energy", param: "gerado" },
  curtailed: { label: "Energia cortada", additive: true, group: "energy", param: "cortado" },
  loss: { label: "Perda estimada (R$)", additive: true, group: "money", param: "perda" },
  pct: { label: "% de corte", additive: false, group: "percent", param: "percentual" },
};

export type Layout = "items" | "separate";
export type KindChoice = "line" | "bar" | "pie";

export interface ViewState {
  metrics: MetricKey[];
  layout: Layout | null;
  kind: KindChoice;
  source: SourceFilter;
}

export const DEFAULT_METRICS: MetricKey[] = ["verified", "curtailed"];

const LAYOUT_PARAM: Record<Layout, string> = { items: "itens", separate: "separado" };
const KIND_PARAM: Record<KindChoice, string> = { line: "linhas", bar: "barras", pie: "pizza" };

function paramToKey<T extends string>(table: Record<T, string>, value: string | undefined) {
  return (Object.keys(table) as T[]).find((key) => table[key] === value);
}

export function parseView(params: {
  metricas?: string | undefined;
  modo?: string | undefined;
  grafico?: string | undefined;
  fonte?: string | undefined;
}): ViewState {
  const wanted = new Set((params.metricas ?? "").split(",").map((part) => part.trim()));
  const metrics = METRIC_ORDER.filter((metric) => wanted.has(METRICS[metric].param));
  return {
    metrics: metrics.length > 0 ? metrics : [...DEFAULT_METRICS],
    layout: paramToKey(LAYOUT_PARAM, params.modo) ?? null,
    kind: paramToKey(KIND_PARAM, params.grafico) ?? "line",
    source: SOURCE_FILTERS.find((option) => option.param === params.fonte)?.value ?? "all",
  };
}

export function applyViewParams(search: URLSearchParams, view: ViewState): URLSearchParams {
  const next = new URLSearchParams(search);
  const isDefaultMetrics =
    view.metrics.length === DEFAULT_METRICS.length &&
    DEFAULT_METRICS.every((metric) => view.metrics.includes(metric));
  if (isDefaultMetrics) next.delete("metricas");
  else next.set("metricas", view.metrics.map((metric) => METRICS[metric].param).join(","));
  if (view.layout) next.set("modo", LAYOUT_PARAM[view.layout]);
  else next.delete("modo");
  if (view.kind === "line") next.delete("grafico");
  else next.set("grafico", KIND_PARAM[view.kind]);
  const sourceParam = SOURCE_FILTERS.find((option) => option.value === view.source)?.param;
  if (view.source === "all" || !sourceParam) next.delete("fonte");
  else next.set("fonte", sourceParam);
  return next;
}

export interface MetricUnit {
  unit: string;
  divisor: number;
  digits: number;
}

function metricValue(row: MonthValues, metric: MetricKey): number | null {
  switch (metric) {
    case "curtailed":
      return row.curtailed;
    case "verified":
      return row.verified;
    case "pct":
      return row.pct;
    case "loss":
      return row.loss;
  }
}

export function metricUnit(entities: readonly CompareEntity[], metric: MetricKey): MetricUnit {
  if (metric === "pct") return { unit: "%", divisor: 1, digits: 1 };
  const max = Math.max(
    0,
    ...entities.flatMap((entity) => entity.rows.map((row) => metricValue(row, metric) ?? 0)),
  );
  if (metric === "loss") {
    return max >= 1e7
      ? { unit: "R$ milhões", divisor: 1e6, digits: 1 }
      : { unit: "R$ mil", divisor: 1e3, digits: 0 };
  }
  const energy = pickEnergyUnit(max);
  return { unit: energy.unit, divisor: energy.divisor, digits: energy.digits };
}

function sortedMonths(entities: readonly CompareEntity[]): string[] {
  const months = new Set<string>();
  for (const entity of entities) for (const row of entity.rows) months.add(row.month);
  return [...months].sort();
}

export function buildMetricRows(
  entities: readonly CompareEntity[],
  metric: MetricKey,
  divisor: number,
): ChartRow[] {
  const byEntity = entities.map(
    (entity) => new Map(entity.rows.map((row) => [row.month, row] as const)),
  );
  return sortedMonths(entities).map((month) => {
    const chartRow: ChartRow = { month };
    entities.forEach((entity, index) => {
      const row = byEntity[index]?.get(month);
      const value = row ? metricValue(row, metric) : null;
      chartRow[entity.key] = value === null || value === undefined ? undefined : value / divisor;
    });
    return chartRow;
  });
}

export const SCALE_DISPARITY_RATIO = 15;

export function scaleDisparity(entities: readonly CompareEntity[]): number {
  const totals = entities
    .map((entity) => entity.rows.reduce((sum, row) => sum + row.curtailed, 0))
    .filter((total) => total > 0);
  if (totals.length < 2) return 1;
  return Math.max(...totals) / Math.min(...totals);
}

export function buildSeparateRows(
  entity: CompareEntity,
  metrics: readonly MetricKey[],
  divisor: number,
): ChartRow[] {
  return entity.rows.map((row) => {
    const chartRow: ChartRow = { month: row.month };
    for (const metric of metrics) {
      const value = metricValue(row, metric);
      chartRow[metric] = value === null ? undefined : value / divisor;
    }
    return chartRow;
  });
}

export function groupUnit(entity: CompareEntity, metrics: readonly MetricKey[]): MetricUnit {
  const first = metrics[0];
  if (!first) return { unit: "MWh", divisor: 1, digits: 1 };
  if (METRICS[first].group !== "energy") return metricUnit([entity], first);
  const max = Math.max(
    0,
    ...entity.rows.map((row) =>
      metrics.reduce((sum, metric) => sum + (metricValue(row, metric) ?? 0), 0),
    ),
  );
  const energy = pickEnergyUnit(max);
  return { unit: energy.unit, divisor: energy.divisor, digits: energy.digits };
}

export function groupMetrics(
  metrics: readonly MetricKey[],
): { group: UnitGroup; metrics: MetricKey[] }[] {
  const groups: UnitGroup[] = ["energy", "money", "percent"];
  return groups
    .map((group) => ({
      group,
      metrics: METRIC_ORDER.filter(
        (metric) => metrics.includes(metric) && METRICS[metric].group === group,
      ),
    }))
    .filter((entry) => entry.metrics.length > 0);
}
