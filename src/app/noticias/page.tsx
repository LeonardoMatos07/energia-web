import Link from "next/link";
import { NewsAttribution } from "@/components/news/news-attribution";
import { NewsSubnav } from "@/components/news/news-subnav";
import { Card, Container, DataUnavailable, PageHeader } from "@/components/ui";
import { getNews, getNewsSources } from "@/lib/api/queries";
import { pageMetadata } from "@/lib/metadata";
import { TOPIC_SLUGS, topicLabel } from "@/lib/news";

export const metadata = pageMetadata({
  title: "Notícias do setor elétrico",
  description:
    "Notícias de fontes públicas oficiais (ANEEL, MME, ANP, EPE), reproduzidas sem alterações e sempre com fonte, data, licença e link para o original.",
  path: "/noticias",
});

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function one(value: string | string[] | undefined): string | undefined {
  const text = Array.isArray(value) ? value[0] : value;
  return text?.trim() || undefined;
}

export default async function NewsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const topic = one(params.topic);
  const source = one(params.source);
  const q = one(params.q);
  const cursor = one(params.cursor);

  const [news, sources] = await Promise.all([
    getNews({ topic, source, q, cursor }),
    getNewsSources(),
  ]);
  const next = new URLSearchParams();
  if (topic) next.set("topic", topic);
  if (source) next.set("source", source);
  if (q) next.set("q", q);

  return (
    <Container>
      <PageHeader eyebrow="Notícias" title="O que os órgãos do setor estão publicando">
        <p>
          Reunimos automaticamente o que órgãos públicos oficiais publicam. O texto aparece
          exatamente como na fonte, com fonte, data, licença e link para o original.
        </p>
      </PageHeader>
      <NewsSubnav active="noticias" />

      <form method="get" className="mt-6 flex flex-wrap items-end gap-3" role="search">
        <label className="text-sm">
          <span className="text-ink-2 block">Tema</span>
          <select
            name="topic"
            defaultValue={topic ?? ""}
            className="border-grid bg-surface mt-1 rounded-md border px-3 py-2"
          >
            <option value="">Todos</option>
            {TOPIC_SLUGS.map((slug) => (
              <option key={slug} value={slug}>
                {topicLabel(slug)}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="text-ink-2 block">Órgão</span>
          <select
            name="source"
            defaultValue={source ?? ""}
            className="border-grid bg-surface mt-1 rounded-md border px-3 py-2"
          >
            <option value="">Todos</option>
            {sources.ok
              ? sources.data.items
                  .filter((s) => s.active)
                  .map((s) => (
                    <option key={s.slug} value={s.slug}>
                      {s.slug.toUpperCase()}
                    </option>
                  ))
              : null}
          </select>
        </label>
        <label className="text-sm">
          <span className="text-ink-2 block">Busca</span>
          <input
            type="search"
            name="q"
            defaultValue={q ?? ""}
            minLength={2}
            maxLength={80}
            className="border-grid bg-surface mt-1 rounded-md border px-3 py-2"
          />
        </label>
        <button
          type="submit"
          className="bg-accent text-on-accent hover:bg-accent-strong rounded-md px-4 py-2 font-semibold"
        >
          Filtrar
        </button>
        {topic || source || q ? (
          <Link href="/noticias" className="text-sm underline">
            Limpar
          </Link>
        ) : null}
      </form>

      <div className="mt-8 space-y-4">
        {!news.ok ? (
          <DataUnavailable title="Não foi possível carregar as notícias">
            {news.error.detail}
          </DataUnavailable>
        ) : news.data.items.length === 0 ? (
          <p className="text-ink-2">Nenhuma notícia encontrada para esse filtro.</p>
        ) : (
          news.data.items.map((item) => (
            <Card key={item.id} as="section" className="p-5">
              <h2 className="text-lg leading-snug font-semibold">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-accent"
                >
                  {item.title}
                </a>
              </h2>
              {item.summary ? (
                <p className="text-ink-2 mt-2 text-base leading-7">{item.summary}</p>
              ) : null}
              <ul className="mt-3 flex flex-wrap gap-2" aria-label="Temas">
                {item.topics.map((slug) => (
                  <li key={slug}>
                    <Link
                      href={`/noticias?topic=${slug}`}
                      className="bg-surface-2 text-ink-2 rounded-full px-3 py-1 text-xs"
                    >
                      {topicLabel(slug)}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="mt-3">
                <NewsAttribution item={item} />
              </div>
              {item.has_editor_note ? (
                <p className="mt-3 text-sm">
                  <Link href={`/noticias/${item.id}`} className="text-accent underline">
                    Nota do Spillway sobre esta notícia
                  </Link>
                </p>
              ) : null}
            </Card>
          ))
        )}
      </div>

      {news.ok && news.data.next_cursor ? (
        <p className="mt-8">
          <Link
            href={`/noticias?${new URLSearchParams({
              ...Object.fromEntries(next),
              cursor: news.data.next_cursor,
            }).toString()}`}
            className="text-accent font-semibold underline"
          >
            Ver mais antigas
          </Link>
        </p>
      ) : null}
    </Container>
  );
}
