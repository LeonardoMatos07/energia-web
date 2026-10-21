/**
 * Categorical palette in a fixed, CVD-validated order (blue, orange, aqua, yellow).
 * Colors follow the entity, never its rank: the same source/subsystem/reason always
 * gets the same color on every page. Identity is never color-alone: every chart has a
 * legend and a data table.
 */
export const SERIES = {
  s1: "var(--color-series-1)",
  s2: "var(--color-series-2)",
  s3: "var(--color-series-3)",
  s4: "var(--color-series-4)",
} as const;

export const FONTE_COLORS = {
  eolica: SERIES.s1,
  solar: SERIES.s2,
} as const;

export const SUBSISTEMA_COLORS = {
  NE: SERIES.s1,
  N: SERIES.s2,
  SE: SERIES.s3,
  S: SERIES.s4,
} as const;

export const GERACAO_COLORS = {
  verificada: SERIES.s1,
  cortada: SERIES.s2,
} as const;

export const MOTIVO_COLORS = {
  rel: SERIES.s1,
  cnf: SERIES.s2,
  ene: SERIES.s3,
  outros: SERIES.s4,
} as const;

export const CHART_INK = {
  axis: "var(--color-muted)",
  grid: "var(--color-grid)",
  baseline: "var(--color-line)",
  surface: "var(--color-surface)",
} as const;
