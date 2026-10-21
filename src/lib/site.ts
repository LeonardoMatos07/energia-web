export const SITE_NAME = "Monitor de Curtailment";
export const SITE_DESCRIPTION =
  "Quanta energia eólica e solar o Brasil deixa de gerar por restrições do ONS: dados mensais por estado, subsistema e usina, com perdas estimadas em R$.";

export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000";
  return raw.replace(/\/+$/, "");
}

export function absoluteUrl(path = "/"): string {
  return `${getSiteUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}
