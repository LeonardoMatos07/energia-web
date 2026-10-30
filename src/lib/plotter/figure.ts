import type { ChartConfig, PlotterState } from "./state";

export interface PlotlyFigure {
  data: Record<string, unknown>[];
  layout: Record<string, unknown>;
  config: Record<string, unknown>;
}

/** Placeholder number parsing; Etapa 1 replaces it with the Brazilian-format parser. */
export function toNumber(cell: string | undefined): number | null {
  if (cell === undefined || cell.trim() === "") return null;
  const value = Number(cell.replace(",", "."));
  return Number.isFinite(value) ? value : null;
}

function columnValues(state: PlotterState, id: string | null): (number | null)[] | null {
  const index = state.columns.findIndex((column) => column.id === id);
  if (index < 0) return null;
  return state.rows.map((row) => toNumber(row[index]));
}

function axis(title: string, log: boolean): Record<string, unknown> {
  return {
    title: { text: title },
    type: log ? "log" : "linear",
    automargin: true,
    zeroline: false,
  };
}

const MODE: Record<ChartConfig["kind"], string> = {
  scatter: "markers",
  line: "lines+markers",
  bar: "markers",
};

export function buildFigure(state: PlotterState): PlotlyFigure {
  const { chart } = state;
  const xs = columnValues(state, chart.xColumn);
  const xError = columnValues(state, chart.xErrorColumn);
  const yError = columnValues(state, chart.yErrorColumn);

  const data = chart.yColumns.flatMap((id, seriesIndex) => {
    const ys = columnValues(state, id);
    if (!xs || !ys) return [];
    const keep = xs.map(
      (x, i) =>
        x !== null && ys[i] !== null && (!chart.xLog || x > 0) && (!chart.yLog || (ys[i] ?? 0) > 0),
    );
    const pick = (values: (number | null)[] | null) => values?.filter((_, i) => keep[i]);
    const name = state.columns.find((column) => column.id === id)?.name ?? id;
    const trace: Record<string, unknown> = {
      type: chart.kind === "bar" ? "bar" : "scatter",
      mode: MODE[chart.kind],
      name,
      x: pick(xs),
      y: pick(ys),
    };
    if (yError && seriesIndex === 0) {
      trace.error_y = { type: "data", array: pick(yError), visible: true };
    }
    if (xError && seriesIndex === 0) {
      trace.error_x = { type: "data", array: pick(xError), visible: true };
    }
    return [trace];
  });

  return {
    data,
    layout: {
      title: chart.title ? { text: chart.title } : undefined,
      xaxis: axis(chart.xLabel, chart.xLog),
      yaxis: axis(chart.yLabel, chart.yLog),
      margin: { t: chart.title ? 48 : 16, r: 16, b: 48, l: 56 },
      autosize: true,
    },
    config: { responsive: true, displaylogo: false },
  };
}
