import { compileFormula, FormulaError } from "./formula";
import { parseColumn } from "./parse";
import type { Column, PlotterState } from "./state";
import { convert } from "./units";

export interface ResolvedColumn {
  column: Column;
  /** Numbers in the display unit; null for empty, ignored or failed cells. */
  values: (number | null)[];
  ignored: number;
  error?: string;
}

const IDENTIFIER = /^[A-Za-z_][A-Za-z0-9_]*$/;

/**
 * Turns the raw table into numbers: parses each column (Brazilian formats included), converts
 * to the display unit and fills the calculated columns. Pure, so it is easy to test.
 */
export function resolveTable(state: PlotterState): ResolvedColumn[] {
  const resolved: ResolvedColumn[] = state.columns.map((column, index) => {
    if (column.kind === "text" || column.formula !== undefined) {
      return { column, values: state.rows.map(() => null), ignored: 0 };
    }
    const parsed = parseColumn(
      state.rows.map((row) => row[index] ?? ""),
      column.decimal ?? "auto",
    );
    const quantity = column.quantity ?? "custom";
    const from = column.dataUnit ?? "";
    const to = column.displayUnit ?? from;
    return {
      column,
      ignored: parsed.ignored,
      values: parsed.values.map((value) =>
        value === null ? null : convert(value, quantity, from, to),
      ),
    };
  });

  const bySymbol = new Map<string, ResolvedColumn>();
  for (const item of resolved) {
    const symbol = item.column.symbol;
    if (symbol && IDENTIFIER.test(symbol)) bySymbol.set(symbol, item);
  }

  resolved.forEach((item, position) => {
    const expression = item.column.formula;
    if (!expression) return;
    try {
      const compiled = compileFormula(expression);
      const inputs = compiled.symbols.map((symbol) => {
        const source = bySymbol.get(symbol);
        if (!source || source === item) throw new FormulaError(`Variável desconhecida: ${symbol}.`);
        return { symbol, source };
      });
      // Calculated columns may use earlier ones; later ones are still empty when they are read.
      const values = state.rows.map((_, row) => {
        const scope: Record<string, number> = {};
        for (const { symbol, source } of inputs) {
          const value = source.values[row];
          if (value === null || value === undefined) return null;
          scope[symbol] = value;
        }
        return compiled.evaluate(scope);
      });
      resolved[position] = { ...item, values };
    } catch (error) {
      resolved[position] = {
        ...item,
        error: error instanceof FormulaError ? error.message : "Fórmula inválida.",
      };
    }
  });
  return resolved;
}

export function ignoredCount(resolved: readonly ResolvedColumn[]): number {
  return resolved.reduce((total, item) => total + item.ignored, 0);
}
