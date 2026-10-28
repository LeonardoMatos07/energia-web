export type ChartKind = "bar" | "stacked-bar" | "line";

export interface ChartSeries {
  name: string;
  values: number[];
}

/** A chart inside a report: a fenced `chart` block whose body is this JSON. */
export interface ChartSpec {
  type: ChartKind;
  title: string;
  unit: string;
  labels: string[];
  series: ChartSeries[];
}

const KINDS: readonly ChartKind[] = ["bar", "stacked-bar", "line"];
const MAX_LABELS = 48;
const MAX_SERIES = 6;

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((v) => typeof v === "string");
}

/** The spec, or null when the block is not a valid chart (it is then shown as plain code). */
export function parseChartSpec(raw: string): ChartSpec | null {
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return null;
  }
  if (typeof data !== "object" || data === null) return null;
  const { type = "bar", title, unit = "", labels, series } = data as Record<string, unknown>;
  if (typeof type !== "string" || !KINDS.includes(type as ChartKind)) return null;
  if (typeof title !== "string" || typeof unit !== "string") return null;
  if (!isStringArray(labels) || labels.length === 0 || labels.length > MAX_LABELS) return null;
  if (!Array.isArray(series) || series.length === 0 || series.length > MAX_SERIES) return null;
  const parsed: ChartSeries[] = [];
  for (const item of series) {
    if (typeof item !== "object" || item === null) return null;
    const { name, values } = item as Record<string, unknown>;
    if (typeof name !== "string") return null;
    if (!Array.isArray(values) || values.length !== labels.length) return null;
    if (!values.every((v) => typeof v === "number" && Number.isFinite(v))) return null;
    parsed.push({ name, values: values as number[] });
  }
  return { type: type as ChartKind, title, unit, labels, series: parsed };
}

/** Rows for Recharts: one object per label, one key per series. */
export function chartRows(spec: ChartSpec): Record<string, string | number>[] {
  return spec.labels.map((label, index) => ({
    label,
    ...Object.fromEntries(spec.series.map((s, i) => [`s${i}`, s.values[index] as number])),
  }));
}
