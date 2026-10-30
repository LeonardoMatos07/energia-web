"use client";

import { useEffect, useMemo, useReducer } from "react";
import { buildFigure } from "@/lib/plotter/figure";
import {
  createHistory,
  plotterReducer,
  SCHEMA_VERSION,
  type PlotterState,
} from "@/lib/plotter/state";
import { PlotlyChart } from "./plotly-chart";

/** Illustrative Ohm's law data; the examples pages carry the full set. */
export function demoState(): PlotterState {
  return {
    schemaVersion: SCHEMA_VERSION,
    columns: [
      { id: "v", name: "Tensão (V)", kind: "number" },
      { id: "i", name: "Corrente (A)", kind: "number" },
      { id: "ei", name: "Erro da corrente (A)", kind: "number" },
    ],
    rows: [
      ["0.5", "0.049", "0.005"],
      ["1.0", "0.101", "0.005"],
      ["1.5", "0.148", "0.005"],
      ["2.0", "0.203", "0.005"],
      ["2.5", "0.249", "0.005"],
      ["3.0", "0.299", "0.005"],
    ],
    chart: {
      kind: "scatter",
      title: "Lei de Ohm (dados ilustrativos)",
      xColumn: "v",
      yColumns: ["i"],
      xErrorColumn: null,
      yErrorColumn: "ei",
      xLog: false,
      yLog: false,
      xLabel: "Tensão (V)",
      yLabel: "Corrente (A)",
    },
  };
}

export function PlotterApp() {
  const [history, dispatch] = useReducer(plotterReducer, undefined, () =>
    createHistory(demoState()),
  );
  const state = history.present;
  const figure = useMemo(() => buildFigure(state), [state]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== "z") return;
      event.preventDefault();
      dispatch({ type: event.shiftKey ? "redo" : "undo" });
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="space-y-3">
      <div className="border-grid bg-surface shadow-card rounded-2xl border p-3 sm:p-5">
        <PlotlyChart figure={figure} />
      </div>
      <p className="text-muted text-xs">Seus dados ficam no seu navegador.</p>
    </div>
  );
}
