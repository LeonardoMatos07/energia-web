import type { ModelId } from "./fit";
import { emptyState, type ChartConfig, type Column, type PlotterState } from "./state";

export interface PlotterExample {
  slug: string;
  title: string;
  /** One sentence, for the card, the meta description and the sitemap. */
  summary: string;
  /** Paragraphs of the page: the experiment, what the chart shows and how to read it. */
  body: string[];
  /** Fitted model drawn over the points, when the experiment has one. */
  fit: ModelId | null;
  state: PlotterState;
}

interface ColumnSpec {
  id: string;
  name: string;
  quantity?: string;
  unit?: string;
  symbol?: string;
  formula?: string;
}

/** Brazilian format on purpose: the examples also show the parser reading decimal commas. */
function cell(value: number): string {
  return Number(value.toPrecision(4)).toString().replace(".", ",");
}

function build(
  specs: ColumnSpec[],
  rows: (number | null)[][],
  chart: Partial<ChartConfig> & Pick<ChartConfig, "kind">,
): PlotterState {
  const base = emptyState();
  const columns: Column[] = specs.map((spec) => ({
    id: spec.id,
    name: spec.name,
    kind: "number",
    quantity: spec.quantity ?? "custom",
    dataUnit: spec.unit ?? "",
    displayUnit: spec.unit ?? "",
    ...(spec.symbol ? { symbol: spec.symbol } : {}),
    ...(spec.formula !== undefined ? { formula: spec.formula } : {}),
  }));
  return {
    ...base,
    columns,
    rows: rows.map((row) =>
      specs.map((_, i) => (row[i] === null || row[i] === undefined ? "" : cell(row[i]!))),
    ),
    chart: { ...base.chart, ...chart },
  };
}

/** Deterministic pseudo-noise, so the data (and the tests) never change between builds. */
function lcg(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

function normal(random: () => number): number {
  const u = Math.max(random(), 1e-12);
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * random());
}

const steps = (from: number, to: number, step: number) =>
  Array.from({ length: Math.round((to - from) / step) + 1 }, (_, i) => from + i * step);

const noiseA = lcg(7);
const ohmRows = steps(0.5, 5, 0.5).map((v) => [v, v * 10 + normal(noiseA) * 2, 3]);

const diodeRows = steps(0.45, 0.75, 0.05).map((v) => [v, 2e-4 * Math.exp(v / 0.05)]);

const noiseB = lcg(11);
const rcRows = steps(0, 5, 0.5).map((t) => [t, 5 * Math.exp(-t / 1) * (1 + normal(noiseB) * 0.03)]);

const bodeRows = [10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000, 50000, 100000].map(
  (f) => [f, -10 * Math.log10(1 + (f / 1500) ** 2)],
);

const solarRows = steps(0, 21, 3).map((v) => [v, 5 * (1 - Math.exp((v - 22) / 2.5)), null]);

const noiseC = lcg(23);
const motorRows = steps(0, 1750, 250).map((n) => [n, 2.4 * (1 - n / 1800) + normal(noiseC) * 0.04]);

const noiseD = lcg(5);
const resistorRows = Array.from({ length: 48 }, () => [1000 + normal(noiseD) * 18]);

const polarRows = steps(0, 350, 10).map((angle) => [
  angle,
  0.5 + 0.5 * Math.cos((angle * Math.PI) / 180),
]);

export const EXAMPLES: PlotterExample[] = [
  {
    slug: "lei-de-ohm",
    title: "Lei de Ohm",
    summary:
      "Corrente em função da tensão num resistor, com barras de erro e ajuste linear pela origem.",
    fit: "linear0",
    body: [
      "Aplique tensões crescentes a um resistor e meça a corrente com um amperímetro. Se o resistor é ôhmico, os pontos caem numa reta que passa pela origem.",
      "A inclinação da reta é a condutância (1/R). Neste exemplo ela vale cerca de 10 mA/V, ou seja, um resistor de 100 Ω. As barras verticais mostram a incerteza de ±3 mA do amperímetro.",
      "O ajuste pela origem usa y = a·x: o erro padrão de a diz o quanto a resistência pode variar com o ruído das medidas. Os dados são ilustrativos.",
    ],
    state: build(
      [
        { id: "v", name: "Tensão", quantity: "voltage", unit: "V", symbol: "V" },
        { id: "i", name: "Corrente", quantity: "current", unit: "mA", symbol: "I" },
        { id: "ei", name: "Incerteza da corrente", quantity: "current", unit: "mA" },
      ],
      ohmRows,
      {
        kind: "scatter",
        title: "Lei de Ohm",
        xColumn: "v",
        yColumns: ["i"],
        yErrorColumn: "ei",
        xLabel: "Tensão (V)",
        yLabel: "Corrente (mA)",
      },
    ),
  },
  {
    slug: "curva-do-diodo",
    title: "Curva I×V do diodo",
    summary:
      "Corrente de um diodo de silício em escala logarítmica, mostrando o comportamento exponencial.",
    fit: "exp",
    body: [
      "Num diodo, a corrente cresce exponencialmente com a tensão direta: I = Is·e^(V/nVt). Por isso o gráfico com eixo Y linear parece um joelho, e com eixo Y logarítmico vira praticamente uma reta.",
      "O ajuste exponencial dá a e b em y = a·e^(b·x). O inverso de b é a tensão nVt, em que n é o fator de idealidade e Vt ≈ 25,9 mV a 300 K. Aqui 1/b ≈ 50 mV, ou seja, n ≈ 1,9.",
      "Use a opção Y logarítmico para ver a reta. Dados ilustrativos.",
    ],
    state: build(
      [
        { id: "v", name: "Tensão direta", quantity: "voltage", unit: "V", symbol: "V" },
        { id: "i", name: "Corrente", quantity: "current", unit: "mA", symbol: "I" },
      ],
      diodeRows,
      {
        kind: "scatter",
        title: "Diodo de silício, polarização direta",
        xColumn: "v",
        yColumns: ["i"],
        yLog: true,
        xLabel: "Tensão (V)",
        yLabel: "Corrente (mA)",
      },
    ),
  },
  {
    slug: "descarga-do-capacitor-rc",
    title: "Descarga de um capacitor num circuito RC",
    summary:
      "Tensão no capacitor ao longo do tempo e ajuste exponencial para achar a constante de tempo.",
    fit: "exp",
    body: [
      "Um capacitor carregado com 5 V se descarrega por um resistor: V(t) = V0·e^(−t/τ), com τ = R·C. Meça a tensão a cada 0,5 ms.",
      "No ajuste exponencial, b = −1/τ. Aqui b ≈ −1 ms⁻¹, então τ ≈ 1 ms. Se R = 1 kΩ, a capacitância é de cerca de 1 µF.",
      "Experimente o gráfico de resíduos: se os pontos ficam espalhados em torno de zero, sem curvatura, o modelo exponencial descreve bem o circuito.",
    ],
    state: build(
      [
        { id: "t", name: "Tempo", quantity: "time", unit: "ms", symbol: "t" },
        { id: "v", name: "Tensão no capacitor", quantity: "voltage", unit: "V", symbol: "V" },
      ],
      rcRows,
      {
        kind: "scatter",
        title: "Descarga do capacitor",
        xColumn: "t",
        yColumns: ["v"],
        xLabel: "Tempo (ms)",
        yLabel: "Tensão (V)",
      },
    ),
  },
  {
    slug: "resposta-em-frequencia",
    title: "Resposta em frequência de um filtro passa-baixas",
    summary: "Diagrama de Bode (ganho em dB) de um filtro RC, com eixo de frequência logarítmico.",
    fit: null,
    body: [
      "Num filtro RC passa-baixas, o ganho é |H| = 1/√(1 + (f/fc)²), com fc = 1/(2πRC). Em dB, G = −10·log₁₀(1 + (f/fc)²).",
      "Com o eixo X logarítmico, a curva fica plana (0 dB) bem abaixo de fc, passa por −3 dB em fc e cai a −20 dB por década depois. Aqui fc = 1,5 kHz.",
      "Para achar a frequência de corte nos seus dados, procure o ponto em que o ganho chega a −3 dB.",
    ],
    state: build(
      [
        { id: "f", name: "Frequência", quantity: "frequency", unit: "Hz", symbol: "f" },
        { id: "g", name: "Ganho", quantity: "gain", unit: "dB", symbol: "G" },
      ],
      bodeRows,
      {
        kind: "line",
        title: "Diagrama de Bode: filtro RC passa-baixas",
        xColumn: "f",
        yColumns: ["g"],
        xLog: true,
        xLabel: "Frequência (Hz)",
        yLabel: "Ganho (dB)",
      },
    ),
  },
  {
    slug: "curva-do-painel-solar",
    title: "Potência de um painel fotovoltaico",
    summary:
      "Potência em função da tensão, calculada a partir da curva I×V, para achar o ponto de máxima potência.",
    fit: null,
    body: [
      "Meça a corrente de um painel solar variando a carga. A potência P = V·I é uma coluna calculada: basta dar os símbolos V e I às colunas e escrever a fórmula V * I.",
      "A curva P×V sobe, passa por um máximo e cai a zero na tensão de circuito aberto. O máximo é o ponto de máxima potência (MPP), onde o painel deve operar.",
      "Neste exemplo o painel tem Isc ≈ 5 A e Voc ≈ 22 V. Os dados são ilustrativos.",
    ],
    state: build(
      [
        { id: "v", name: "Tensão", quantity: "voltage", unit: "V", symbol: "V" },
        { id: "i", name: "Corrente", quantity: "current", unit: "A", symbol: "I" },
        { id: "p", name: "Potência", quantity: "active-power", unit: "W", formula: "V * I" },
      ],
      solarRows,
      {
        kind: "line",
        title: "Potência do painel × tensão",
        xColumn: "v",
        yColumns: ["p"],
        xLabel: "Tensão (V)",
        yLabel: "Potência (W)",
      },
    ),
  },
  {
    slug: "torque-e-velocidade-de-um-motor",
    title: "Torque × velocidade de um motor CC",
    summary:
      "Característica de um motor de corrente contínua: o torque cai linearmente com a velocidade.",
    fit: "linear",
    body: [
      "Num motor CC com excitação constante, o torque cai de forma aproximadamente linear com a rotação: T = T0·(1 − n/n0).",
      "O ajuste linear dá o torque de partida (intercepto, cerca de 2,4 N·m) e, pela razão entre intercepto e inclinação, a velocidade em vazio n0 (cerca de 1800 rpm).",
      "As rotações estão em rpm; o plotador converte para Hz ou outra unidade se você trocar a unidade de exibição da coluna. Dados ilustrativos.",
    ],
    state: build(
      [
        { id: "n", name: "Velocidade", quantity: "frequency", unit: "rpm", symbol: "n" },
        { id: "t", name: "Torque", unit: "N·m", symbol: "T" },
      ],
      motorRows,
      {
        kind: "scatter",
        title: "Característica torque × velocidade",
        xColumn: "n",
        yColumns: ["t"],
        xLabel: "Velocidade (rpm)",
        yLabel: "Torque (N·m)",
      },
    ),
  },
  {
    slug: "histograma-de-resistores",
    title: "Histograma de resistores de 1 kΩ",
    summary: "Distribuição de 48 resistores de 1 kΩ medidos com um multímetro, em histograma.",
    fit: null,
    body: [
      "Meça uma amostra de resistores de mesmo valor nominal e faça um histograma. A forma em sino indica variações aleatórias de fabricação em torno do valor nominal.",
      "A tabela de estatística do plotador dá a média, o desvio-padrão amostral e o desvio da média (σ/√n) da coluna. Aqui o desvio-padrão é de cerca de 18 Ω, ou 1,8%, dentro da tolerância de 5%.",
      "Mude o número de faixas (bins) para ver como a forma do histograma depende dele. Dados ilustrativos.",
    ],
    state: build(
      [{ id: "r", name: "Resistência", quantity: "resistance", unit: "Ω", symbol: "R" }],
      resistorRows,
      {
        kind: "histogram",
        title: "Resistores de 1 kΩ",
        xColumn: "r",
        yColumns: ["r"],
        bins: 8,
        xLabel: "Resistência (Ω)",
        yLabel: "Contagem",
      },
    ),
  },
  {
    slug: "diagrama-polar",
    title: "Diagrama polar de uma antena",
    summary:
      "Padrão de radiação cardioide em gráfico polar, com ângulo em graus e intensidade relativa.",
    fit: null,
    body: [
      "O padrão de radiação de uma antena mostra a intensidade relativa em cada direção. No gráfico polar, o ângulo é a direção e a distância ao centro é a intensidade.",
      "Este exemplo é uma cardioide, r = 0,5 + 0,5·cos θ: o máximo fica em 0° e há um nulo em 180°. O mesmo tipo de gráfico serve para fasores e curvas de diretividade.",
      "Coloque o ângulo (graus) na coluna do eixo X e a intensidade na série Y. Dados ilustrativos.",
    ],
    state: build(
      [
        { id: "a", name: "Ângulo", quantity: "angle", unit: "°" },
        { id: "r", name: "Intensidade relativa" },
      ],
      polarRows,
      {
        kind: "polar",
        title: "Padrão cardioide",
        xColumn: "a",
        yColumns: ["r"],
        xLabel: "Ângulo (°)",
        yLabel: "Intensidade",
      },
    ),
  },
];

export function getExample(slug: string): PlotterExample | undefined {
  return EXAMPLES.find((example) => example.slug === slug);
}
