export const SERIES = {
  s1: "var(--color-series-1)",
  s2: "var(--color-series-2)",
  s3: "var(--color-series-3)",
  s4: "var(--color-series-4)",
} as const;

export const SOURCE_COLORS = {
  wind: SERIES.s1,
  solar: SERIES.s2,
} as const;

export const SUBSYSTEM_COLORS = {
  NE: SERIES.s1,
  N: SERIES.s2,
  SE: SERIES.s3,
  S: SERIES.s4,
} as const;

export const GENERATION_COLORS = {
  verified: SERIES.s1,
  curtailed: SERIES.s2,
} as const;

export const REASON_COLORS = {
  rel: SERIES.s1,
  cnf: SERIES.s2,
  ene: SERIES.s3,
  other: SERIES.s4,
} as const;

export const CHART_INK = {
  axis: "var(--color-muted)",
  grid: "var(--color-grid)",
  baseline: "var(--color-line)",
  surface: "var(--color-surface)",
} as const;
