export interface Unit {
  symbol: string;
  name: string;
  /** base = value * factor + offset */
  factor: number;
  offset?: number;
}

export interface Quantity {
  id: string;
  name: string;
  base: string;
  units: Unit[];
}

const PREFIX: Record<string, { name: string; factor: number }> = {
  p: { name: "pico", factor: 1e-12 },
  n: { name: "nano", factor: 1e-9 },
  µ: { name: "micro", factor: 1e-6 },
  m: { name: "mili", factor: 1e-3 },
  "": { name: "", factor: 1 },
  k: { name: "quilo", factor: 1e3 },
  M: { name: "mega", factor: 1e6 },
  G: { name: "giga", factor: 1e9 },
};

function prefixed(base: string, baseName: string, prefixes: string[]): Unit[] {
  return prefixes.map((prefix) => {
    const entry = PREFIX[prefix];
    if (!entry) throw new Error(`Unknown prefix ${prefix}`);
    return {
      symbol: `${prefix}${base}`,
      name: prefix ? `${entry.name}${baseName}` : baseName,
      factor: entry.factor,
    };
  });
}

export const QUANTITIES: Quantity[] = [
  {
    id: "voltage",
    name: "Tensão",
    base: "V",
    units: prefixed("V", "volt", ["µ", "m", "", "k", "M"]),
  },
  {
    id: "current",
    name: "Corrente",
    base: "A",
    units: prefixed("A", "ampère", ["n", "µ", "m", "", "k"]),
  },
  {
    id: "resistance",
    name: "Resistência / impedância",
    base: "Ω",
    units: prefixed("Ω", "ohm", ["m", "", "k", "M"]),
  },
  {
    id: "active-power",
    name: "Potência ativa",
    base: "W",
    units: prefixed("W", "watt", ["m", "", "k", "M", "G"]),
  },
  {
    id: "reactive-power",
    name: "Potência reativa",
    base: "var",
    units: prefixed("var", "var", ["", "k", "M"]),
  },
  {
    id: "apparent-power",
    name: "Potência aparente",
    base: "VA",
    units: prefixed("VA", "volt-ampère", ["", "k", "M"]),
  },
  {
    id: "energy",
    name: "Energia",
    base: "J",
    units: [
      { symbol: "J", name: "joule", factor: 1 },
      { symbol: "Wh", name: "watt-hora", factor: 3600 },
      { symbol: "kWh", name: "quilowatt-hora", factor: 3.6e6 },
      { symbol: "MWh", name: "megawatt-hora", factor: 3.6e9 },
      { symbol: "GWh", name: "gigawatt-hora", factor: 3.6e12 },
    ],
  },
  {
    id: "capacitance",
    name: "Capacitância",
    base: "F",
    units: prefixed("F", "farad", ["p", "n", "µ", "m", ""]),
  },
  {
    id: "inductance",
    name: "Indutância",
    base: "H",
    units: prefixed("H", "henry", ["µ", "m", ""]),
  },
  {
    id: "charge",
    name: "Carga elétrica",
    base: "C",
    units: [
      ...prefixed("C", "coulomb", ["n", "µ", "m", ""]),
      { symbol: "Ah", name: "ampère-hora", factor: 3600 },
      { symbol: "mAh", name: "miliampère-hora", factor: 3.6 },
    ],
  },
  {
    id: "frequency",
    name: "Frequência",
    base: "Hz",
    units: [
      ...prefixed("Hz", "hertz", ["", "k", "M", "G"]),
      { symbol: "rpm", name: "rotações por minuto", factor: 1 / 60 },
    ],
  },
  {
    id: "time",
    name: "Tempo",
    base: "s",
    units: [
      ...prefixed("s", "segundo", ["n", "µ", "m", ""]),
      { symbol: "min", name: "minuto", factor: 60 },
      { symbol: "h", name: "hora", factor: 3600 },
    ],
  },
  {
    id: "angle",
    name: "Ângulo",
    base: "°",
    units: [
      { symbol: "°", name: "grau", factor: 1 },
      { symbol: "rad", name: "radiano", factor: 180 / Math.PI },
    ],
  },
  {
    id: "temperature",
    name: "Temperatura",
    base: "°C",
    units: [
      { symbol: "°C", name: "grau Celsius", factor: 1 },
      { symbol: "K", name: "kelvin", factor: 1, offset: -273.15 },
      { symbol: "°F", name: "grau Fahrenheit", factor: 5 / 9, offset: -160 / 9 },
    ],
  },
  {
    id: "length",
    name: "Comprimento",
    base: "m",
    units: [
      { symbol: "µm", name: "micrômetro", factor: 1e-6 },
      { symbol: "mm", name: "milímetro", factor: 1e-3 },
      { symbol: "cm", name: "centímetro", factor: 1e-2 },
      { symbol: "m", name: "metro", factor: 1 },
      { symbol: "km", name: "quilômetro", factor: 1e3 },
    ],
  },
  {
    id: "mass",
    name: "Massa",
    base: "kg",
    units: [
      { symbol: "mg", name: "miligrama", factor: 1e-6 },
      { symbol: "g", name: "grama", factor: 1e-3 },
      { symbol: "kg", name: "quilograma", factor: 1 },
      { symbol: "t", name: "tonelada", factor: 1e3 },
    ],
  },
  {
    id: "force",
    name: "Força",
    base: "N",
    units: prefixed("N", "newton", ["", "k"]),
  },
  {
    id: "pressure",
    name: "Pressão",
    base: "Pa",
    units: [
      ...prefixed("Pa", "pascal", ["", "k", "M"]),
      { symbol: "bar", name: "bar", factor: 1e5 },
      { symbol: "atm", name: "atmosfera", factor: 101325 },
    ],
  },
  {
    id: "illuminance",
    name: "Iluminância",
    base: "lx",
    units: [{ symbol: "lx", name: "lux", factor: 1 }],
  },
  {
    id: "gain",
    name: "Ganho / atenuação",
    base: "dB",
    units: [{ symbol: "dB", name: "decibel", factor: 1 }],
  },
  {
    id: "dimensionless",
    name: "Adimensional",
    base: "—",
    units: [
      { symbol: "—", name: "sem unidade", factor: 1 },
      { symbol: "%", name: "por cento", factor: 0.01 },
    ],
  },
  { id: "custom", name: "Personalizada", base: "", units: [] },
];

export function getQuantity(id: string | undefined): Quantity {
  return QUANTITIES.find((quantity) => quantity.id === id) ?? QUANTITIES[QUANTITIES.length - 1]!;
}

export function defaultUnit(quantityId: string | undefined): string {
  return getQuantity(quantityId).base;
}

function findUnit(quantity: Quantity, symbol: string): Unit | undefined {
  return quantity.units.find((unit) => unit.symbol === symbol);
}

/** Converts inside one quantity. Unknown units (or the custom quantity) leave the value as is. */
export function convert(value: number, quantityId: string, from: string, to: string): number {
  if (from === to) return value;
  const quantity = getQuantity(quantityId);
  const source = findUnit(quantity, from);
  const target = findUnit(quantity, to);
  if (!source || !target) return value;
  const base = value * source.factor + (source.offset ?? 0);
  return (base - (target.offset ?? 0)) / target.factor;
}

/** Converts a spread (an error bar, a standard error): only the scale applies, not the offset. */
export function convertDelta(delta: number, quantityId: string, from: string, to: string): number {
  if (from === to) return delta;
  const quantity = getQuantity(quantityId);
  const source = findUnit(quantity, from);
  const target = findUnit(quantity, to);
  if (!source || !target) return delta;
  return (delta * source.factor) / target.factor;
}

export function axisLabel(name: string, unit: string): string {
  return unit && unit !== "—" ? `${name} (${unit})` : name;
}

/**
 * Suggests a more readable unit when every value is tiny or huge (all below 0.01 or at least
 * 10 000 in the display unit). Only suggests; never converts by itself.
 */
export function suggestUnit(
  values: readonly number[],
  quantityId: string,
  unit: string,
): string | null {
  const quantity = getQuantity(quantityId);
  const current = findUnit(quantity, unit);
  if (!current || current.offset || values.length === 0) return null;
  const peak = Math.max(...values.map((value) => Math.abs(value)));
  if (!Number.isFinite(peak) || peak === 0) return null;
  if (peak >= 0.01 && peak < 10_000) return null;
  const peakInBase = peak * current.factor;
  const candidates = quantity.units
    .filter((candidate) => !candidate.offset && peakInBase / candidate.factor >= 1)
    .sort((a, b) => b.factor - a.factor);
  const best = candidates[0];
  return best && best.symbol !== unit ? best.symbol : null;
}
