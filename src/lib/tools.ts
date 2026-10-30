import { FORECAST_MODEL_NAME } from "@/lib/forecast";

export interface Tool {
  href: string;
  title: string;
  /** One short sentence for the card. */
  description: string;
  /** Inline SVG path data (24×24, stroke icon) drawn inside the card. */
  icon: string;
  /** True when the tool needs a free account (the route is in the members area). */
  members?: boolean;
  /** For forecasting tools: which model powers it, shown highlighted (more models may come). */
  model?: string;
}

/** The free tools listed on /ferramentas. To add one, append an entry here and create its route. */
export const TOOLS: readonly Tool[] = [
  {
    href: "/ferramentas/plotador",
    title: "Plotador de gráficos",
    description:
      "Cole os dados do experimento e gere o gráfico com barras de erro, ajuste de curva e exportação em alta resolução.",
    icon: "M3 3v18h18M7 15l4-4 3 3 5-6",
  },
  {
    href: "/comparar",
    title: "Comparar",
    description:
      "Compare estados, subsistemas e usinas lado a lado: geração por fonte (eólica, solar, hidrelétrica, termelétrica), participação na matriz e, para eólica e solar, o curtailment.",
    icon: "M4 6h7M4 12h16M4 18h10M15 4l3 2-3 2M13 16l3 2-3 2",
    members: true,
  },
  {
    href: "/previsao",
    title: "Previsão de curtailment",
    description:
      "Risco de corte de geração eólica e solar, hora a hora, para os próximos 7 dias, por região.",
    icon: "M3 17l5-5 4 4 8-9M15 7h5v5",
    members: true,
    model: FORECAST_MODEL_NAME,
  },
];
