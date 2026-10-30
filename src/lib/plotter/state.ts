export const SCHEMA_VERSION = 1;

export type ChartKind = "scatter" | "line" | "bar";

export interface Column {
  id: string;
  name: string;
  kind: "number" | "text";
  /** Quantity id from units.ts; defaults to "custom" (no conversion). */
  quantity?: string;
  /** Unit the values were measured in. */
  dataUnit?: string;
  /** Unit shown in the chart; values are converted from dataUnit. */
  displayUnit?: string;
  decimal?: "auto" | "," | ".";
  /** Variable name used by formulas, for example "V" or "I". */
  symbol?: string;
  /** Calculated column: formula over the other columns, in their display units. */
  formula?: string;
}

export interface ChartConfig {
  kind: ChartKind;
  title: string;
  xColumn: string | null;
  yColumns: string[];
  xErrorColumn: string | null;
  yErrorColumn: string | null;
  xLog: boolean;
  yLog: boolean;
  xLabel: string;
  yLabel: string;
}

export interface PlotterState {
  schemaVersion: number;
  columns: Column[];
  rows: string[][];
  chart: ChartConfig;
}

export interface History<T> {
  past: T[];
  present: T;
  future: T[];
}

const HISTORY_LIMIT = 100;

export function createHistory<T>(present: T): History<T> {
  return { past: [], present, future: [] };
}

export function commit<T>(history: History<T>, next: T): History<T> {
  if (Object.is(next, history.present)) return history;
  return {
    past: [...history.past, history.present].slice(-HISTORY_LIMIT),
    present: next,
    future: [],
  };
}

export function undo<T>(history: History<T>): History<T> {
  const previous = history.past.at(-1);
  if (previous === undefined) return history;
  return {
    past: history.past.slice(0, -1),
    present: previous,
    future: [history.present, ...history.future],
  };
}

export function redo<T>(history: History<T>): History<T> {
  const [next, ...future] = history.future;
  if (next === undefined) return history;
  return { past: [...history.past, history.present], present: next, future };
}

export type PlotterAction =
  | { type: "setCell"; row: number; column: number; value: string }
  | { type: "addRow" }
  | { type: "removeRow"; row: number }
  | { type: "addColumn"; kind?: Column["kind"]; calculated?: boolean }
  | { type: "updateColumn"; column: number; patch: Partial<Column> }
  | { type: "updateLastColumn"; patch: Partial<Column> }
  | { type: "removeColumn"; column: number }
  | { type: "renameColumn"; column: number; name: string }
  | { type: "setChart"; patch: Partial<ChartConfig> }
  | { type: "load"; state: PlotterState }
  | { type: "undo" }
  | { type: "redo" };

let counter = 0;
export function newColumnId(): string {
  counter += 1;
  return `c${Date.now().toString(36)}${counter}`;
}

export function emptyState(): PlotterState {
  return {
    schemaVersion: SCHEMA_VERSION,
    columns: [
      { id: "x", name: "x", kind: "number" },
      { id: "y", name: "y", kind: "number" },
    ],
    rows: [
      ["", ""],
      ["", ""],
    ],
    chart: {
      kind: "scatter",
      title: "",
      xColumn: "x",
      yColumns: ["y"],
      xErrorColumn: null,
      yErrorColumn: null,
      xLog: false,
      yLog: false,
      xLabel: "x",
      yLabel: "y",
    },
  };
}

function reduceState(state: PlotterState, action: PlotterAction): PlotterState {
  switch (action.type) {
    case "setCell": {
      const rows = state.rows.map((row, index) =>
        index === action.row
          ? row.map((cell, i) => (i === action.column ? action.value : cell))
          : row,
      );
      return { ...state, rows };
    }
    case "addRow":
      return { ...state, rows: [...state.rows, state.columns.map(() => "")] };
    case "removeRow":
      return { ...state, rows: state.rows.filter((_, index) => index !== action.row) };
    case "addColumn": {
      const column: Column = {
        id: newColumnId(),
        name: `col${state.columns.length + 1}`,
        kind: action.kind ?? "number",
        ...(action.calculated
          ? { formula: "", quantity: "custom", dataUnit: "", displayUnit: "" }
          : {}),
      };
      return {
        ...state,
        columns: [...state.columns, column],
        rows: state.rows.map((row) => [...row, ""]),
      };
    }
    case "removeColumn": {
      const removed = state.columns[action.column];
      if (!removed || state.columns.length <= 1) return state;
      const keep = (id: string | null) => (id === removed.id ? null : id);
      return {
        ...state,
        columns: state.columns.filter((_, index) => index !== action.column),
        rows: state.rows.map((row) => row.filter((_, index) => index !== action.column)),
        chart: {
          ...state.chart,
          xColumn: keep(state.chart.xColumn),
          xErrorColumn: keep(state.chart.xErrorColumn),
          yErrorColumn: keep(state.chart.yErrorColumn),
          yColumns: state.chart.yColumns.filter((id) => id !== removed.id),
        },
      };
    }
    case "updateColumn":
      return {
        ...state,
        columns: state.columns.map((column, index) =>
          index === action.column ? { ...column, ...action.patch } : column,
        ),
      };
    case "updateLastColumn":
      return reduceState(state, {
        type: "updateColumn",
        column: state.columns.length - 1,
        patch: action.patch,
      });
    case "renameColumn":
      return {
        ...state,
        columns: state.columns.map((column, index) =>
          index === action.column ? { ...column, name: action.name } : column,
        ),
      };
    case "setChart":
      return { ...state, chart: { ...state.chart, ...action.patch } };
    case "load":
      return action.state;
    default:
      return state;
  }
}

export function plotterReducer(
  history: History<PlotterState>,
  action: PlotterAction,
): History<PlotterState> {
  if (action.type === "undo") return undo(history);
  if (action.type === "redo") return redo(history);
  if (action.type === "load") return createHistory(action.state);
  return commit(history, reduceState(history.present, action));
}
