import { resolveTable, type ResolvedColumn } from "./data";
import type { FitResult } from "./fit";
import type { ChartKind, PlotterState } from "./state";
import { boxStats, histogram } from "./summary";

/** A plain ECharts option object; built here, handed to `setOption` by the chart component. */
export type ChartOption = Record<string, unknown>;
type Series = Record<string, unknown>;

/** Okabe-Ito: distinguishable with the common kinds of color blindness, readable on light and dark. */
export const PALETTE = [
  "#0072B2",
  "#D55E00",
  "#009E73",
  "#CC79A7",
  "#E69F00",
  "#56B4E9",
  "#B8A100",
  "#6B7280",
];

export const KINDS: { id: ChartKind; name: string; supportsLog: boolean; cartesian: boolean }[] = [
  { id: "scatter", name: "Dispersão", supportsLog: true, cartesian: true },
  { id: "line", name: "Linha", supportsLog: true, cartesian: true },
  { id: "bar", name: "Barras", supportsLog: false, cartesian: true },
  { id: "histogram", name: "Histograma", supportsLog: false, cartesian: false },
  { id: "box", name: "Boxplot", supportsLog: false, cartesian: false },
  { id: "pie", name: "Pizza", supportsLog: false, cartesian: false },
  { id: "polar", name: "Polar", supportsLog: false, cartesian: false },
];

export interface BuildOptions {
  /** Text and axis color; the screen uses the page's own, the export uses dark ink. */
  ink?: string;
  background?: string;
  /** Fitted curve to draw over the points. */
  fit?: FitResult | null;
}

const GRID_LINE = "rgba(128, 128, 128, 0.25)";

interface CustomApi {
  value: (dimension: number) => number;
  coord: (point: number[]) => number[];
}

function axis(name: string, ink: string, extra: Record<string, unknown> = {}) {
  return {
    name,
    nameLocation: "middle",
    nameTextStyle: { color: ink },
    axisLine: { lineStyle: { color: ink } },
    axisLabel: { color: ink },
    splitLine: { lineStyle: { color: GRID_LINE } },
    ...extra,
  };
}

function values(resolved: readonly ResolvedColumn[], id: string | null): (number | null)[] | null {
  return resolved.find((item) => item.column.id === id)?.values ?? null;
}

function rawLabels(state: PlotterState, id: string | null): string[] {
  const index = state.columns.findIndex((column) => column.id === id);
  return state.rows.map((row, i) => (index < 0 ? String(i + 1) : (row[index] ?? "").trim()));
}

/** Points kept for a series: both coordinates present and positive on a log axis. */
function keep(
  x: number | null | undefined,
  y: number | null | undefined,
  xLog: boolean,
  yLog: boolean,
): boolean {
  if (x === null || x === undefined || y === null || y === undefined) return false;
  return (!xLog || x > 0) && (!yLog || y > 0);
}

function errorSeries(rows: number[][], color: string, xLog: boolean, yLog: boolean): Series {
  const cap = 4;
  const line = (x1: number, y1: number, x2: number, y2: number) => ({
    type: "line",
    shape: { x1, y1, x2, y2 },
    style: { stroke: color, lineWidth: 1.4, fill: "none" },
  });
  return {
    type: "custom",
    name: "Incerteza",
    silent: true,
    z: 3,
    data: rows,
    encode: { x: 0, y: 1 },
    renderItem: (_params: unknown, api: CustomApi) => {
      const [x, y, ey, ex] = [api.value(0), api.value(1), api.value(2), api.value(3)];
      const children: unknown[] = [];
      if (ey > 0) {
        const low = yLog && y - ey <= 0 ? y / 1000 : y - ey;
        const a = api.coord([x, low]);
        const b = api.coord([x, y + ey]);
        children.push(line(a[0]!, a[1]!, b[0]!, b[1]!));
        children.push(line(a[0]! - cap, a[1]!, a[0]! + cap, a[1]!));
        children.push(line(b[0]! - cap, b[1]!, b[0]! + cap, b[1]!));
      }
      if (ex > 0) {
        const low = xLog && x - ex <= 0 ? x / 1000 : x - ex;
        const a = api.coord([low, y]);
        const b = api.coord([x + ex, y]);
        children.push(line(a[0]!, a[1]!, b[0]!, b[1]!));
        children.push(line(a[0]!, a[1]! - cap, a[0]!, a[1]! + cap));
        children.push(line(b[0]!, b[1]! - cap, b[0]!, b[1]! + cap));
      }
      return { type: "group", children };
    },
  };
}

function fitSeries(fit: FitResult, xLog: boolean, color: string): Series {
  const low = Math.min(...fit.x);
  const high = Math.max(...fit.x);
  const points = 120;
  const data = Array.from({ length: points }, (_, i) => {
    const t = i / (points - 1);
    const x = xLog && low > 0 ? low * (high / low) ** t : low + (high - low) * t;
    return [x, fit.predict(x)];
  });
  return {
    type: "line",
    name: "Ajuste",
    data,
    showSymbol: false,
    silent: true,
    z: 2,
    lineStyle: { color, width: 2, type: "dashed" },
    itemStyle: { color },
  };
}

export function buildOption(state: PlotterState, options: BuildOptions = {}): ChartOption {
  const ink = options.ink ?? "#1f2937";
  const { chart } = state;
  const resolved = resolveTable(state);
  const nameOf = (id: string) => state.columns.find((column) => column.id === id)?.name ?? id;
  const hasLegendSeries = chart.yColumns.length > 1 || Boolean(options.fit);

  const base: ChartOption = {
    animation: false,
    aria: { enabled: true },
    color: PALETTE,
    textStyle: { color: ink },
    ...(options.background ? { backgroundColor: options.background } : {}),
    title: chart.title
      ? { text: chart.title, left: "center", top: 4, textStyle: { color: ink, fontSize: 15 } }
      : undefined,
    tooltip: { trigger: "item", confine: true },
  };
  const top = (chart.title ? 36 : 14) + (hasLegendSeries ? 26 : 0);
  const legendTop = chart.title ? 30 : 6;
  const grid = { left: 16, right: 24, top, bottom: 12, containLabel: true };

  const kind = chart.kind;
  const ys = chart.yColumns
    .map((id) => ({ id, values: values(resolved, id) }))
    .filter((item): item is { id: string; values: (number | null)[] } => item.values !== null);
  const xs = values(resolved, chart.xColumn);

  if (kind === "pie") {
    const first = ys[0];
    const labels = rawLabels(state, chart.xColumn);
    const data = (first?.values ?? []).flatMap((value, i) =>
      value !== null && value > 0 ? [{ name: labels[i] || `#${i + 1}`, value }] : [],
    );
    return {
      ...base,
      legend: { bottom: 0, textStyle: { color: ink } },
      series: [
        {
          type: "pie",
          name: first ? nameOf(first.id) : "",
          radius: ["0%", "62%"],
          center: ["50%", chart.title ? "52%" : "46%"],
          data,
          label: { color: ink, formatter: "{b}: {d}%" },
        },
      ],
    };
  }

  if (kind === "box") {
    const stats = ys.map((item) => boxStats(item.values));
    const categories = ys.map((item) => nameOf(item.id));
    return {
      ...base,
      grid: { ...grid, top: chart.title ? 40 : 16 },
      xAxis: axis(chart.xLabel, ink, {
        type: "category",
        data: categories,
        nameGap: 32,
        splitLine: { show: false },
      }),
      yAxis: axis(chart.yLabel, ink, { type: "value", scale: true, nameGap: 48 }),
      series: [
        {
          type: "boxplot",
          name: "Boxplot",
          data: stats.map((item) =>
            item ? [item.min, item.q1, item.median, item.q3, item.max] : [],
          ),
          itemStyle: { color: "transparent", borderColor: PALETTE[0], borderWidth: 1.6 },
        },
        {
          type: "scatter",
          name: "Pontos fora da faixa",
          data: stats.flatMap((item, index) =>
            (item?.outliers ?? []).map((value) => [index, value]),
          ),
          itemStyle: { color: PALETTE[1] },
        },
      ],
    };
  }

  if (kind === "histogram") {
    const source = ys[0]?.values ?? xs ?? [];
    const bins = histogram(source, chart.bins);
    return {
      ...base,
      grid: { ...grid, top: chart.title ? 40 : 16, bottom: 26 },
      xAxis: axis(chart.xLabel, ink, {
        type: "category",
        data: bins?.labels ?? [],
        nameGap: 52,
        axisLabel: { color: ink, rotate: 30, hideOverlap: true },
        splitLine: { show: false },
      }),
      yAxis: axis(chart.yLabel, ink, { type: "value", nameGap: 40, minInterval: 1 }),
      series: [
        {
          type: "bar",
          name: "Contagem",
          data: bins?.counts ?? [],
          barCategoryGap: "4%",
          itemStyle: { color: PALETTE[0] },
        },
      ],
    };
  }

  if (kind === "polar") {
    const angle = xs ?? [];
    return {
      ...base,
      legend: hasLegendSeries ? { top: legendTop, textStyle: { color: ink } } : undefined,
      polar: { radius: "68%", center: ["50%", chart.title ? "56%" : "52%"] },
      angleAxis: {
        type: "value",
        min: 0,
        max: 360,
        interval: 30,
        startAngle: 0,
        axisLine: { lineStyle: { color: ink } },
        axisLabel: { color: ink, formatter: "{value}°" },
        splitLine: { lineStyle: { color: GRID_LINE } },
      },
      radiusAxis: {
        axisLine: { lineStyle: { color: ink } },
        axisLabel: { color: ink },
        splitLine: { lineStyle: { color: GRID_LINE } },
      },
      series: ys.map((item) => ({
        type: "line",
        name: nameOf(item.id),
        coordinateSystem: "polar",
        symbolSize: 6,
        data: angle.flatMap((theta, i) => {
          const radius = item.values[i];
          return theta !== null && radius !== null && radius !== undefined ? [[radius, theta]] : [];
        }),
      })),
    };
  }

  // scatter, line and bar share a cartesian grid
  const xLog = chart.xLog && kind !== "bar";
  const yLog = chart.yLog;
  const series: Series[] = [];
  const legendNames: string[] = [];

  if (kind === "bar") {
    const labels = rawLabels(state, chart.xColumn);
    ys.forEach((item) => {
      legendNames.push(nameOf(item.id));
      series.push({
        type: "bar",
        name: nameOf(item.id),
        data: item.values.map((value) => (value !== null && (!yLog || value > 0) ? value : null)),
      });
    });
    return {
      ...base,
      legend: ys.length > 1 ? { top: legendTop, textStyle: { color: ink } } : undefined,
      grid,
      xAxis: axis(chart.xLabel, ink, {
        type: "category",
        data: labels,
        nameGap: 32,
        splitLine: { show: false },
      }),
      yAxis: axis(chart.yLabel, ink, { type: yLog ? "log" : "value", nameGap: 48 }),
      series,
    };
  }

  const xError = values(resolved, chart.xErrorColumn);
  const yError = values(resolved, chart.yErrorColumn);
  ys.forEach((item, seriesIndex) => {
    const color = PALETTE[seriesIndex % PALETTE.length]!;
    const kept = (xs ?? []).flatMap((x, i) => (keep(x, item.values[i], xLog, yLog) ? [i] : []));
    legendNames.push(nameOf(item.id));
    series.push({
      type: kind === "line" ? "line" : "scatter",
      name: nameOf(item.id),
      data: kept.map((i) => [xs![i], item.values[i]]),
      symbolSize: kind === "line" ? 6 : 8,
      z: 4,
    });
    if (seriesIndex === 0 && (xError || yError)) {
      series.push(
        errorSeries(
          kept.map((i) => [xs![i]!, item.values[i]!, yError?.[i] ?? 0, xError?.[i] ?? 0]),
          color,
          xLog,
          yLog,
        ),
      );
    }
  });
  if (options.fit) {
    legendNames.push("Ajuste");
    series.push(fitSeries(options.fit, xLog, ink));
  }

  return {
    ...base,
    legend: hasLegendSeries
      ? { top: legendTop, data: legendNames, textStyle: { color: ink } }
      : undefined,
    grid,
    xAxis: axis(chart.xLabel, ink, { type: xLog ? "log" : "value", scale: !xLog, nameGap: 32 }),
    yAxis: axis(chart.yLabel, ink, { type: yLog ? "log" : "value", scale: !yLog, nameGap: 48 }),
    series,
  };
}

/** Residuals of a fit as a small scatter around zero, to judge whether the model fits. */
export function buildResidualOption(fit: FitResult, ink = "#1f2937", xLabel = "x"): ChartOption {
  return {
    animation: false,
    aria: { enabled: true },
    textStyle: { color: ink },
    tooltip: { trigger: "item", confine: true },
    grid: { left: 16, right: 24, top: 16, bottom: 12, containLabel: true },
    xAxis: axis(xLabel, ink, { type: "value", scale: true, nameGap: 30 }),
    yAxis: axis("Resíduo", ink, { type: "value", nameGap: 48 }),
    series: [
      {
        type: "scatter",
        name: "Resíduo",
        data: fit.x.map((x, i) => [x, fit.residuals[i]]),
        symbolSize: 7,
        itemStyle: { color: PALETTE[1] },
        markLine: undefined,
      },
      {
        type: "line",
        name: "Zero",
        data: [
          [Math.min(...fit.x), 0],
          [Math.max(...fit.x), 0],
        ],
        showSymbol: false,
        silent: true,
        lineStyle: { color: ink, width: 1, type: "dashed" },
      },
    ],
  };
}
