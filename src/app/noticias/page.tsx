import Link from "next/link";
import { NewsAttribution } from "@/components/news/news-attribution";
import { NewsSubnav } from "@/components/news/news-subnav";
import { Card, Container, DataUnavailable, PageHeader } from "@/components/ui";
import { getNews } from "@/lib/api/queries";
import { pageMetadata } from "@/lib/metadata";
import { formatPublished, topicLabel } from "@/lib/news";

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
  const cursor = one(params.cursor);

  const news = await getNews({ cursor });

  return (
    <Container>
      <PageHeader eyebrow="Notícias" title="O que os órgãos do setor estão publicando">
        <p>
          Reunimos automaticamente o que órgãos públicos oficiais publicam. O texto aparece
          exatamente como na fonte, com fonte, data, licença e link para o original.
        </p>
      </PageHeader>
      <NewsSubnav active="noticias" />

      <div className="mt-8 space-y-4">
        {!news.ok ? (
          <DataUnavailable title="Não foi possível carregar as notícias">
            {news.error.detail}
          </DataUnavailable>
        ) : news.data.items.length === 0 ? (
          <p className="text-ink-2">Nenhuma notícia publicada ainda.</p>
        ) : (
          news.data.items.map((item) => (
            <Card key={item.id} as="section" className="p-5">
              <time
                dateTime={item.published_at}
                className="bg-accent-soft text-accent-strong inline-block rounded-full px-3 py-1 text-sm font-semibold"
              >
                {formatPublished(item.published_at)}
              </time>
              <h2 className="mt-3 text-lg leading-snug font-semibold">
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
                    <span className="bg-surface-2 text-ink-2 rounded-full px-3 py-1 text-xs">
                      {topicLabel(slug)}
                    </span>
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
            href={`/noticias?${new URLSearchParams({ cursor: news.data.next_cursor }).toString()}`}
            className="text-accent font-semibold underline"
          >
            Ver mais antigas
          </Link>
        </p>
      ) : null}
    </Container>
  );
}
