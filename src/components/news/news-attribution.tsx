import type { NewsItem, RegulatoryAct } from "@/lib/api/types";
import { douReference, formatPublished, licenseLabel, wasUpdated } from "@/lib/news";

const LINK = "underline underline-offset-2 hover:text-accent";

/**
 * The attribution block used everywhere a news item appears (list, detail, RSS, newsletter):
 * publisher, publication date, link to the original and license. Never optional.
 */
export function NewsAttribution({ item }: { item: NewsItem }) {
  return (
    <p className="text-muted text-xs leading-5" data-testid="news-attribution">
      <strong className="text-ink-2 font-semibold">Fonte:</strong> {item.publisher_name} · publicado
      em {formatPublished(item.published_at)}
      {wasUpdated(item) && item.source_updated_at
        ? ` · atualizado em ${formatPublished(item.source_updated_at)}`
        : ""}{" "}
      ·{" "}
      <a href={item.url} target="_blank" rel="noopener noreferrer" className={LINK}>
        ver original
      </a>{" "}
      · Conteúdo reproduzido sem alterações sob a licença{" "}
      <a href={item.license_url} target="_blank" rel="noopener noreferrer" className={LINK}>
        {licenseLabel(item.license_code)}
      </a>
    </p>
  );
}

export function ActAttribution({ act }: { act: RegulatoryAct }) {
  return (
    <p className="text-muted text-xs leading-5" data-testid="act-attribution">
      <strong className="text-ink-2 font-semibold">{douReference(act)}</strong> ·{" "}
      <a href={act.dou_url} target="_blank" rel="noopener noreferrer" className={LINK}>
        ver no DOU
      </a>{" "}
      · Ato oficial (Lei 9.610/1998, art. 8º, IV)
    </p>
  );
}
