import { describe, expect, it } from "vitest";
import { resolveTable } from "./data";
import { compileFormula, FormulaError } from "./formula";
import {
  detectDecimal,
  detectDelimiter,
  detectHeader,
  parseColumn,
  parseNumber,
  parseTable,
} from "./parse";
import { emptyState, type PlotterState } from "./state";
import { axisLabel, convert, convertDelta, suggestUnit } from "./units";

describe("parseNumber", () => {
  it.each([
    ["1,5", ",", 1.5],
    ["1.5", ".", 1.5],
    ["1.234,5", ",", 1234.5],
    ["1,234.5", ".", 1234.5],
    ["1,2e-3", ",", 0.0012],
    ["1,2E-3", ",", 0.0012],
    ["1.2E-3", ".", 0.0012],
    ["-0,5", ",", -0.5],
    [" 12 ", ",", 12],
    ["1.234.567,89", ",", 1234567.89],
  ] as const)("%s with decimal %s is %s", (text, decimal, expected) => {
    expect(parseNumber(text, decimal)).toBeCloseTo(expected, 12);
  });

  it.each(["abc", "1,2,3", "1..2", "--1", "", "  ", "1e"])("rejects %j", (text) => {
    expect(parseNumber(text, ",")).toBeNull();
  });
});

describe("decimal separator detection", () => {
  it("decides by the whole column, not cell by cell", () => {
    expect(detectDecimal(["1,5", "2", "3,25"])).toBe(",");
    expect(detectDecimal(["1.5", "2", "3.25"])).toBe(".");
    expect(detectDecimal(["1.234,5", "2,5"])).toBe(",");
    expect(detectDecimal(["1,234.5", "2.5"])).toBe(".");
  });

  it("reads 1.234 as a thousand separator only when the column says comma", () => {
    expect(parseColumn(["1.234", "2,5"], "auto").values).toEqual([1234, 2.5]);
    expect(parseColumn(["1.234", "2.5"], "auto").values).toEqual([1.234, 2.5]);
  });

  it("can be forced", () => {
    expect(parseColumn(["1.5", "2,000"], ".").values).toEqual([1.5, 2000]);
    expect(parseColumn(["1,5", "2.000"], ",").values).toEqual([1.5, 2000]);
    // a separator that is not the forced one and is not a thousands group is not a number
    expect(parseColumn(["1,5"], ".")).toMatchObject({ values: [null], ignored: 1 });
  });

  it("counts ignored cells and leaves empty ones out of the count", () => {
    const column = parseColumn(["1", "x", "", "3", "n/a"], "auto");
    expect(column.values).toEqual([1, null, null, 3, null]);
    expect(column.ignored).toBe(2);
  });
});

describe("parseTable", () => {
  it("detects tab, semicolon, comma and whitespace", () => {
    expect(detectDelimiter("a\tb\n1\t2")).toBe("\t");
    expect(detectDelimiter("a;b\n1,5;2,5")).toBe(";");
    expect(detectDelimiter("a,b\n1,2")).toBe(",");
    expect(detectDelimiter("1,5 2,5\n2,5 3,5")).toBe(" ");
  });

  it("pastes from a spreadsheet with decimal commas", () => {
    const { rows } = parseTable("V\tI\n1,5\t0,10\n3,0\t0,21");
    expect(rows).toEqual([
      ["V", "I"],
      ["1,5", "0,10"],
      ["3,0", "0,21"],
    ]);
  });

  it("handles quoted cells and pads short rows", () => {
    const { rows } = parseTable('nome,valor\n"a, b",1\nc');
    expect(rows).toEqual([
      ["nome", "valor"],
      ["a, b", "1"],
      ["c", ""],
    ]);
  });

  it("detects a header only when the first row is text over numbers", () => {
    expect(
      detectHeader([
        ["V", "I"],
        ["1", "2"],
      ]),
    ).toBe(true);
    expect(
      detectHeader([
        ["1", "2"],
        ["3", "4"],
      ]),
    ).toBe(false);
    expect(
      detectHeader([
        ["Material", "ρ"],
        ["Cobre", "1,7"],
      ]),
    ).toBe(true);
  });
});

describe("units", () => {
  it("converts with prefixes", () => {
    expect(convert(250, "current", "mA", "A")).toBeCloseTo(0.25, 12);
    expect(convert(0.25, "current", "A", "mA")).toBeCloseTo(250, 9);
    expect(convert(2.2, "resistance", "kΩ", "Ω")).toBeCloseTo(2200, 9);
    expect(convert(47, "capacitance", "µF", "F")).toBeCloseTo(47e-6, 15);
  });

  it("converts temperature with an offset, not only a factor", () => {
    expect(convert(0, "temperature", "°C", "K")).toBeCloseTo(273.15, 9);
    expect(convert(100, "temperature", "°C", "°F")).toBeCloseTo(212, 9);
    expect(convert(32, "temperature", "°F", "°C")).toBeCloseTo(0, 9);
    expect(convert(300, "temperature", "K", "°C")).toBeCloseTo(26.85, 9);
  });

  it("converts energy, time and angle", () => {
    expect(convert(1, "energy", "kWh", "J")).toBe(3.6e6);
    expect(convert(1, "energy", "MWh", "kWh")).toBeCloseTo(1000, 9);
    expect(convert(90, "time", "min", "h")).toBeCloseTo(1.5, 12);
    expect(convert(180, "angle", "°", "rad")).toBeCloseTo(Math.PI, 12);
    expect(convert(60, "frequency", "rpm", "Hz")).toBeCloseTo(1, 12);
  });

  it("scales a spread without the temperature offset", () => {
    expect(convertDelta(1, "temperature", "K", "°C")).toBe(1);
    expect(convertDelta(9, "temperature", "°C", "°F")).toBeCloseTo(16.2, 9);
    expect(convertDelta(5, "current", "mA", "A")).toBeCloseTo(0.005, 12);
  });

  it("does not convert across quantities or custom units", () => {
    expect(convert(5, "custom", "foo", "bar")).toBe(5);
    expect(convert(5, "current", "mA", "V")).toBe(5);
  });

  it("builds the axis label", () => {
    expect(axisLabel("Corrente", "mA")).toBe("Corrente (mA)");
    expect(axisLabel("Razão", "—")).toBe("Razão");
  });

  it("only suggests a prefix, and only for tiny or huge values", () => {
    expect(suggestUnit([0.002, 0.004], "current", "A")).toBe("mA");
    expect(suggestUnit([0.5, 1.2], "current", "A")).toBeNull();
    expect(suggestUnit([2e6, 3e6], "active-power", "W")).toBe("MW");
    expect(suggestUnit([20, 30], "temperature", "°C")).toBeNull();
  });
});

describe("formulas", () => {
  it("evaluates arithmetic, powers and the allowed functions", () => {
    expect(compileFormula("V * I").evaluate({ V: 2, I: 3 })).toBe(6);
    expect(compileFormula("V / I").evaluate({ V: 6, I: 3 })).toBe(2);
    expect(compileFormula("ln(I)").evaluate({ I: Math.E })).toBeCloseTo(1, 12);
    expect(compileFormula("log(x)").evaluate({ x: 1000 })).toBeCloseTo(3, 12);
    expect(compileFormula("sqrt(x) + x^2").evaluate({ x: 4 })).toBe(18);
    expect(compileFormula("2 * pi * f").evaluate({ f: 1 })).toBeCloseTo(2 * Math.PI, 12);
    expect(compileFormula("sin(pi / 2)").evaluate({})).toBeCloseTo(1, 12);
  });

  it("reports the variables it needs", () => {
    expect(compileFormula("P / (V * I)").symbols.sort()).toEqual(["I", "P", "V"]);
  });

  it("returns null instead of NaN or Infinity", () => {
    expect(compileFormula("ln(x)").evaluate({ x: -1 })).toBeNull();
    expect(compileFormula("1 / x").evaluate({ x: 0 })).toBeNull();
  });

  it.each([
    "import('x')",
    "evaluate('1')",
    "a = 5",
    "f(x) = x",
    "x.y",
    "[1,2]",
    "{a: 1}",
    "createUnit('a')",
    "x; y",
    "constructor",
  ])("rejects %s", (expression) => {
    expect(() => compileFormula(expression)).toThrow(FormulaError);
  });
});

describe("resolveTable", () => {
  const state = (): PlotterState => ({
    ...emptyState(),
    columns: [
      {
        id: "v",
        name: "Tensão",
        kind: "number",
        quantity: "voltage",
        dataUnit: "V",
        displayUnit: "V",
        symbol: "V",
      },
      {
        id: "i",
        name: "Corrente",
        kind: "number",
        quantity: "current",
        dataUnit: "mA",
        displayUnit: "A",
        symbol: "I",
      },
      {
        id: "p",
        name: "Potência",
        kind: "number",
        quantity: "active-power",
        dataUnit: "W",
        displayUnit: "W",
        formula: "V * I",
      },
    ],
    rows: [
      ["2", "100", ""],
      ["4,5", "200", ""],
      ["x", "300", ""],
    ],
  });

  it("converts to the display unit and fills the calculated column", () => {
    const [v, i, p] = resolveTable(state());
    expect(v?.values).toEqual([2, 4.5, null]);
    expect(v?.ignored).toBe(1);
    expect(i?.values[0]).toBeCloseTo(0.1, 12);
    expect(p?.values[0]).toBeCloseTo(0.2, 12);
    expect(p?.values[1]).toBeCloseTo(0.9, 12);
    expect(p?.values[2]).toBeNull();
  });

  it("flags a formula that uses an unknown variable", () => {
    const broken = state();
    broken.columns[2] = { ...broken.columns[2]!, formula: "V * Z" };
    expect(resolveTable(broken)[2]?.error).toMatch(/Z/);
  });
});
