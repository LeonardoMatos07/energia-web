"use client";

import { useEffect, useMemo, useReducer } from "react";
import { buildFigure } from "@/lib/plotter/figure";
import {
  createHistory,
  plotterReducer,
  SCHEMA_VERSION,
  type PlotterState,
} from "@/lib/plotter/state";
import { DataPanel } from "./data-panel";
import { FitPanel } from "./fit-panel";
import { PlotlyChart } from "./plotly-chart";

/** Illustrative Ohm's law data; the examples pages carry the full set. */
export function demoState(): PlotterState {
  return {
    schemaVersion: SCHEMA_VERSION,
    columns: [
      {
        id: "v",
        name: "Tensão",
        kind: "number",
        symbol: "V",
        quantity: "voltage",
        dataUnit: "V",
        displayUnit: "V",
      },
      {
        id: "i",
        name: "Corrente",
        kind: "number",
        symbol: "I",
        quantity: "current",
        dataUnit: "mA",
        displayUnit: "mA",
      },
      {
        id: "ei",
        name: "Erro da corrente",
        kind: "number",
        quantity: "current",
        dataUnit: "mA",
        displayUnit: "mA",
      },
    ],
    rows: [
      ["0,5", "49", "5"],
      ["1,0", "101", "5"],
      ["1,5", "148", "5"],
      ["2,0", "203", "5"],
      ["2,5", "249", "5"],
      ["3,0", "299", "5"],
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
      yLabel: "Corrente (mA)",
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
      const target = event.target as HTMLElement | null;
      if (target?.tagName === "TEXTAREA") return;
      event.preventDefault();
      dispatch({ type: event.shiftKey ? "redo" : "undo" });
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const numeric = state.columns.filter((column) => column.kind === "number");
  const chart = state.chart;

  return (
    <div className="space-y-6">
      <div className="border-grid bg-surface shadow-card rounded-2xl border p-3 sm:p-5">
        <div className="mb-3 flex flex-wrap items-center gap-3 text-sm">
          <label className="flex items-center gap-2">
            Eixo X
            <select
              className="border-grid bg-surface rounded-md border px-2 py-1"
              value={chart.xColumn ?? ""}
              onChange={(event) => {
                const column = state.columns.find((item) => item.id === event.target.value);
                dispatch({
                  type: "setChart",
                  patch: { xColumn: column?.id ?? null, xLabel: column?.name ?? "" },
                });
              }}
            >
              {numeric.map((column) => (
                <option key={column.id} value={column.id}>
                  {column.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2">
            Eixo Y
            <select
              className="border-grid bg-surface rounded-md border px-2 py-1"
              value={chart.yColumns[0] ?? ""}
              onChange={(event) => {
                const column = state.columns.find((item) => item.id === event.target.value);
                dispatch({
                  type: "setChart",
                  patch: { yColumns: column ? [column.id] : [], yLabel: column?.name ?? "" },
                });
              }}
            >
              {numeric.map((column) => (
                <option key={column.id} value={column.id}>
                  {column.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <PlotlyChart figure={figure} />
      </div>
      <p className="text-muted text-xs">Seus dados ficam no seu navegador.</p>
      <FitPanel state={state} dispatch={dispatch} />
      <DataPanel state={state} dispatch={dispatch} />
    </div>
  );
}
