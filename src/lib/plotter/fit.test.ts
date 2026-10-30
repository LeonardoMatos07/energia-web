import { describe, expect, it } from "vitest";
import {
  columnStats,
  equationLatex,
  equationText,
  fitCurve,
  FitError,
  linearization,
  type ModelId,
} from "./fit";
import { REFERENCE } from "./fit.reference";

// Reference values come from NumPy (polyfit, lstsq) and SciPy (curve_fit); tolerance 1e-6 relative.
function close(actual: number, expected: number, tolerance = 1e-6) {
  const scale = Math.max(Math.abs(expected), 1e-12);
  expect(Math.abs(actual - expected) / scale).toBeLessThan(tolerance);
}

function check(
  model: ModelId,
  name: keyof typeof REFERENCE,
  options: { weighted?: boolean; ascending?: boolean } = {},
) {
  const ref = REFERENCE[name] as {
    x: readonly number[];
    y: readonly number[];
    sigma?: readonly number[];
    params: readonly number[];
    stderr: readonly number[];
    r2: number;
    r2adj: number;
  };
  const result = fitCurve(model, ref.x, ref.y, options.weighted ? { sigma: ref.sigma } : {});
  // the reference lists the linear fit as [intercept, slope]; ours follows y = a·x + b
  const params = model === "linear" ? [...ref.params].reverse() : [...ref.params];
  const stderr = model === "linear" ? [...ref.stderr].reverse() : [...ref.stderr];
  const weightedParams = model === "linear" && options.weighted ? ref.params : params;
  const weightedErr = model === "linear" && options.weighted ? ref.stderr : stderr;
  result.params.forEach((value, i) => close(value, weightedParams[i]!));
  result.stderr.forEach((value, i) => close(value, weightedErr[i]!, 1e-5));
  close(result.r2, ref.r2);
  close(result.r2adj, ref.r2adj);
  return result;
}

describe("fitCurve against NumPy and SciPy", () => {
  it("linear least squares", () => {
    const result = check("linear", "linear");
    expect(result.method).toBe("linear");
    expect(result.n).toBe(8);
  });

  it("polynomial of degree 3", () => {
    check("poly3", "poly3");
  });

  it("linear through the origin (uncentered R²)", () => {
    check("linear0", "linear0");
  });

  it("logarithmic", () => {
    check("log", "log");
  });

  it("exponential by Levenberg-Marquardt", () => {
    const result = check("exp", "exp");
    expect(result.method).toBe("levenberg-marquardt");
  });

  it("power law by Levenberg-Marquardt", () => {
    check("power", "power");
  });

  it("weighted by the Y error bars", () => {
    const result = check("linear", "linear_weighted", { weighted: true });
    expect(result.weighted).toBe(true);
  });
});

describe("fitCurve behaviour", () => {
  it("returns residuals and a predictor", () => {
    const x = [1, 2, 3, 4];
    const y = [2, 4, 6, 8];
    const result = fitCurve("linear", x, y);
    expect(result.predict(10)).toBeCloseTo(20, 9);
    result.residuals.forEach((r) => expect(Math.abs(r)).toBeLessThan(1e-9));
    expect(result.r2).toBeCloseTo(1, 12);
  });

  it("skips pairs with a missing value", () => {
    const result = fitCurve("linear", [1, 2, null, 4, 5], [2, 4, 6, null, 10]);
    expect(result.n).toBe(3);
  });

  it("explains why it cannot fit", () => {
    expect(() => fitCurve("linear", [1], [1])).toThrow(FitError);
    expect(() => fitCurve("exp", [1, 2, 3], [1, -2, 3])).toThrow(/y maior/);
    expect(() => fitCurve("power", [0, 1, 2], [1, 2, 3])).toThrow(/x maior/);
    expect(() => fitCurve("linear", [1, 1, 1], [1, 2, 3])).toThrow(FitError);
  });

  it("recovers exact exponential parameters", () => {
    const x = [0, 1, 2, 3, 4];
    const y = x.map((value) => 3 * Math.exp(-0.7 * value));
    const result = fitCurve("exp", x, y);
    close(result.params[0]!, 3, 1e-8);
    close(result.params[1]!, -0.7, 1e-8);
  });
});

describe("equations and statistics", () => {
  it("writes the equation as text and LaTeX", () => {
    const result = fitCurve("linear", [1, 2, 3], [3, 5, 7]);
    expect(equationText(result, { x: "V", y: "I" })).toBe("I = 2·V + 1");
    expect(equationText(result, { x: "V", y: "I" }, ",")).toContain("2·V");
    expect(equationLatex(result, { x: "V", y: "I" })).toBe("I = 2\\,V + 1");
  });

  it("uses a decimal comma in the Brazilian text", () => {
    const result = fitCurve("linear0", [1, 2, 3], [1.5, 3, 4.5]);
    expect(equationText(result)).toBe("y = 1,5·x");
    expect(equationLatex(result)).toBe("y = 1.5\\,x");
  });

  it("computes column statistics", () => {
    const stats = columnStats([2, 4, 4, 4, 5, 5, 7, 9, null]);
    expect(stats?.n).toBe(8);
    expect(stats?.mean).toBe(5);
    close(stats!.sd, Math.sqrt(32 / 7), 1e-12);
    close(stats!.sem, Math.sqrt(32 / 7) / Math.sqrt(8), 1e-12);
    expect(stats?.min).toBe(2);
    expect(stats?.max).toBe(9);
    expect(columnStats([null])).toBeNull();
  });

  it("offers a linearization only for the nonlinear models", () => {
    expect(linearization("exp")?.yFormula).toBe("ln(y)");
    expect(linearization("power")?.xFormula).toBe("ln(x)");
    expect(linearization("linear")).toBeNull();
  });
});
