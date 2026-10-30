"use client";

import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { buildOption, KINDS } from "@/lib/plotter/figure";
import type { FitResult } from "@/lib/plotter/fit";
import { decodeHash, loadLocal, saveLocal } from "@/lib/plotter/share";
import {
  createHistory,
  plotterReducer,
  SCHEMA_VERSION,
  type ChartConfig,
  type PlotterState,
} from "@/lib/plotter/state";
import { DataPanel } from "./data-panel";
import { EChart } from "./echarts-chart";
import { FitPanel } from "./fit-panel";
import { ShareBar } from "./share-bar";

/** Illustrative Ohm law data; the examples pages carry the full set. */
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
      bins: 10,
    },
  };
}

const FIELD = "border-grid bg-surface rounded-md border px-2 py-1 text-sm";

export function PlotterApp() {
  const [history, dispatch] = useReducer(plotterReducer, undefined, () =>
    createHistory(demoState()),
  );
  const [fit, setFit] = useState<FitResult | null>(null);
  const state = history.present;
  const hydrated = useRef(false);
  const onFit = useCallback((next: FitResult | null) => setFit(next), []);
  const build = useCallback((ink: string) => buildOption(state, { ink, fit }), [state, fit]);

  // A shared link wins over the saved work; both only apply after mount (no server mismatch).
  useEffect(() => {
    const restored = decodeHash(window.location.hash) ?? loadLocal();
    if (restored) dispatch({ type: "load", state: restored });
    hydrated.current = true;
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    const timer = window.setTimeout(() => saveLocal(state), 500);
    return () => window.clearTimeout(timer);
  }, [state]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== "z") return;
      const target = event.target as HTMLElement | null;
      if (target?.tagName === "TEXTAREA" || target?.tagName === "INPUT") return;
      event.preventDefault();
      dispatch({ type: event.shiftKey ? "redo" : "undo" });
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const { chart } = state;
  const numeric = state.columns.filter((column) => column.kind === "number");
  const kind = KINDS.find((item) => item.id === chart.kind) ?? KINDS[0]!;
  const withErrors = chart.kind === "scatter" || chart.kind === "line";
  const set = (patch: Partial<ChartConfig>) => dispatch({ type: "setChart", patch });

  const errorSelect = (label: string, key: "xErrorColumn" | "yErrorColumn") => (
    <label className="flex flex-col gap-1">
      {label}
      <select
        className={FIELD}
        value={chart[key] ?? ""}
        onChange={(event) => set({ [key]: event.target.value || null })}
      >
        <option value="">Nenhuma</option>
        {numeric.map((column) => (
          <option key={column.id} value={column.id}>
            {column.name}
          </option>
        ))}
      </select>
    </label>
  );

  return (
    <div className="space-y-6">
      <div className="border-grid bg-surface shadow-card rounded-2xl border p-3 sm:p-5">
        <div className="mb-3 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <label className="flex flex-col gap-1">
            Tipo de gráfico
            <select
              className={FIELD}
              value={chart.kind}
              onChange={(event) => set({ kind: event.target.value as ChartConfig["kind"] })}
            >
              {KINDS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            {chart.kind === "pie" || chart.kind === "bar" ? "Rótulos" : "Eixo X"}
            <select
              className={FIELD}
              value={chart.xColumn ?? ""}
              onChange={(event) => {
                const column = state.columns.find((item) => item.id === event.target.value);
                set({ xColumn: column?.id ?? null, xLabel: column?.name ?? "" });
              }}
            >
              {state.columns.map((column) => (
                <option key={column.id} value={column.id}>
                  {column.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            Título
            <input
              className={FIELD}
              value={chart.title}
              onChange={(event) => set({ title: event.target.value })}
            />
          </label>
          <label className="flex flex-col gap-1">
            Rótulo do eixo X
            <input
              className={FIELD}
              value={chart.xLabel}
              onChange={(event) => set({ xLabel: event.target.value })}
            />
          </label>
          <label className="flex flex-col gap-1">
            Rótulo do eixo Y
            <input
              className={FIELD}
              value={chart.yLabel}
              onChange={(event) => set({ yLabel: event.target.value })}
            />
          </label>
          {chart.kind === "histogram" ? (
            <label className="flex flex-col gap-1">
              Faixas (bins)
              <input
                type="number"
                min={1}
                max={200}
                className={FIELD}
                value={chart.bins}
                onChange={(event) => set({ bins: Number(event.target.value) || 1 })}
              />
            </label>
          ) : null}
          {withErrors ? errorSelect("Incerteza em X", "xErrorColumn") : null}
          {withErrors ? errorSelect("Incerteza em Y", "yErrorColumn") : null}
        </div>
        <fieldset className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
          <legend className="sr-only">Séries do eixo Y</legend>
          <span className="font-medium">{chart.kind === "box" ? "Caixas:" : "Séries Y:"}</span>
          {numeric.map((column) => (
            <label key={column.id} className="flex items-center gap-1.5">
              <input
                type="checkbox"
                checked={chart.yColumns.includes(column.id)}
                onChange={(event) =>
                  set({
                    yColumns: event.target.checked
                      ? [...chart.yColumns, column.id]
                      : chart.yColumns.filter((id) => id !== column.id),
                  })
                }
              />
              {column.name}
            </label>
          ))}
          {kind.supportsLog ? (
            <>
              <label className="flex items-center gap-1.5">
                <input
                  type="checkbox"
                  checked={chart.xLog}
                  onChange={(event) => set({ xLog: event.target.checked })}
                />
                X logarítmico
              </label>
              <label className="flex items-center gap-1.5">
                <input
                  type="checkbox"
                  checked={chart.yLog}
                  onChange={(event) => set({ yLog: event.target.checked })}
                />
                Y logarítmico
              </label>
            </>
          ) : null}
        </fieldset>
        <EChart build={build} label={chart.title || "Gráfico do plotador"} />
      </div>
      <ShareBar state={state} fit={fit} dispatch={dispatch} />
      <p className="text-muted text-xs">Seus dados ficam no seu navegador.</p>
      <FitPanel state={state} dispatch={dispatch} onFit={onFit} />
      <DataPanel state={state} dispatch={dispatch} />
    </div>
  );
}
