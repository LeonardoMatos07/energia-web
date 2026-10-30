export interface Tool {
  href: string;
  title: string;
  /** One short sentence for the card. */
  description: string;
  /** Inline SVG path data (24×24, stroke icon) drawn inside the card. */
  icon: string;
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
    href: "/analises",
    title: "Análises",
    description:
      "Compensação, empresas, horários e previsão do curtailment, com download em PDF, Excel e CSV.",
    icon: "M4 20V10M10 20V4M16 20v-7M22 20H2",
  },
  {
    href: "/previsao",
    title: "Previsão de curtailment",
    description:
      "Risco de corte de geração eólica e solar, hora a hora, para os próximos 7 dias, por região.",
    icon: "M3 17l5-5 4 4 8-9M15 7h5v5",
    model: "Gradient boosting (HistGradientBoosting)",
  },
];
