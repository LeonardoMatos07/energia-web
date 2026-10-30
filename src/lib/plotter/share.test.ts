// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import { demoState } from "@/components/plotter/plotter-app";
import {
  clearLocal,
  decodeHash,
  encodeHash,
  fromPlotJson,
  loadLocal,
  MAX_HASH_CHARS,
  migrateState,
  saveLocal,
  StateFormatError,
  toCsv,
  toPlotJson,
} from "./share";
import { emptyState, SCHEMA_VERSION } from "./state";

describe("share links and files", () => {
  it("round-trips through the URL hash", () => {
    const state = demoState();
    const { hash, tooLong } = encodeHash(state);
    expect(tooLong).toBe(false);
    expect(decodeHash(`#${hash}`)).toEqual(state);
  });

  it("warns when the link would be too long", () => {
    const state = demoState();
    state.rows = Array.from({ length: 2000 }, (_, i) => [
      String(i * 1.2345),
      String(Math.sin(i) * 777),
      String(i % 7),
    ]);
    const { hash, tooLong } = encodeHash(state);
    expect(tooLong).toBe(true);
    expect(hash.length).toBeGreaterThan(MAX_HASH_CHARS);
  });

  it("round-trips through .plot.json", () => {
    const state = demoState();
    expect(fromPlotJson(toPlotJson(state))).toEqual(state);
  });

  it("ignores a broken or empty hash", () => {
    expect(decodeHash("")).toBeNull();
    expect(decodeHash("#not-a-valid-state")).toBeNull();
  });

  it("rejects files that are not a plot", () => {
    expect(() => fromPlotJson("{")).toThrow(StateFormatError);
    expect(() => fromPlotJson("[1,2]")).toThrow(StateFormatError);
    const badColumns = { schemaVersion: 1, columns: [{ x: 1 }], rows: [], chart: {} };
    expect(() => fromPlotJson(JSON.stringify(badColumns))).toThrow(StateFormatError);
  });
});

describe("schema versions", () => {
  it("opens an old state that has no schemaVersion", () => {
    const legacy = {
      columns: [
        { id: "x", name: "x", kind: "number" },
        { id: "y", name: "y", kind: "number" },
      ],
      rows: [["1", "2"], ["3"]],
      chart: { kind: "line", xColumn: "x", yColumns: ["y"] },
    };
    const migrated = migrateState(legacy);
    expect(migrated.schemaVersion).toBe(SCHEMA_VERSION);
    expect(migrated.rows).toEqual([
      ["1", "2"],
      ["3", ""],
    ]);
    expect(migrated.chart.kind).toBe("line");
    expect(migrated.chart.xLog).toBe(false);
  });

  it("refuses a state from a newer version", () => {
    expect(() => migrateState({ ...emptyState(), schemaVersion: SCHEMA_VERSION + 1 })).toThrow(
      /mais nova/,
    );
  });
});

describe("local storage", () => {
  beforeEach(() => window.localStorage.clear());

  it("saves and restores", () => {
    expect(saveLocal(demoState())).toBe(true);
    expect(loadLocal()).toEqual(demoState());
    clearLocal();
    expect(loadLocal()).toBeNull();
  });

  it("keeps working when storage throws", () => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = () => {
      throw new Error("blocked");
    };
    try {
      expect(saveLocal(demoState())).toBe(false);
    } finally {
      Storage.prototype.setItem = original;
    }
  });

  it("ignores corrupt saved data", () => {
    window.localStorage.setItem("spillway.plotter", "{oops");
    expect(loadLocal()).toBeNull();
  });
});

describe("toCsv", () => {
  it("exports converted and calculated values with the chosen separator and decimal", () => {
    const state = demoState();
    state.columns[1] = { ...state.columns[1]!, displayUnit: "A" };
    state.columns.push({
      id: "p",
      name: "Potência",
      kind: "number",
      quantity: "active-power",
      dataUnit: "W",
      displayUnit: "W",
      formula: "V * I",
    });
    state.rows = state.rows.map((row) => [...row, ""]);
    const lines = toCsv(state).split("\n");
    expect(lines[0]).toBe("Tensão (V);Corrente (A);Erro da corrente (mA);Potência (W)");
    expect(lines[1]).toBe("0,5;0,049;5;0,0245");
    expect(toCsv(state, { decimal: "." }).split("\n")[1]).toBe("0.5,0.049,5,0.0245");
  });
});
