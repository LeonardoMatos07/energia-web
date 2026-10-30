/**
 * The main menu is organised by the question a person comes with, not by the kind of page:
 * how is the country (Painel), where (Explorar: states, plants, comparison), how much and who
 * (Análises), and the monthly write-ups (Relatórios). The method lives in the footer.
 */
export const NAV = [
  { href: "/painel", label: "Painel", matches: ["/painel"] },
  { href: "/estados", label: "Explorar", matches: ["/estados", "/usinas", "/comparar"] },
  { href: "/analises", label: "Análises", matches: ["/analises"] },
  { href: "/previsao", label: "Previsão", matches: ["/previsao"] },
  { href: "/relatorios", label: "Relatórios", matches: ["/relatorios"] },
  { href: "/noticias", label: "Notícias", matches: ["/noticias"] },
] as const;

export const EXPLORE_TABS = [
  { key: "estados", href: "/estados", label: "Estados" },
  { key: "usinas", href: "/usinas", label: "Usinas" },
  { key: "comparar", href: "/comparar", label: "Comparar" },
] as const;

export type ExploreTab = (typeof EXPLORE_TABS)[number]["key"];

export const FOOTER_LINKS = [
  { href: "/painel", label: "Painel" },
  { href: "/estados", label: "Explorar" },
  { href: "/analises", label: "Análises" },
  { href: "/previsao", label: "Previsão" },
  { href: "/relatorios", label: "Relatórios" },
  { href: "/noticias", label: "Notícias" },
  { href: "/metodologia", label: "Metodologia" },
  { href: "/privacidade", label: "Privacidade" },
  { href: "/newsletter/descadastrar", label: "Cancelar newsletter" },
] as const;

export function isUnder(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function isNavActive(pathname: string, matches: readonly string[]): boolean {
  return matches.some((prefix) => isUnder(pathname, prefix));
}
