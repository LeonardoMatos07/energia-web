import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { ForecastModelMeta, ForecastResponse } from "@/lib/api/types";
import {
  calibrationPoints,
  gainSentence,
  groupScopes,
  parseScope,
  parseSource,
  summarize,
  topFeatures,
} from "@/lib/forecast";
import { ForecastResults } from "./forecast-results";
import { ForecastView } from "./forecast-view";

// recharts needs a layout engine; the charts are covered by the page-level smoke test.
vi.mock("./forecast-chart", () => ({ ForecastChart: () => <div data-testid="forecast-chart" /> }));
vi.mock("./reliability-chart", () => ({
  RELIABILITY_COLORS: { model: "#f00", baseline: "#00f" },
  ReliabilityChart: ({ series }: { series: { key: string }[] }) => (
    <div data-testid="reliability-chart">{series.map((s) => s.key).join(",")}</div>
  ),
}));

function buildForecast(overrides: Partial<ForecastResponse> = {}): ForecastResponse {
  const points = Array.from({ length: 48 }, (_, i) => {
    const hour = i % 24;
    const day = i < 24 ? "2026-10-01" : "2026-10-02";
    const risk = hour === 13 ? 0.9 : 0.1;
    return {
      ts: `${day}T${String(hour).padStart(2, "0")}:00:00`,
      risk_probability: risk,
      expected_curtailment_pct: risk * 30,
      level: risk >= 0.66 ? ("alto" as const) : ("baixo" as const),
      applicable: hour !== 3,
    };
  });
  return {
    scope: "NE",
    source: "wind",
    risk_definition: "hour with curtailment >= 10% of potential output",
    origin_ts: "2026-10-01T00:00:00",
    generated_at: "2026-10-28T12:00:00Z",
    data_through: "2026-09-30",
    stale_days: 28,
    model_version: "hgb-20261028-abc12345",
    model_trained_at: "2026-10-28T12:00:00Z",
    points,
    ...overrides,
  };
}

function buildMeta(): ForecastModelMeta {
  const metric = (mae: number, auc: number, brier: number, ece: number) => ({
    mae_pp: mae,
    rmse_pp: mae * 1.6,
    roc_auc: auc,
    pr_auc: 0.8,
    brier,
    ece,
  });
  const bins = [
    { mean_pred: 0.1, obs: 0.12, n: 1000 },
    { mean_pred: 0.9, obs: 0.85, n: 800 },
  ];
  return {
    model_version: "hgb-20261028-abc12345",
    trained_at: "2026-10-28T12:00:00Z",
    data_period: {
      wind: { start: "2021-10-01 00:00:00", end: "2026-09-30 23:00:00", n_series: 15 },
      solar: { start: "2024-04-01 00:00:00", end: "2026-09-30 23:00:00", n_series: 12 },
    },
    n_series: 27,
    n_rows: 123456,
    metrics: {
      test: {
        hist_gbm: metric(10.1, 0.915, 0.117, 0.038),
        seasonal_naive: metric(12.1, 0.8, 0.193, 0.193),
        climatology: metric(13.9, 0.833, 0.22, 0.218),
      },
      test_bootstrap_vs_baseline: {
        hist_gbm_minus_climatology: {
          abs_error: { delta: -0.038, ci_low: -0.046, ci_high: -0.028 },
          brier: { delta: -0.1, ci_low: -0.12, ci_high: -0.08 },
        },
      },
      test_start: "2026-04-01",
      test_rows: 251305,
      test_base_rate: 0.42,
    },
    calibration: { bins: { hist_gbm: bins, climatology: bins } },
    feature_importance: { hod28: 0.13, dow: 0.016, hour: 0.01, zero: 0 },
    model_card: {},
    last_run_at: "2026-10-28T12:30:00Z",
    last_data_through: "2026-09-30",
  };
}

describe("ForecastView", () => {
  it("summarises the risk and renders one cell per hour", () => {
    render(<ForecastView forecast={buildForecast()} />);
    expect(screen.getByText("Horas com risco alto")).toBeInTheDocument();
    expect(screen.getAllByLabelText(/risco alto \(90%\)/)).toHaveLength(2);
    expect(screen.getAllByLabelText(/não se aplica/)).toHaveLength(2);
    expect(screen.getByTestId("forecast-chart")).toBeInTheDocument();
  });

  it("warns that the data are stale and shows when the forecast was generated", () => {
    render(<ForecastView forecast={buildForecast()} />);
    expect(screen.getByText(/28 dias atrás/)).toBeInTheDocument();
    expect(screen.getByText(/Previsão gerada em/)).toBeInTheDocument();
    expect(screen.getByText(/hgb-20261028-abc12345/)).toBeInTheDocument();
  });

  it("does not warn when the data are fresh", () => {
    render(<ForecastView forecast={buildForecast({ stale_days: 1 })} />);
    expect(screen.queryByText(/dias atrás/)).not.toBeInTheDocument();
  });
});

describe("ForecastResults", () => {
  const now = new Date("2026-10-31T00:00:00Z").getTime();

  it("shows the baseline-versus-model table with the model highlighted", () => {
    render(<ForecastResults meta={buildMeta()} now={now} />);
    const table = screen.getByRole("table");
    expect(table).toHaveTextContent("Modelo (gradient boosting)");
    expect(table).toHaveTextContent("Referência: mesma hora da semana passada");
    expect(table).toHaveTextContent("10,1");
    expect(table).toHaveTextContent("0,915");
    expect(screen.getByText(/Resumo honesto/)).toBeInTheDocument();
  });

  it("states the data period, the limitations and the training date", () => {
    render(<ForecastResults meta={buildMeta()} now={now} />);
    expect(screen.getByText(/Não usa previsão do tempo/)).toBeInTheDocument();
    expect(screen.getByText("indicador de risco")).toBeInTheDocument();
    expect(screen.getByText(/2 dias atrás/)).toBeInTheDocument();
    expect(screen.getByText(/15 séries/)).toBeInTheDocument();
  });

  it("renders the reliability chart and the feature list, ignoring zero weights", () => {
    render(<ForecastResults meta={buildMeta()} now={now} />);
    expect(screen.getByTestId("reliability-chart")).toHaveTextContent("hist_gbm,climatology");
    expect(screen.getByText("Corte nessa mesma hora nos últimos 28 dias")).toBeInTheDocument();
    expect(screen.queryByText("zero")).not.toBeInTheDocument();
  });

  it("does not claim a gain when the interval includes zero", () => {
    const meta = buildMeta();
    meta.metrics.test_bootstrap_vs_baseline = {
      hist_gbm_minus_climatology: {
        abs_error: { delta: -0.001, ci_low: -0.01, ci_high: 0.01 },
      },
    };
    render(<ForecastResults meta={meta} now={now} />);
    expect(screen.getByText(/não ficou claramente melhor/)).toBeInTheDocument();
    expect(screen.queryByText(/O ganho é real/)).not.toBeInTheDocument();
  });

  it("flags an outdated training", () => {
    render(<ForecastResults meta={buildMeta()} now={new Date("2027-03-01T00:00:00Z").getTime()} />);
    expect(screen.getByText(/já está desatualizado/)).toBeInTheDocument();
  });
});

describe("forecast helpers", () => {
  const scopes = [
    { scope: "NE", source: "wind" as const },
    { scope: "SIN", source: "wind" as const },
    { scope: "BA", source: "wind" as const },
    { scope: "SE", source: "solar" as const },
  ];

  it("parses the source and falls back to a published scope", () => {
    expect(parseSource("solar")).toBe("solar");
    expect(parseSource("xx")).toBe("wind");
    expect(parseScope("ba", "wind", scopes)).toBe("BA");
    expect(parseScope("ba", "solar", scopes)).toBe("SE");
    expect(parseScope(undefined, "wind", scopes)).toBe("NE");
    expect(parseScope("zz", "wind", scopes)).toBe("NE");
  });

  it("groups scopes for the selector", () => {
    const groups = groupScopes(scopes, "wind");
    expect(groups.map((g) => g.label)).toEqual(["Brasil", "Subsistemas", "Estados"]);
    expect(groups[2]?.scopes[0]?.label).toBe("Bahia");
  });

  it("summarises only applicable hours", () => {
    const { applicableHours, highHours, meanExpectedPct } = summarize(buildForecast().points);
    expect(applicableHours).toBe(46);
    expect(highHours).toBe(2);
    expect(meanExpectedPct).not.toBeNull();
  });

  it("converts calibration bins and feature weights", () => {
    expect(calibrationPoints([{ mean_pred: 0.5, obs: 0.4, n: 3 }])).toEqual([
      { predicted: 50, observed: 40, n: 3 },
    ]);
    expect(topFeatures({ a: 2, b: 1, c: 0 }).map((f) => f.share)).toEqual([1, 0.5]);
    expect(gainSentence(buildMeta())).toMatch(/3,8 pontos percentuais menor/);
  });
});
