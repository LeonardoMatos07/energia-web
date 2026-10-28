import type {
  ForecastCalibrationBin,
  ForecastInterval,
  ForecastModelMeta,
  ForecastModelMetrics,
  ForecastPoint,
  ForecastScope,
  Source,
} from "@/lib/api/types";
import { findState, subsystemName } from "@/lib/geo";

export const HIGH_RISK = 0.66;
export const MEDIUM_RISK = 0.33;
export const DEFAULT_SCOPE = "NE";
export const DEFAULT_SOURCE: Source = "wind";

export function parseSource(value: string | undefined): Source {
  return value === "solar" ? "solar" : "wind";
}

/** Accepts only a scope that the API has published for the source; otherwise a safe default. */
export function parseScope(
  value: string | undefined,
  source: Source,
  scopes: readonly ForecastScope[],
): string {
  const wanted = value?.toUpperCase();
  const available = scopes.filter((s) => s.source === source).map((s) => s.scope);
  if (wanted && (available.length === 0 || available.includes(wanted))) return wanted;
  if (available.includes(DEFAULT_SCOPE) || available.length === 0) return DEFAULT_SCOPE;
  return available[0] ?? DEFAULT_SCOPE;
}

export function scopeLabel(scope: string): string {
  if (scope === "SIN") return "Brasil (SIN)";
  const state = findState(scope);
  if (state) return state.name;
  const subsystem = subsystemName(scope);
  return subsystem === scope ? scope : subsystem;
}

export interface ScopeGroup {
  label: string;
  scopes: { value: string; label: string }[];
}

export function groupScopes(scopes: readonly ForecastScope[], source: Source): ScopeGroup[] {
  const mine = scopes.filter((s) => s.source === source).map((s) => s.scope);
  const national: string[] = mine.filter((s) => s === "SIN");
  const subsystems = mine.filter((s) => ["N", "NE", "S", "SE"].includes(s));
  const states = mine.filter((s) => !national.includes(s) && !subsystems.includes(s));
  const toOption = (scope: string) => ({ value: scope, label: scopeLabel(scope) });
  return [
    { label: "Brasil", scopes: national.map(toOption) },
    { label: "Subsistemas", scopes: subsystems.map(toOption) },
    {
      label: "Estados",
      scopes: states.map(toOption).sort((a, b) => a.label.localeCompare(b.label)),
    },
  ].filter((group) => group.scopes.length > 0);
}

export function groupByDay(points: readonly ForecastPoint[]) {
  const days = new Map<string, Map<number, ForecastPoint>>();
  for (const point of points) {
    const day = point.ts.slice(0, 10);
    const hour = Number(point.ts.slice(11, 13));
    if (!days.has(day)) days.set(day, new Map());
    days.get(day)?.set(hour, point);
  }
  return [...days.entries()];
}

export interface ForecastSummary {
  applicableHours: number;
  highHours: number;
  peak: ForecastPoint | null;
  /** Average expected curtailment over the applicable hours, in percent. */
  meanExpectedPct: number | null;
}

export function summarize(points: readonly ForecastPoint[]): ForecastSummary {
  const applicable = points.filter((p) => p.applicable);
  const peak = applicable.reduce<ForecastPoint | null>(
    (best, p) => (best === null || p.risk_probability > best.risk_probability ? p : best),
    null,
  );
  const total = applicable.reduce((sum, p) => sum + p.expected_curtailment_pct, 0);
  return {
    applicableHours: applicable.length,
    highHours: applicable.filter((p) => p.risk_probability >= HIGH_RISK).length,
    peak,
    meanExpectedPct: applicable.length ? total / applicable.length : null,
  };
}

/** Hourly rows for the chart: hours that do not apply (solar night) become gaps. */
export function chartRows(points: readonly ForecastPoint[]) {
  return points.map((p) => ({
    ts: p.ts,
    expected: p.applicable ? p.expected_curtailment_pct : null,
    risk: p.applicable ? p.risk_probability * 100 : null,
  }));
}

export const MODEL_ORDER = ["hist_gbm", "seasonal_naive", "climatology"] as const;
export type ModelKey = (typeof MODEL_ORDER)[number];

export const MODEL_LABEL: Record<ModelKey, string> = {
  hist_gbm: "Modelo (gradient boosting)",
  seasonal_naive: "Referência: mesma hora da semana passada",
  climatology: "Referência: média histórica do mês e da hora",
};

export interface ResultRow {
  key: ModelKey;
  label: string;
  isModel: boolean;
  metrics: ForecastModelMetrics;
}

export function resultRows(meta: ForecastModelMeta): ResultRow[] {
  const test = meta.metrics.test ?? {};
  const rows: ResultRow[] = [];
  for (const key of MODEL_ORDER) {
    const metrics = test[key];
    if (metrics) rows.push({ key, label: MODEL_LABEL[key], isModel: key === "hist_gbm", metrics });
  }
  return rows;
}

/** Confidence interval of "model minus baseline" for a metric, in display units. */
export function intervalVs(
  meta: ForecastModelMeta,
  baseline: "climatology" | "seasonal_naive",
  metric: "abs_error" | "brier",
): ForecastInterval | null {
  return meta.metrics.test_bootstrap_vs_baseline?.[`hist_gbm_minus_${baseline}`]?.[metric] ?? null;
}

export interface CalibrationPoint {
  predicted: number;
  observed: number;
  n: number;
}

export function calibrationPoints(
  bins: readonly ForecastCalibrationBin[] | undefined,
): CalibrationPoint[] {
  return (bins ?? []).map((b) => ({
    predicted: b.mean_pred * 100,
    observed: b.obs * 100,
    n: b.n,
  }));
}

const FEATURE_LABEL: Record<string, string> = {
  hod28: "Corte nessa mesma hora nos últimos 28 dias",
  hod7: "Corte nessa mesma hora na última semana",
  hod_last: "Corte nessa mesma hora ontem",
  hodgen7: "Geração nessa mesma hora na última semana",
  snaive_7d: "Corte na mesma hora uma semana antes",
  dow: "Dia da semana",
  hour: "Hora do dia",
  month: "Mês do ano",
  is_holiday: "Feriado",
  is_weekend: "Fim de semana",
  horizon_h: "Quantas horas à frente",
  series_id: "Qual região e fonte",
  source: "Eólica ou solar",
  r1: "Corte médio no último dia",
  r7: "Corte médio nos últimos 7 dias",
  r28: "Corte médio nos últimos 28 dias",
  r90: "Corte médio nos últimos 90 dias",
  r1_max: "Maior corte horário do último dia",
  r7_trend: "Tendência do corte na semana",
  gen_d1: "Geração no último dia",
  gen7: "Geração média dos últimos 7 dias",
  gen28: "Geração média dos últimos 28 dias",
  gen_ratio: "Geração recente frente à média",
  doy_sin: "Época do ano",
  doy_cos: "Época do ano",
};

export function topFeatures(importance: Record<string, number>, limit = 5) {
  const entries = Object.entries(importance)
    .filter(([, value]) => value > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);
  const max = entries[0]?.[1] ?? 1;
  return entries.map(([key, value]) => ({
    key,
    label: FEATURE_LABEL[key] ?? key,
    share: value / max,
  }));
}

export const SOURCE_LABEL: Record<Source, string> = { wind: "Eólica", solar: "Solar" };

export function gainSentence(meta: ForecastModelMeta): string | null {
  const mae = intervalVs(meta, "climatology", "abs_error");
  if (!mae) return null;
  const pp = Math.abs(mae.delta) * 100;
  const low = Math.abs(mae.ci_high) * 100;
  const high = Math.abs(mae.ci_low) * 100;
  const better = mae.ci_high < 0;
  return better
    ? `O erro médio do modelo é ${pp.toFixed(1).replace(".", ",")} pontos percentuais menor que o da média histórica (intervalo de 95%: de ${low.toFixed(1).replace(".", ",")} a ${high.toFixed(1).replace(".", ",")}).`
    : "Neste período de teste, o modelo não ficou claramente melhor que a média histórica.";
}
