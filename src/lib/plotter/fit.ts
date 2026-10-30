export type ModelId =
  "linear" | "linear0" | "poly2" | "poly3" | "poly4" | "poly5" | "exp" | "power" | "log";

export const MODELS: { id: ModelId; name: string }[] = [
  { id: "linear", name: "Linear: y = a·x + b" },
  { id: "linear0", name: "Linear pela origem: y = a·x" },
  { id: "poly2", name: "Polinomial de grau 2" },
  { id: "poly3", name: "Polinomial de grau 3" },
  { id: "poly4", name: "Polinomial de grau 4" },
  { id: "poly5", name: "Polinomial de grau 5" },
  { id: "exp", name: "Exponencial: y = a·e^(b·x)" },
  { id: "power", name: "Potência: y = a·x^b" },
  { id: "log", name: "Logarítmico: y = a + b·ln(x)" },
];

export class FitError extends Error {}

export interface FitOptions {
  /** One standard uncertainty per point: the fit is then weighted by 1/sigma². */
  sigma?: readonly (number | null)[];
}

export interface FitResult {
  model: ModelId;
  /**
   * In the order of the formula: linear [a, b], linear0 [a], exp and power [a, b], log [a, b],
   * polynomials ascending [c0, c1, …].
   */
  params: number[];
  paramNames: string[];
  stderr: number[];
  r2: number;
  r2adj: number;
  n: number;
  method: "linear" | "levenberg-marquardt";
  weighted: boolean;
  residuals: number[];
  /** Points that took part in the fit. */
  x: number[];
  y: number[];
  predict: (x: number) => number;
}

type Matrix = number[][];

function solve(a: Matrix, b: number[]): number[] {
  const n = b.length;
  const m = a.map((row, i) => [...row, b[i]!]);
  for (let col = 0; col < n; col += 1) {
    let pivot = col;
    for (let row = col + 1; row < n; row += 1) {
      if (Math.abs(m[row]![col]!) > Math.abs(m[pivot]![col]!)) pivot = row;
    }
    if (Math.abs(m[pivot]![col]!) < 1e-300) throw new FitError("Os pontos não definem o ajuste.");
    [m[col], m[pivot]] = [m[pivot]!, m[col]!];
    for (let row = col + 1; row < n; row += 1) {
      const factor = m[row]![col]! / m[col]![col]!;
      for (let k = col; k <= n; k += 1) m[row]![k]! -= factor * m[col]![k]!;
    }
  }
  const x = Array<number>(n).fill(0);
  for (let row = n - 1; row >= 0; row -= 1) {
    let sum = m[row]![n]!;
    for (let k = row + 1; k < n; k += 1) sum -= m[row]![k]! * x[k]!;
    x[row] = sum / m[row]![row]!;
  }
  return x;
}

function invert(a: Matrix): Matrix {
  const n = a.length;
  const columns = Array.from({ length: n }, (_, j) =>
    solve(
      a,
      Array.from({ length: n }, (_, i) => (i === j ? 1 : 0)),
    ),
  );
  return Array.from({ length: n }, (_, i) => columns.map((column) => column[i]!));
}

/** Weighted normal equations with column scaling, which keeps polynomials well conditioned. */
function linearLeastSquares(
  design: Matrix,
  y: number[],
  w: number[],
): { beta: number[]; covarianceUnscaled: Matrix } {
  const p = design[0]!.length;
  const scale = Array.from(
    { length: p },
    (_, j) => Math.sqrt(design.reduce((sum, row, i) => sum + w[i]! * row[j]! ** 2, 0)) || 1,
  );
  const scaled = design.map((row) => row.map((value, j) => value / scale[j]!));
  const ata = Array.from({ length: p }, (_, i) =>
    Array.from({ length: p }, (_, j) =>
      scaled.reduce((sum, row, k) => sum + w[k]! * row[i]! * row[j]!, 0),
    ),
  );
  const atb = Array.from({ length: p }, (_, i) =>
    scaled.reduce((sum, row, k) => sum + w[k]! * row[i]! * y[k]!, 0),
  );
  const beta = solve(ata, atb).map((value, j) => value / scale[j]!);
  const inverse = invert(ata);
  const covarianceUnscaled = inverse.map((row, i) =>
    row.map((value, j) => value / (scale[i]! * scale[j]!)),
  );
  return { beta, covarianceUnscaled };
}

interface Curve {
  f: (x: number, theta: number[]) => number;
  jacobian: (x: number, theta: number[]) => number[];
}

const CURVES: Partial<Record<ModelId, Curve>> = {
  exp: {
    f: (x, [a = 0, b = 0]) => a * Math.exp(b * x),
    jacobian: (x, [a = 0, b = 0]) => [Math.exp(b * x), a * x * Math.exp(b * x)],
  },
  power: {
    f: (x, [a = 0, b = 0]) => a * x ** b,
    jacobian: (x, [a = 0, b = 0]) => [x ** b, a * x ** b * Math.log(x)],
  },
};

/** Levenberg-Marquardt on the weighted residuals; returns the parameters and (JᵀWJ)⁻¹. */
function levenbergMarquardt(
  curve: Curve,
  x: number[],
  y: number[],
  w: number[],
  start: number[],
): { theta: number[]; covarianceUnscaled: Matrix } {
  const cost = (theta: number[]) =>
    x.reduce((sum, xi, i) => sum + w[i]! * (y[i]! - curve.f(xi, theta)) ** 2, 0);
  const normal = (theta: number[]) => {
    const p = theta.length;
    const jtj: Matrix = Array.from({ length: p }, () => Array<number>(p).fill(0));
    const jtr = Array<number>(p).fill(0);
    x.forEach((xi, i) => {
      const row = curve.jacobian(xi, theta);
      const residual = y[i]! - curve.f(xi, theta);
      for (let a = 0; a < p; a += 1) {
        jtr[a]! += w[i]! * row[a]! * residual;
        for (let b = 0; b < p; b += 1) jtj[a]![b]! += w[i]! * row[a]! * row[b]!;
      }
    });
    return { jtj, jtr };
  };

  let theta = [...start];
  let current = cost(theta);
  let lambda = 1e-3;
  for (let iteration = 0; iteration < 300; iteration += 1) {
    const { jtj, jtr } = normal(theta);
    let improved = false;
    for (let attempt = 0; attempt < 30; attempt += 1) {
      const damped = jtj.map((row, i) =>
        row.map((value, j) => (i === j ? value * (1 + lambda) : value)),
      );
      let step: number[];
      try {
        step = solve(damped, jtr);
      } catch {
        lambda *= 10;
        continue;
      }
      const candidate = theta.map((value, i) => value + step[i]!);
      const next = cost(candidate);
      if (Number.isFinite(next) && next <= current) {
        const gain = current - next;
        theta = candidate;
        current = next;
        lambda = Math.max(lambda / 10, 1e-12);
        improved = gain > 1e-15 * (1 + current);
        break;
      }
      lambda *= 10;
    }
    if (!improved) break;
  }
  const { jtj } = normal(theta);
  return { theta, covarianceUnscaled: invert(jtj) };
}

function degreeOf(model: ModelId): number {
  return model.startsWith("poly") ? Number(model.slice(4)) : 0;
}

export function minimumPoints(model: ModelId): number {
  if (model === "linear0") return 2;
  if (model.startsWith("poly")) return degreeOf(model) + 2;
  return 3;
}

export function fitCurve(
  model: ModelId,
  xs: readonly (number | null)[],
  ys: readonly (number | null)[],
  options: FitOptions = {},
): FitResult {
  const x: number[] = [];
  const y: number[] = [];
  const w: number[] = [];
  xs.forEach((xi, i) => {
    const yi = ys[i];
    const sigma = options.sigma?.[i];
    if (xi === null || yi === null || yi === undefined) return;
    if (options.sigma && (sigma === null || sigma === undefined || !(sigma > 0))) return;
    x.push(xi);
    y.push(yi);
    w.push(options.sigma ? 1 / (sigma as number) ** 2 : 1);
  });
  const n = x.length;
  if (n < minimumPoints(model)) {
    throw new FitError(`Este ajuste precisa de pelo menos ${minimumPoints(model)} pontos.`);
  }
  if ((model === "exp" || model === "log" || model === "power") && x.length > 0) {
    if ((model === "log" || model === "power") && x.some((value) => value <= 0)) {
      throw new FitError("Este modelo exige x maior que zero.");
    }
    if ((model === "exp" || model === "power") && y.some((value) => value <= 0)) {
      throw new FitError("Este modelo exige y maior que zero.");
    }
  }

  let params: number[];
  let covarianceUnscaled: Matrix;
  let predict: (value: number) => number;
  let paramNames: string[];
  let method: FitResult["method"] = "linear";

  if (model === "exp" || model === "power") {
    const curve = CURVES[model]!;
    const regressor = model === "exp" ? x : x.map(Math.log);
    const start = linearLeastSquares(
      regressor.map((value) => [1, value]),
      y.map(Math.log),
      w,
    ).beta;
    const result = levenbergMarquardt(curve, x, y, w, [Math.exp(start[0]!), start[1]!]);
    params = result.theta;
    covarianceUnscaled = result.covarianceUnscaled;
    predict = (value) => curve.f(value, params);
    paramNames = ["a", "b"];
    method = "levenberg-marquardt";
  } else {
    let design: Matrix;
    if (model === "linear") {
      design = x.map((value) => [value, 1]);
      paramNames = ["a", "b"];
    } else if (model === "linear0") {
      design = x.map((value) => [value]);
      paramNames = ["a"];
    } else if (model === "log") {
      design = x.map((value) => [1, Math.log(value)]);
      paramNames = ["a", "b"];
    } else {
      const degree = degreeOf(model);
      design = x.map((value) => Array.from({ length: degree + 1 }, (_, k) => value ** k));
      paramNames = Array.from({ length: degree + 1 }, (_, k) => `c${k}`);
    }
    const result = linearLeastSquares(design, y, w);
    params = result.beta;
    covarianceUnscaled = result.covarianceUnscaled;
    const beta = params;
    predict = (value) => {
      if (model === "linear") return beta[0]! * value + beta[1]!;
      if (model === "linear0") return beta[0]! * value;
      if (model === "log") return beta[0]! + beta[1]! * Math.log(value);
      return beta.reduce((sum, c, k) => sum + c * value ** k, 0);
    };
  }

  const residuals = y.map((value, i) => value - predict(x[i]!));
  const rss = residuals.reduce((sum, r, i) => sum + w[i]! * r * r, 0);
  const p = params.length;
  const dof = n - p;
  const variance = dof > 0 ? rss / dof : Number.NaN;
  const stderr = covarianceUnscaled.map((row, i) => Math.sqrt(Math.max(0, row[i]! * variance)));

  const totalWeight = w.reduce((sum, value) => sum + value, 0);
  let r2: number;
  let r2adj: number;
  if (model === "linear0") {
    const total = y.reduce((sum, value, i) => sum + w[i]! * value * value, 0);
    r2 = 1 - rss / total;
    r2adj = 1 - ((1 - r2) * n) / dof;
  } else {
    const mean = y.reduce((sum, value, i) => sum + w[i]! * value, 0) / totalWeight;
    const total = y.reduce((sum, value, i) => sum + w[i]! * (value - mean) ** 2, 0);
    r2 = total === 0 ? 1 : 1 - rss / total;
    r2adj = 1 - ((1 - r2) * (n - 1)) / dof;
  }

  return {
    model,
    params,
    paramNames,
    stderr,
    r2,
    r2adj,
    n,
    method,
    weighted: Boolean(options.sigma),
    residuals,
    x,
    y,
    predict,
  };
}

export interface ColumnStats {
  n: number;
  mean: number;
  sd: number;
  min: number;
  max: number;
  /** Uncertainty of the mean, sd / sqrt(n). */
  sem: number;
}

export function columnStats(values: readonly (number | null)[]): ColumnStats | null {
  const data = values.filter((value): value is number => value !== null && Number.isFinite(value));
  const n = data.length;
  if (n === 0) return null;
  const mean = data.reduce((sum, value) => sum + value, 0) / n;
  const sd =
    n > 1 ? Math.sqrt(data.reduce((sum, value) => sum + (value - mean) ** 2, 0) / (n - 1)) : 0;
  return { n, mean, sd, min: Math.min(...data), max: Math.max(...data), sem: sd / Math.sqrt(n) };
}

function number(value: number, decimal: "," | "."): string {
  const text = Number(value.toPrecision(4)).toString();
  const plain = /e/.test(text) ? Number(value.toPrecision(4)).toExponential() : text;
  return decimal === "," ? plain.replace(".", ",") : plain;
}

function term(value: number, decimal: "," | ".", first: boolean): string {
  const sign = value < 0 ? "−" : first ? "" : "+";
  const body = number(Math.abs(value), decimal);
  return first ? `${sign}${body}` : ` ${sign} ${body}`;
}

/** The fitted equation as plain text, for example "y = 2,004·x". */
export function equationText(
  result: FitResult,
  names: { x: string; y: string } = { x: "x", y: "y" },
  decimal: "," | "." = ",",
): string {
  const p = result.params;
  const { x, y } = names;
  switch (result.model) {
    case "linear":
      return `${y} = ${number(p[0]!, decimal)}·${x}${term(p[1]!, decimal, false)}`;
    case "linear0":
      return `${y} = ${number(p[0]!, decimal)}·${x}`;
    case "log":
      return `${y} = ${number(p[0]!, decimal)}${term(p[1]!, decimal, false)}·ln(${x})`;
    case "exp":
      return `${y} = ${number(p[0]!, decimal)}·e^(${number(p[1]!, decimal)}·${x})`;
    case "power":
      return `${y} = ${number(p[0]!, decimal)}·${x}^${number(p[1]!, decimal)}`;
    default: {
      const terms = [...p.keys()]
        .reverse()
        .map((k, index) => {
          const power = k === 0 ? "" : k === 1 ? `·${x}` : `·${x}^${k}`;
          return `${term(p[k]!, decimal, index === 0)}${power}`;
        })
        .join("");
      return `${y} = ${terms}`;
    }
  }
}

export function equationLatex(
  result: FitResult,
  names: { x: string; y: string } = { x: "x", y: "y" },
): string {
  const p = result.params;
  const f = (value: number) => number(value, ".");
  const signed = (value: number) => `${value < 0 ? "-" : "+"} ${f(Math.abs(value))}`;
  const { x, y } = names;
  switch (result.model) {
    case "linear":
      return `${y} = ${f(p[0]!)}\\,${x} ${signed(p[1]!)}`;
    case "linear0":
      return `${y} = ${f(p[0]!)}\\,${x}`;
    case "log":
      return `${y} = ${f(p[0]!)} ${signed(p[1]!)}\\,\\ln ${x}`;
    case "exp":
      return `${y} = ${f(p[0]!)}\\,e^{${f(p[1]!)}\\,${x}}`;
    case "power":
      return `${y} = ${f(p[0]!)}\\,${x}^{${f(p[1]!)}}`;
    default: {
      const terms = [...p.keys()]
        .reverse()
        .map((k, index) => {
          const power = k === 0 ? "" : k === 1 ? `\\,${x}` : `\\,${x}^{${k}}`;
          const value = p[k]!;
          const lead = index === 0 ? (value < 0 ? "-" : "") : value < 0 ? " - " : " + ";
          return `${lead}${f(Math.abs(value))}${power}`;
        })
        .join("");
      return `${y} = ${terms}`;
    }
  }
}

export interface Linearization {
  xFormula: string | null;
  yFormula: string | null;
  explanation: string;
}

/** The change of variables that turns a model into a straight line, in one sentence. */
export function linearization(model: ModelId): Linearization | null {
  switch (model) {
    case "exp":
      return {
        xFormula: null,
        yFormula: "ln(y)",
        explanation:
          "Tomando o logaritmo natural de y = a·e^(b·x) fica ln(y) = ln(a) + b·x, uma reta em x com inclinação b.",
      };
    case "power":
      return {
        xFormula: "ln(x)",
        yFormula: "ln(y)",
        explanation:
          "Tomando o logaritmo dos dois lados de y = a·x^b fica ln(y) = ln(a) + b·ln(x), uma reta com inclinação b.",
      };
    case "log":
      return {
        xFormula: "ln(x)",
        yFormula: null,
        explanation: "Em y = a + b·ln(x), y é uma reta em ln(x) com inclinação b.",
      };
    default:
      return null;
  }
}
