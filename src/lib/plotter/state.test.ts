import { describe, expect, it } from "vitest";
import { buildFigure } from "./figure";
import {
  createHistory,
  emptyState,
  plotterReducer,
  SCHEMA_VERSION,
  type History,
  type PlotterAction,
  type PlotterState,
} from "./state";

function run(actions: PlotterAction[], start: PlotterState = emptyState()): History<PlotterState> {
  return actions.reduce(plotterReducer, createHistory(start));
}

describe("plotter reducer", () => {
  it("starts at the current schema version", () => {
    expect(emptyState().schemaVersion).toBe(SCHEMA_VERSION);
  });

  it("edits cells and undoes and redoes the edit", () => {
    const edited = run([{ type: "setCell", row: 0, column: 0, value: "1,5" }]);
    expect(edited.present.rows[0]?.[0]).toBe("1,5");

    const undone = plotterReducer(edited, { type: "undo" });
    expect(undone.present.rows[0]?.[0]).toBe("");

    const redone = plotterReducer(undone, { type: "redo" });
    expect(redone.present.rows[0]?.[0]).toBe("1,5");
  });

  it("clears the redo stack after a new edit", () => {
    const history = run([
      { type: "setCell", row: 0, column: 0, value: "1" },
      { type: "undo" },
      { type: "setCell", row: 0, column: 0, value: "2" },
    ]);
    expect(history.future).toHaveLength(0);
    expect(plotterReducer(history, { type: "redo" })).toBe(history);
  });

  it("adds and removes rows and columns keeping rows rectangular", () => {
    const grown = run([{ type: "addRow" }, { type: "addColumn" }]);
    expect(grown.present.rows).toHaveLength(3);
    expect(grown.present.rows.every((row) => row.length === 3)).toBe(true);

    const shrunk = plotterReducer(grown, { type: "removeColumn", column: 1 });
    expect(shrunk.present.columns).toHaveLength(2);
    expect(shrunk.present.chart.yColumns).toEqual([]);
    expect(shrunk.present.rows.every((row) => row.length === 2)).toBe(true);
  });

  it("never removes the last column", () => {
    const one = run([
      { type: "removeColumn", column: 1 },
      { type: "removeColumn", column: 0 },
    ]);
    expect(one.present.columns).toHaveLength(1);
  });

  it("load replaces the state and drops the history", () => {
    const history = run([{ type: "addRow" }]);
    const loaded = plotterReducer(history, { type: "load", state: emptyState() });
    expect(loaded.past).toHaveLength(0);
  });
});

describe("buildFigure", () => {
  const state = (): PlotterState => {
    const base = emptyState();
    return {
      ...base,
      columns: [...base.columns, { id: "e", name: "erro", kind: "number" }],
      rows: [
        ["1", "10", "0,5"],
        ["10", "100", "5"],
        ["100", "abc", "50"],
        ["", "5", "1"],
      ],
      chart: { ...base.chart, xLog: true, yLog: true, yErrorColumn: "e" },
    };
  };

  it("uses log axes and keeps error bars aligned with the kept points", () => {
    const figure = buildFigure(state());
    const trace = figure.data[0] as Record<string, unknown>;

    expect((figure.layout.xaxis as { type: string }).type).toBe("log");
    expect((figure.layout.yaxis as { type: string }).type).toBe("log");
    expect(trace.x).toEqual([1, 10]);
    expect(trace.y).toEqual([10, 100]);
    expect((trace.error_y as { array: number[] }).array).toEqual([0.5, 5]);
  });

  it("drops non-positive values on a log axis", () => {
    const figure = buildFigure({
      ...state(),
      rows: [
        ["0", "10", "1"],
        ["5", "10", "1"],
      ],
    });
    expect((figure.data[0] as { x: number[] }).x).toEqual([5]);
  });
});
