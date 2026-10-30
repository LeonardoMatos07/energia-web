"use client";

import { useCallback, useEffect, useMemo, useState, type Dispatch } from "react";
import { resolveTable } from "@/lib/plotter/data";
import {
  columnStats,
  equationLatex,
  equationText,
  fitCurve,
  type FitResult,
  FitError,
  linearization,
  MODELS,
  type ModelId,
} from "@/lib/plotter/fit";
import { buildResidualOption } from "@/lib/plotter/figure";
import type { PlotterAction, PlotterState } from "@/lib/plotter/state";
import { EChart } from "./echarts-chart";

const FIELD = "border-grid bg-surface rounded-md border px-2 py-1 text-sm";
const BUTTON = "border-grid hover:bg-surface-2 rounded-full border px-3 py-1.5 text-sm font-medium";

function format(value: number): string {
  return Number(value.toPrecision(5)).toString().replace(".", ",");
}

async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // clipboard blocked: nothing else to do
  }
}

/** Curve fit and per-column statistics for the series that is plotted. */
export function FitPanel({
  state,
  dispatch,
  onFit,
}: {
  state: PlotterState;
  dispatch: Dispatch<PlotterAction>;
  /** Receives the fit to draw over the chart, or null when the curve is hidden or cannot be fitted. */
  onFit: (fit: FitResult | null) => void;
}) {
  const [model, setModel] = useState<ModelId>("linear");
  const [weighted, setWeighted] = useState(false);
  const [showCurve, setShowCurve] = useState(true);
  const [showResiduals, setShowResiduals] = useState(false);
  const resolved = useMemo(() => resolveTable(state), [state]);
  const { chart } = state;
  const xColumn = resolved.find((item) => item.column.id === chart.xColumn);
  const yColumn = resolved.find((item) => item.column.id === chart.yColumns[0]);
  const errorColumn = resolved.find((item) => item.column.id === chart.yErrorColumn);

  const outcome = useMemo(() => {
    if (!xColumn || !yColumn) return { error: "Escolha as colunas X e Y." } as const;
    try {
      return {
        result: fitCurve(model, xColumn.values, yColumn.values, {
          sigma: weighted && errorColumn ? errorColumn.values : undefined,
        }),
      } as const;
    } catch (error) {
      return {
        error: error instanceof FitError ? error.message : "Não foi possível ajustar.",
      } as const;
    }
  }, [model, weighted, xColumn, yColumn, errorColumn]);

  const fitted = ("result" in outcome ? outcome.result : null) ?? null;
  useEffect(() => {
    onFit(showCurve ? fitted : null);
  }, [fitted, showCurve, onFit]);
  const residualOption = useCallback(
    (ink: string) => (fitted ? buildResidualOption(fitted, ink, state.chart.xLabel) : {}),
    [fitted, state.chart.xLabel],
  );

  const names = {
    x: xColumn?.column.symbol || xColumn?.column.name || "x",
    y: yColumn?.column.symbol || yColumn?.column.name || "y",
  };
  const guide = linearization(model);

  return (
    <section
      aria-label="Ajuste de curva"
      className="border-grid bg-surface shadow-card space-y-4 rounded-2xl border p-4"
    >
      <h2 className="text-lg font-semibold">Ajuste de curva</h2>
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm">
          Modelo
          <select
            className={FIELD}
            value={model}
            onChange={(event) => setModel(event.target.value as ModelId)}
          >
            {MODELS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={weighted}
            disabled={!errorColumn}
            onChange={(event) => setWeighted(event.target.checked)}
          />
          Ponderar pelas barras de erro em Y
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={showCurve}
            onChange={(event) => setShowCurve(event.target.checked)}
          />
          Mostrar a curva no gráfico
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={showResiduals}
            onChange={(event) => setShowResiduals(event.target.checked)}
          />
          Gráfico de resíduos
        </label>
      </div>

      {"error" in outcome ? (
        <p role="status" className="text-sm text-amber-700 dark:text-amber-300">
          {outcome.error}
        </p>
      ) : (
        <div className="space-y-3 text-sm">
          <p className="text-base font-semibold">{equationText(outcome.result, names)}</p>
          <table className="border-grid w-full max-w-md border">
            <caption className="sr-only">Parâmetros do ajuste</caption>
            <thead className="bg-surface-2 text-left">
              <tr>
                <th className="px-3 py-1.5">Parâmetro</th>
                <th className="px-3 py-1.5 text-right">Valor</th>
                <th className="px-3 py-1.5 text-right">Erro padrão</th>
              </tr>
            </thead>
            <tbody className="tabular-nums">
              {outcome.result.params.map((value, index) => (
                <tr key={outcome.result.paramNames[index]}>
                  <th scope="row" className="px-3 py-1.5 text-left font-medium">
                    {outcome.result.paramNames[index]}
                  </th>
                  <td className="px-3 py-1.5 text-right">{format(value)}</td>
                  <td className="px-3 py-1.5 text-right">
                    ± {format(outcome.result.stderr[index] ?? Number.NaN)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p>
            R² = {format(outcome.result.r2)}, R² ajustado = {format(outcome.result.r2adj)},{" "}
            {outcome.result.n} pontos.
          </p>
          <p className="text-muted text-xs">
            Método:{" "}
            {outcome.result.method === "linear"
              ? "mínimos quadrados lineares"
              : "mínimos quadrados não lineares (Levenberg-Marquardt, com chute inicial por linearização)"}
            {outcome.result.weighted ? ", ponderado por 1/σ²" : ""}.
          </p>
          {showResiduals ? (
            <EChart build={residualOption} height={220} label="Resíduos do ajuste" />
          ) : null}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={BUTTON}
              onClick={() => void copy(equationText(outcome.result, names))}
            >
              Copiar equação
            </button>
            <button
              type="button"
              className={BUTTON}
              onClick={() => void copy(equationLatex(outcome.result, names))}
            >
              Copiar LaTeX
            </button>
          </div>
        </div>
      )}

      {guide ? (
        <div className="space-y-2 text-sm">
          <p>{guide.explanation}</p>
          <button
            type="button"
            className={BUTTON}
            onClick={() => {
              for (const formula of [guide.xFormula, guide.yFormula]) {
                if (!formula) continue;
                const source = formula.includes("x") ? xColumn : yColumn;
                const symbol = source?.column.symbol;
                if (!symbol) continue;
                dispatch({ type: "addColumn", calculated: true });
                dispatch({
                  type: "updateLastColumn",
                  patch: {
                    name: formula.replace(/x|y/, symbol),
                    formula: formula.replace(/x|y/, symbol),
                  },
                });
              }
            }}
          >
            Linearizar (criar colunas calculadas)
          </button>
          <p className="text-muted text-xs">
            Dê um símbolo às colunas X e Y (por exemplo, x e y) para a linearização usá-los.
          </p>
        </div>
      ) : null}

      <div className="overflow-x-auto">
        <table className="border-grid w-full min-w-[420px] border text-sm">
          <caption className="sr-only">Estatística por coluna</caption>
          <thead className="bg-surface-2 text-left">
            <tr>
              <th className="px-3 py-1.5">Coluna</th>
              <th className="px-3 py-1.5 text-right">n</th>
              <th className="px-3 py-1.5 text-right">Média</th>
              <th className="px-3 py-1.5 text-right">Desvio-padrão</th>
              <th className="px-3 py-1.5 text-right">Mín.</th>
              <th className="px-3 py-1.5 text-right">Máx.</th>
              <th className="px-3 py-1.5 text-right">σ/√n</th>
            </tr>
          </thead>
          <tbody className="tabular-nums">
            {resolved
              .filter((item) => item.column.kind === "number")
              .map((item) => {
                const stats = columnStats(item.values);
                return (
                  <tr key={item.column.id}>
                    <th scope="row" className="px-3 py-1.5 text-left font-medium">
                      {item.column.name}
                    </th>
                    {stats ? (
                      <>
                        <td className="px-3 py-1.5 text-right">{stats.n}</td>
                        <td className="px-3 py-1.5 text-right">{format(stats.mean)}</td>
                        <td className="px-3 py-1.5 text-right">{format(stats.sd)}</td>
                        <td className="px-3 py-1.5 text-right">{format(stats.min)}</td>
                        <td className="px-3 py-1.5 text-right">{format(stats.max)}</td>
                        <td className="px-3 py-1.5 text-right">{format(stats.sem)}</td>
                      </>
                    ) : (
                      <td colSpan={6} className="text-muted px-3 py-1.5">
                        sem valores
                      </td>
                    )}
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
