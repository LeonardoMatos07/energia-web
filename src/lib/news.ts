import type { NewsItem, RegulatoryAct, RelatedLink } from "@/lib/api/types";

/** Topic slugs (news_topics.yaml in spillway-data) and the labels shown on screen. */
export const TOPIC_LABELS: Record<string, string> = {
  curtailment: "Curtailment",
  tarifas: "Tarifas",
  leiloes: "Leilões",
  transmissao: "Transmissão",
  distribuicao: "Distribuição",
  "geracao-hidreletrica": "Geração hidrelétrica",
  "eolica-solar": "Eólica e solar",
  "geracao-distribuida": "Geração distribuída",
  "mercado-livre": "Mercado livre",
  regulacao: "Regulação",
  "seguranca-energetica": "Segurança energética",
  outros: "Outros",
};

export const TOPIC_SLUGS = Object.keys(TOPIC_LABELS);

export function topicLabel(slug: string): string {
  return TOPIC_LABELS[slug] ?? slug;
}

const LICENSE_LABELS: Record<string, string> = {
  "CC-BY-ND-3.0": "CC BY-ND 3.0",
  "CC-BY-4.0": "CC BY 4.0",
};

export function licenseLabel(code: string): string {
  return LICENSE_LABELS[code] ?? code;
}

const TIME_ZONE = "America/Sao_Paulo";
const dayFormat = new Intl.DateTimeFormat("pt-BR", {
  timeZone: TIME_ZONE,
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});
const hourFormat = new Intl.DateTimeFormat("pt-BR", {
  timeZone: TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

/**
 * "29/10/2026 às 14:30". Sources that publish only a date are stored as midnight in Brasilia
 * time; for those the time is left out instead of inventing one.
 */
export function formatPublished(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "data indisponível";
  const day = dayFormat.format(date);
  const time = hourFormat.format(date);
  return time === "00:00" ? day : `${day} às ${time}`;
}

export function formatDay(iso: string): string {
  const [year, month, day] = iso.slice(0, 10).split("-");
  return `${day}/${month}/${year}`;
}

/** The source corrected the text after it was collected. */
export function wasUpdated(item: Pick<NewsItem, "published_at" | "source_updated_at">): boolean {
  if (!item.source_updated_at) return false;
  return (
    new Date(item.source_updated_at).getTime() - new Date(item.published_at).getTime() > 60_000
  );
}

export function douReference(act: RegulatoryAct): string {
  const parts = ["Diário Oficial da União"];
  if (act.dou_section) parts.push(`Seção ${act.dou_section}`);
  if (act.dou_edition) parts.push(`edição nº ${act.dou_edition}`);
  if (act.dou_page) parts.push(`p. ${act.dou_page}`);
  parts.push(formatDay(act.dou_date));
  return parts.join(", ");
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** Our feed: title, summary and link as published by the source, with the attribution in each item. */
export function buildRss(items: NewsItem[], siteUrl: string): string {
  const entries = items
    .map((item) => {
      const attribution =
        `Fonte: ${item.publisher_name} · publicado em ${formatPublished(item.published_at)} · ` +
        `original: ${item.url} · Conteúdo reproduzido sem alterações sob a licença ` +
        `${licenseLabel(item.license_code)} (${item.license_url})`;
      return [
        "    <item>",
        `      <title>${escapeXml(item.title)}</title>`,
        `      <link>${escapeXml(item.url)}</link>`,
        `      <guid isPermaLink="true">${escapeXml(item.url)}</guid>`,
        `      <pubDate>${new Date(item.published_at).toUTCString()}</pubDate>`,
        `      <source url="${escapeXml(item.url)}">${escapeXml(item.publisher_name)}</source>`,
        `      <description>${escapeXml(`${item.summary ?? ""}\n\n${attribution}`.trim())}</description>`,
        "    </item>",
      ].join("\n");
    })
    .join("\n");
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0">',
    "  <channel>",
    "    <title>Spillway · Notícias do setor elétrico</title>",
    `    <link>${escapeXml(siteUrl)}/noticias</link>`,
    "    <description>Notícias de fontes públicas oficiais, com fonte, data, licença e link para o original.</description>",
    "    <language>pt-BR</language>",
    entries,
    "  </channel>",
    "</rss>",
    "",
  ].join("\n");
}

/** One link per line: "Rótulo | /caminho". Only paths of this site or https links. */
export function parseRelatedLinks(text: string): RelatedLink[] | null {
  const links: RelatedLink[] = [];
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const [label, href] = trimmed.split("|").map((part) => part.trim());
    if (!label || !href || !/^(\/|https:\/\/)/.test(href)) return null;
    links.push({ label, href });
  }
  return links;
}
