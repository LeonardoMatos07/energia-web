import {
  absDependencies,
  addDependencies,
  acosDependencies,
  asinDependencies,
  atanDependencies,
  cosDependencies,
  create,
  divideDependencies,
  eDependencies,
  expDependencies,
  log10Dependencies,
  logDependencies,
  modDependencies,
  multiplyDependencies,
  parseDependencies,
  piDependencies,
  powDependencies,
  sinDependencies,
  sqrtDependencies,
  subtractDependencies,
  tanDependencies,
  unaryMinusDependencies,
  unaryPlusDependencies,
  type MathNode,
} from "mathjs";

// A closed set: only these functions and operators exist, so a formula cannot reach anything else.
const math = create({
  parseDependencies,
  addDependencies,
  subtractDependencies,
  multiplyDependencies,
  divideDependencies,
  powDependencies,
  modDependencies,
  unaryMinusDependencies,
  unaryPlusDependencies,
  absDependencies,
  sqrtDependencies,
  expDependencies,
  logDependencies,
  log10Dependencies,
  sinDependencies,
  cosDependencies,
  tanDependencies,
  asinDependencies,
  acosDependencies,
  atanDependencies,
  piDependencies,
  eDependencies,
} as never);

const FUNCTIONS: Record<string, (...args: number[]) => number> = {
  sqrt: Math.sqrt,
  abs: Math.abs,
  exp: Math.exp,
  ln: Math.log,
  log: Math.log10,
  log10: Math.log10,
  sin: Math.sin,
  cos: Math.cos,
  tan: Math.tan,
  asin: Math.asin,
  acos: Math.acos,
  atan: Math.atan,
};

const CONSTANTS: Record<string, number> = { pi: Math.PI, e: Math.E };
const ALLOWED_NODES = new Set([
  "ConstantNode",
  "SymbolNode",
  "OperatorNode",
  "FunctionNode",
  "ParenthesisNode",
]);

export class FormulaError extends Error {}

export interface CompiledFormula {
  evaluate: (variables: Record<string, number>) => number | null;
  symbols: string[];
}

export function compileFormula(expression: string): CompiledFormula {
  let root: MathNode;
  try {
    root = math.parse(expression);
  } catch {
    throw new FormulaError("Fórmula inválida.");
  }
  const symbols = new Set<string>();
  root.traverse((node: MathNode, _path: string | null, parent: MathNode | null) => {
    if (!ALLOWED_NODES.has(node.type)) throw new FormulaError("Fórmula não permitida.");
    if (node.type === "FunctionNode") {
      const name = (node as unknown as { fn: { name?: string } }).fn.name ?? "";
      if (!Object.hasOwn(FUNCTIONS, name)) throw new FormulaError(`Função desconhecida: ${name}.`);
    }
    if (node.type === "SymbolNode") {
      const name = (node as unknown as { name: string }).name;
      const isCallee =
        parent?.type === "FunctionNode" && (parent as unknown as { fn: MathNode }).fn === node;
      if (name in Object.prototype) throw new FormulaError("Nome reservado.");
      if (!isCallee && !Object.hasOwn(CONSTANTS, name)) symbols.add(name);
    }
  });
  const code = root.compile();
  return {
    symbols: [...symbols],
    evaluate(variables) {
      try {
        const result: unknown = code.evaluate({ ...FUNCTIONS, ...CONSTANTS, ...variables });
        return typeof result === "number" && Number.isFinite(result) ? result : null;
      } catch {
        return null;
      }
    },
  };
}
