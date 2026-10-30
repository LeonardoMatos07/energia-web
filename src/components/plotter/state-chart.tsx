"use client";

import { useCallback, useMemo } from "react";
import { resolveTable } from "@/lib/plotter/data";
import { buildOption } from "@/lib/plotter/figure";
import { fitCurve, type ModelId } from "@/lib/plotter/fit";
import type { PlotterState } from "@/lib/plotter/state";
import { EChart } from "./echarts-chart";

/** Read-only chart of a saved state, optionally with its fitted curve (the example pages). */
export function StateChart({
  state,
  model,
  height = 380,
}: {
  state: PlotterState;
  model?: ModelId | null;
  height?: number;
}) {
  const fit = useMemo(() => {
    if (!model) return null;
    const resolved = resolveTable(state);
    const x = resolved.find((item) => item.column.id === state.chart.xColumn)?.values;
    const y = resolved.find((item) => item.column.id === state.chart.yColumns[0])?.values;
    try {
      return x && y ? fitCurve(model, x, y) : null;
    } catch {
      return null;
    }
  }, [state, model]);
  const build = useCallback((ink: string) => buildOption(state, { ink, fit }), [state, fit]);
  return <EChart build={build} height={height} label={state.chart.title || "Gráfico"} />;
}
