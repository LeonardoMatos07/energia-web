export interface NavChild {
  href: string;
  label: string;
  description: string;
}

export interface NavItem {
  href: string;
  label: string;
  matches: readonly string[];
  /** Pages of an area, shown in a dropdown (desktop) or an expandable group (mobile). */
  children?: readonly NavChild[];
}

/**
 * The main menu: the country at a glance (Painel), the two physical systems (Sistema, Água),
 * the market, curtailment (an area of its own, with Análises), the news and the tools the user
 * operates (Plotador, Comparar, Previsão). The method lives in the footer.
 */
export const NAV: readonly NavItem[] = [
  { href: "/painel", label: "Painel", matches: ["/painel"] },
  { href: "/sistema", label: "Sistema", matches: ["/sistema"] },
  { href: "/agua", label: "Água", matches: ["/agua"] },
  {
    href: "/mercado/pld",
    label: "Mercado",
    matches: ["/mercado", "/qualidade", "/tarifas"],
    children: [
      { href: "/mercado/pld", label: "PLD", description: "Preço da energia no curto prazo." },
      { href: "/mercado/livre", label: "Mercado livre", description: "Consumo e migração." },
      { href: "/tarifas", label: "Tarifas", description: "Bandeiras tarifárias." },
      { href: "/qualidade", label: "Qualidade", description: "DEC e FEC das distribuidoras." },
    ],
  },
  {
    href: "/curtailment",
    label: "Curtailment",
    matches: ["/curtailment", "/estados", "/usinas", "/relatorios", "/analises"],
    children: [
      { href: "/curtailment", label: "Visão geral", description: "Painel nacional do corte." },
      { href: "/estados", label: "Estados", description: "Corte por estado." },
      { href: "/usinas", label: "Usinas", description: "Usina por usina." },
      { href: "/analises", label: "Análises", description: "Compensação, empresas e horários." },
      { href: "/relatorios", label: "Relatórios", description: "Um por mês, desde 2021." },
    ],
  },
  { href: "/noticias", label: "Notícias", matches: ["/noticias"] },
  {
    href: "/ferramentas",
    label: "Ferramentas",
    matches: ["/ferramentas", "/previsao", "/comparar"],
    children: [
      {
        href: "/ferramentas/plotador",
        label: "Plotador de gráficos",
        description: "Gráficos com ajuste de curva.",
      },
      {
        href: "/comparar",
        label: "Comparar",
        description: "Estados, usinas e subsistemas, por fonte.",
      },
      { href: "/previsao", label: "Previsão", description: "Risco de corte nos próximos 7 dias." },
    ],
  },
];

export const EXPLORE_TABS = [
  { key: "estados", href: "/estados", label: "Estados" },
  { key: "usinas", href: "/usinas", label: "Usinas" },
] as const;

export type ExploreTab = (typeof EXPLORE_TABS)[number]["key"];

export const FOOTER_COLUMNS = [
  {
    title: "Áreas",
    links: [
      { href: "/painel", label: "Painel" },
      { href: "/sistema", label: "Sistema" },
      { href: "/agua", label: "Água" },
      { href: "/mercado/pld", label: "Mercado" },
      { href: "/curtailment", label: "Curtailment" },
      { href: "/noticias", label: "Notícias" },
    ],
  },
  {
    title: "Ferramentas",
    links: [
      { href: "/ferramentas/plotador", label: "Plotador de gráficos" },
      { href: "/comparar", label: "Comparar" },
      { href: "/previsao", label: "Previsão" },
      { href: "/ferramentas", label: "Todas as ferramentas" },
    ],
  },
  {
    title: "Spillway",
    links: [
      { href: "/relatorios", label: "Relatórios mensais" },
      { href: "/analises", label: "Análises de curtailment" },
      { href: "/metodologia", label: "Metodologia" },
      { href: "/noticias/rss.xml", label: "RSS" },
      { href: "/noticias/assinar", label: "Newsletter" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacidade", label: "Privacidade" },
      { href: "/newsletter/descadastrar", label: "Cancelar newsletter" },
    ],
  },
] as const;

export function isUnder(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function isNavActive(pathname: string, matches: readonly string[]): boolean {
  return matches.some((prefix) => isUnder(pathname, prefix));
}
