import { resolveTable, type ResolvedColumn } from "./data";
import type { ChartConfig, PlotterState } from "./state";

export interface PlotlyFigure {
  data: Record<string, unknown>[];
  layout: Record<string, unknown>;
  config: Record<string, unknown>;
}

function columnValues(
  resolved: readonly ResolvedColumn[],
  id: string | null,
): (number | null)[] | null {
  return resolved.find((item) => item.column.id === id)?.values ?? null;
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
  const resolved = resolveTable(state);
  const xs = columnValues(resolved, chart.xColumn);
  const xError = columnValues(resolved, chart.xErrorColumn);
  const yError = columnValues(resolved, chart.yErrorColumn);

  const data = chart.yColumns.flatMap((id, seriesIndex) => {
    const ys = columnValues(resolved, id);
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
