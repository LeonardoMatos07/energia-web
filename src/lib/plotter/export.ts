import { buildOption, type ChartOption } from "./figure";
import type { FitResult } from "./fit";
import type { PlotterState } from "./state";

export const EXPORT_WIDTH = 900;
export const EXPORT_HEIGHT = 560;

/** The export always draws dark ink on white (or nothing, when transparent), whatever the page theme. */
function exportOption(
  state: PlotterState,
  fit: FitResult | null,
  transparent: boolean,
): ChartOption {
  return buildOption(state, {
    ink: "#111827",
    fit,
    background: transparent ? undefined : "#ffffff",
  });
}

/** SVG as text. Runs without a DOM (ECharts server-side rendering), so it also works in tests. */
export async function renderSvg(
  state: PlotterState,
  fit: FitResult | null = null,
  transparent = false,
): Promise<string> {
  const { echarts } = await import("./echarts");
  const chart = echarts.init(null, undefined, {
    renderer: "svg",
    ssr: true,
    width: EXPORT_WIDTH,
    height: EXPORT_HEIGHT,
  });
  try {
    chart.setOption(exportOption(state, fit, transparent));
    return chart.renderToSVGString();
  } finally {
    chart.dispose();
  }
}

/** PNG data URL from an off-screen canvas; `scale` 4 gives about 300 dpi on A4. Browser only. */
export async function renderPng(
  state: PlotterState,
  scale: number,
  fit: FitResult | null = null,
  transparent = false,
): Promise<string> {
  const { echarts } = await import("./echarts");
  const host = document.createElement("div");
  host.style.cssText = `position:fixed;left:-10000px;top:0;width:${EXPORT_WIDTH}px;height:${EXPORT_HEIGHT}px`;
  document.body.appendChild(host);
  const chart = echarts.init(host, undefined, {
    renderer: "canvas",
    width: EXPORT_WIDTH,
    height: EXPORT_HEIGHT,
  });
  try {
    chart.setOption(exportOption(state, fit, transparent));
    return chart.getDataURL({
      type: "png",
      pixelRatio: scale,
      backgroundColor: transparent ? "rgba(0,0,0,0)" : "#ffffff",
    });
  } finally {
    chart.dispose();
    host.remove();
  }
}
