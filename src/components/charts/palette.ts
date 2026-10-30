export const SERIES = {
  s1: "var(--color-series-1)",
  s2: "var(--color-series-2)",
  s3: "var(--color-series-3)",
  s4: "var(--color-series-4)",
  s5: "var(--color-series-5)",
  s6: "var(--color-series-6)",
  s7: "var(--color-series-7)",
} as const;

export const ENTITY_COLORS = [SERIES.s1, SERIES.s2, SERIES.s3, SERIES.s4, SERIES.s5, SERIES.s6];

export const SOURCE_COLORS = {
  wind: SERIES.s1,
  solar: SERIES.s6,
} as const;

export const SUBSYSTEM_COLORS = {
  NE: SERIES.s2,
  SE: SERIES.s3,
  S: SERIES.s4,
  N: SERIES.s7,
} as const;

export const GENERATION_COLORS = {
  verified: SERIES.s1,
  curtailed: SERIES.s3,
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

// Hex literals (not CSS variables) so both lines stay distinct in every theme.
export const RELIABILITY_COLORS = { model: "#0f9d8f", baseline: "#d97706" } as const;
