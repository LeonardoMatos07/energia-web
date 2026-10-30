"use client";

import { useId, useMemo, useState, type Dispatch } from "react";
import { ignoredCount, resolveTable } from "@/lib/plotter/data";
import {
  detectHeader,
  FileTooLargeError,
  MAX_ROWS,
  parseTable,
  readFile,
  type DecimalSeparator,
} from "@/lib/plotter/parse";
import {
  emptyState,
  newColumnId,
  type Column,
  type PlotterAction,
  type PlotterState,
} from "@/lib/plotter/state";
import { defaultUnit, getQuantity, QUANTITIES, suggestUnit } from "@/lib/plotter/units";

const FIELD = "border-grid bg-surface rounded-md border px-2 py-1 text-sm";
const BUTTON =
  "border-grid hover:bg-surface-2 rounded-full border px-3 py-1.5 text-sm font-medium disabled:opacity-40";

/** Raw rows (header optional) to a fresh plotter state; the first column is X, the rest are Y. */
export function stateFromRows(rows: string[][], header: boolean): PlotterState {
  const width = Math.max(1, ...rows.map((row) => row.length));
  const names = header ? (rows[0] ?? []) : [];
  const body = header ? rows.slice(1) : rows;
  const columns: Column[] = Array.from({ length: width }, (_, index) => ({
    id: newColumnId(),
    name: names[index]?.trim() || (index === 0 ? "x" : `y${index}`),
    kind: "number" as const,
    quantity: "custom",
    dataUnit: "",
    displayUnit: "",
  }));
  const base = emptyState();
  return {
    ...base,
    columns,
    rows: body.map((row) => columns.map((_, index) => row[index] ?? "")),
    chart: {
      ...base.chart,
      xColumn: columns[0]?.id ?? null,
      yColumns: columns.slice(1, 2).map((column) => column.id),
      xLabel: columns[0]?.name ?? "x",
      yLabel: columns[1]?.name ?? "y",
    },
  };
}

export function DataPanel({
  state,
  dispatch,
}: {
  state: PlotterState;
  dispatch: Dispatch<PlotterAction>;
}) {
  const baseId = useId();
  const [pasted, setPasted] = useState("");
  const [header, setHeader] = useState<"auto" | "yes" | "no">("auto");
  const [notice, setNotice] = useState<string | null>(null);
  const [sheets, setSheets] = useState<{ name: string; rows: string[][] }[]>([]);
  const resolved = useMemo(() => resolveTable(state), [state]);
  const ignored = ignoredCount(resolved);

  function load(rows: string[][], truncated: boolean) {
    if (rows.length === 0) {
      setNotice("Não encontrei dados para importar.");
      return;
    }
    const hasHeader = header === "auto" ? detectHeader(rows) : header === "yes";
    dispatch({ type: "load", state: stateFromRows(rows, hasHeader) });
    setNotice(
      truncated ? `Mostrando só as primeiras ${MAX_ROWS.toLocaleString("pt-BR")} linhas.` : null,
    );
  }

  async function onFile(file: File | undefined) {
    if (!file) return;
    try {
      const { tables, truncated } = await readFile(file);
      setSheets(tables.length > 1 ? tables : []);
      const first = tables[0];
      if (first) load(first.rows, truncated);
    } catch (error) {
      setNotice(
        error instanceof FileTooLargeError
          ? error.message
          : "Não consegui ler este arquivo. Use CSV, TSV, TXT ou XLSX.",
      );
    }
  }

  function updateColumn(index: number, patch: Partial<Column>) {
    const column = state.columns[index];
    if (!column) return;
    dispatch({ type: "updateColumn", column: index, patch });
  }

  return (
    <section aria-label="Dados" className="space-y-4">
      <div className="border-grid bg-surface shadow-card space-y-3 rounded-2xl border p-4">
        <label htmlFor={`${baseId}-paste`} className="text-sm font-semibold">
          Colar dados (Excel, Planilhas, CSV)
        </label>
        <textarea
          id={`${baseId}-paste`}
          className={`${FIELD} h-24 w-full font-mono`}
          value={pasted}
          onChange={(event) => setPasted(event.target.value)}
          placeholder={"V\tI\n1,0\t0,10\n2,0\t0,21"}
        />
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className={BUTTON}
            disabled={!pasted.trim()}
            onClick={() => {
              const parsed = parseTable(pasted);
              load(parsed.rows, parsed.truncated);
            }}
          >
            Usar estes dados
          </button>
          <label className="text-sm">
            <span className="sr-only">Arquivo CSV, TSV, TXT ou XLSX</span>
            <input
              type="file"
              accept=".csv,.tsv,.txt,.xlsx"
              className="text-sm"
              onChange={(event) => void onFile(event.target.files?.[0])}
            />
          </label>
          <label className="flex items-center gap-2 text-sm">
            Cabeçalho
            <select
              className={FIELD}
              value={header}
              onChange={(event) => setHeader(event.target.value as typeof header)}
            >
              <option value="auto">Detectar</option>
              <option value="yes">Primeira linha é cabeçalho</option>
              <option value="no">Sem cabeçalho</option>
            </select>
          </label>
        </div>
        {sheets.length > 1 ? (
          <label className="flex items-center gap-2 text-sm">
            Aba
            <select
              className={FIELD}
              onChange={(event) => {
                const sheet = sheets.find((item) => item.name === event.target.value);
                if (sheet) load(sheet.rows, false);
              }}
            >
              {sheets.map((sheet) => (
                <option key={sheet.name}>{sheet.name}</option>
              ))}
            </select>
          </label>
        ) : null}
        {notice ? (
          <p role="status" className="text-sm text-amber-700 dark:text-amber-300">
            {notice}
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button type="button" className={BUTTON} onClick={() => dispatch({ type: "addRow" })}>
          + Linha
        </button>
        <button type="button" className={BUTTON} onClick={() => dispatch({ type: "addColumn" })}>
          + Coluna
        </button>
        <button
          type="button"
          className={BUTTON}
          onClick={() => dispatch({ type: "addColumn", calculated: true })}
        >
          + Coluna calculada
        </button>
        <button type="button" className={BUTTON} onClick={() => dispatch({ type: "undo" })}>
          Desfazer
        </button>
        <button type="button" className={BUTTON} onClick={() => dispatch({ type: "redo" })}>
          Refazer
        </button>
        {ignored > 0 ? (
          <span role="status" className="text-sm font-medium text-red-600 dark:text-red-400">
            {ignored} {ignored === 1 ? "valor ignorado" : "valores ignorados"}
          </span>
        ) : null}
      </div>

      <div className="overflow-x-auto">
        <table className="border-grid bg-surface w-full min-w-[480px] border text-sm">
          <caption className="sr-only">Tabela de dados do experimento</caption>
          <thead className="bg-surface-2 align-top">
            <tr>
              <th className="w-8 px-1" />
              {state.columns.map((column, index) => {
                const quantity = getQuantity(column.quantity);
                const values = (resolved[index]?.values ?? []).filter(
                  (value): value is number => value !== null,
                );
                const suggestion = column.formula
                  ? null
                  : suggestUnit(values, column.quantity ?? "custom", column.displayUnit ?? "");
                return (
                  <th key={column.id} scope="col" className="min-w-36 space-y-1 p-2 text-left">
                    <input
                      aria-label={`Nome da coluna ${index + 1}`}
                      className={`${FIELD} w-full font-semibold`}
                      value={column.name}
                      onChange={(event) => updateColumn(index, { name: event.target.value })}
                    />
                    <input
                      aria-label={`Símbolo da coluna ${column.name}`}
                      className={`${FIELD} w-full font-mono`}
                      placeholder="símbolo (V, I…)"
                      value={column.symbol ?? ""}
                      onChange={(event) => updateColumn(index, { symbol: event.target.value })}
                    />
                    <select
                      aria-label={`Grandeza de ${column.name}`}
                      className={`${FIELD} w-full`}
                      value={column.quantity ?? "custom"}
                      onChange={(event) =>
                        updateColumn(index, {
                          quantity: event.target.value,
                          dataUnit: defaultUnit(event.target.value),
                          displayUnit: defaultUnit(event.target.value),
                        })
                      }
                    >
                      {QUANTITIES.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                    {quantity.units.length > 0 ? (
                      <div className="flex gap-1">
                        {column.formula ? null : (
                          <select
                            aria-label={`Unidade dos dados de ${column.name}`}
                            className={`${FIELD} w-1/2`}
                            value={column.dataUnit}
                            onChange={(event) =>
                              updateColumn(index, { dataUnit: event.target.value })
                            }
                          >
                            {quantity.units.map((unit) => (
                              <option key={unit.symbol}>{unit.symbol}</option>
                            ))}
                          </select>
                        )}
                        <select
                          aria-label={`Unidade de exibição de ${column.name}`}
                          className={`${FIELD} ${column.formula ? "w-full" : "w-1/2"}`}
                          value={column.displayUnit}
                          onChange={(event) =>
                            updateColumn(index, { displayUnit: event.target.value })
                          }
                        >
                          {quantity.units.map((unit) => (
                            <option key={unit.symbol}>{unit.symbol}</option>
                          ))}
                        </select>
                      </div>
                    ) : null}
                    {suggestion ? (
                      <button
                        type="button"
                        className="text-accent-strong text-xs underline"
                        onClick={() => updateColumn(index, { displayUnit: suggestion })}
                      >
                        Mostrar em {suggestion}?
                      </button>
                    ) : null}
                    <label className="block text-xs font-normal">
                      Decimal
                      <select
                        className={`${FIELD} ml-1`}
                        value={column.decimal ?? "auto"}
                        onChange={(event) =>
                          updateColumn(index, { decimal: event.target.value as DecimalSeparator })
                        }
                      >
                        <option value="auto">auto</option>
                        <option value=",">vírgula</option>
                        <option value=".">ponto</option>
                      </select>
                    </label>
                    {column.formula !== undefined ? (
                      <input
                        aria-label={`Fórmula de ${column.name}`}
                        className={`${FIELD} w-full font-mono`}
                        placeholder="ex.: V * I"
                        value={column.formula}
                        onChange={(event) => updateColumn(index, { formula: event.target.value })}
                      />
                    ) : null}
                    {resolved[index]?.error ? (
                      <p role="alert" className="text-xs text-red-600 dark:text-red-400">
                        {resolved[index].error}
                      </p>
                    ) : null}
                    <button
                      type="button"
                      className="text-muted text-xs underline"
                      onClick={() => dispatch({ type: "removeColumn", column: index })}
                    >
                      Remover coluna
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {state.rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                <th scope="row" className="px-1 text-center">
                  <button
                    type="button"
                    aria-label={`Remover linha ${rowIndex + 1}`}
                    className="text-muted"
                    onClick={() => dispatch({ type: "removeRow", row: rowIndex })}
                  >
                    ×
                  </button>
                </th>
                {state.columns.map((column, columnIndex) => {
                  const value = row[columnIndex] ?? "";
                  const calculated = column.formula !== undefined;
                  const shown = resolved[columnIndex]?.values[rowIndex];
                  const invalid =
                    !calculated &&
                    column.kind === "number" &&
                    value.trim() !== "" &&
                    shown === null;
                  return (
                    <td key={column.id} className="p-0.5">
                      {calculated ? (
                        <span className="text-ink-2 block px-2 py-1 tabular-nums">
                          {shown === null || shown === undefined
                            ? ""
                            : String(Number(shown.toPrecision(8)))}
                        </span>
                      ) : (
                        <input
                          aria-label={`${column.name}, linha ${rowIndex + 1}`}
                          aria-invalid={invalid || undefined}
                          className={`${FIELD} w-full tabular-nums ${
                            invalid ? "border-red-500 bg-red-500/10" : ""
                          }`}
                          value={value}
                          onChange={(event) =>
                            dispatch({
                              type: "setCell",
                              row: rowIndex,
                              column: columnIndex,
                              value: event.target.value,
                            })
                          }
                        />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
