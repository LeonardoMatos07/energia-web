export const SITE_NAME = "Spillway";
export const SITE_TAGLINE = "A energia limpa que transborda da rede";
export const SITE_DESCRIPTION =
  "O setor elétrico brasileiro em dados abertos: carga e geração, reservatórios, preços, notícias e o corte de geração eólica e solar (curtailment).";
export const CURTAILMENT_DESCRIPTION =
  "Quanta energia eólica e solar o Brasil deixa de gerar por restrições do ONS: dados mensais por estado, subsistema e usina, com perdas estimadas em R$.";

export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000";
  return raw.replace(/\/+$/, "");
}

export function absoluteUrl(path = "/"): string {
  return `${getSiteUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}

export function getContactEmail(): string | undefined {
  return process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || undefined;
}
