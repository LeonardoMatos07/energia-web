import LZString from "lz-string";
import { resolveTable } from "./data";
import { emptyState, SCHEMA_VERSION, type PlotterState } from "./state";
import { axisLabel } from "./units";

/** Above this the link is too long to share comfortably: offer the .plot.json file instead. */
export const MAX_HASH_CHARS = 8000;
export const STORAGE_KEY = "spillway.plotter";

export class StateFormatError extends Error {}

type Migration = (raw: Record<string, unknown>) => Record<string, unknown>;

/** MIGRATIONS[n] upgrades a state saved with schemaVersion n to n + 1. Old links must keep opening. */
const MIGRATIONS: Record<number, Migration> = {
  // v0 had no schemaVersion and no per-column quantity or units.
  0: (raw) => ({ ...raw, schemaVersion: 1 }),
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

/** Brings any saved state to the current version and checks its shape. Never trusts the input. */
export function migrateState(raw: unknown): PlotterState {
  if (!isRecord(raw)) throw new StateFormatError("Arquivo inválido.");
  let current: Record<string, unknown> = raw;
  let version = typeof current.schemaVersion === "number" ? current.schemaVersion : 0;
  if (version > SCHEMA_VERSION) {
    throw new StateFormatError("Este gráfico foi criado numa versão mais nova do plotador.");
  }
  while (version < SCHEMA_VERSION) {
    const step = MIGRATIONS[version];
    if (!step) throw new StateFormatError("Versão do gráfico não reconhecida.");
    current = step(current);
    version += 1;
  }

  const { columns, rows, chart } = current;
  if (!Array.isArray(columns) || !Array.isArray(rows) || !isRecord(chart)) {
    throw new StateFormatError("Arquivo inválido.");
  }
  if (!columns.every((column) => isRecord(column) && typeof column.id === "string")) {
    throw new StateFormatError("Colunas inválidas.");
  }
  if (!rows.every(isStringArray)) throw new StateFormatError("Linhas inválidas.");
  const base = emptyState();
  return {
    schemaVersion: SCHEMA_VERSION,
    columns: columns as unknown as PlotterState["columns"],
    rows: rows.map((row) => columns.map((_, index) => row[index] ?? "")),
    chart: { ...base.chart, ...(chart as unknown as PlotterState["chart"]) },
  };
}

export function toPlotJson(state: PlotterState): string {
  return JSON.stringify(state);
}

export function fromPlotJson(text: string): PlotterState {
  try {
    return migrateState(JSON.parse(text));
  } catch (error) {
    if (error instanceof StateFormatError) throw error;
    throw new StateFormatError("Arquivo inválido.");
  }
}

/** The whole state, compressed into a URL fragment: nothing goes through the server. */
export function encodeHash(state: PlotterState): { hash: string; tooLong: boolean } {
  const hash = LZString.compressToEncodedURIComponent(toPlotJson(state));
  return { hash, tooLong: hash.length > MAX_HASH_CHARS };
}

export function decodeHash(hash: string): PlotterState | null {
  const text = hash.replace(/^#/, "");
  if (!text) return null;
  try {
    const json = LZString.decompressFromEncodedURIComponent(text);
    return json ? fromPlotJson(json) : null;
  } catch {
    return null;
  }
}

export function saveLocal(state: PlotterState): boolean {
  try {
    window.localStorage.setItem(STORAGE_KEY, toPlotJson(state));
    return true;
  } catch {
    return false;
  }
}

export function loadLocal(): PlotterState | null {
  try {
    const text = window.localStorage.getItem(STORAGE_KEY);
    return text ? fromPlotJson(text) : null;
  } catch {
    return null;
  }
}

export function clearLocal(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // storage blocked: nothing to clear
  }
}

function formatCell(value: number | null, decimal: "," | "."): string {
  if (value === null) return "";
  const text = String(value);
  return decimal === "," ? text.replace(".", ",") : text;
}

function quote(cell: string, separator: string): string {
  return cell.includes(separator) || cell.includes('"') || cell.includes("\n")
    ? `"${cell.replace(/"/g, '""')}"`
    : cell;
}

/** CSV of what is plotted: converted to the display units, calculated columns included. */
export function toCsv(
  state: PlotterState,
  options: { separator?: ";" | "," | "\t"; decimal?: "," | "." } = {},
): string {
  const decimal = options.decimal ?? ",";
  const separator = options.separator ?? (decimal === "," ? ";" : ",");
  const resolved = resolveTable(state);
  const header = resolved.map((item) =>
    quote(axisLabel(item.column.name, item.column.displayUnit ?? ""), separator),
  );
  const lines = state.rows.map((_, row) =>
    resolved
      .map((item, index) => {
        if (item.column.kind === "text") return quote(state.rows[row]?.[index] ?? "", separator);
        return formatCell(item.values[row] ?? null, decimal);
      })
      .join(separator),
  );
  return [header.join(separator), ...lines].join("\n");
}
