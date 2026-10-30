import { describe, expect, it } from "vitest";
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
