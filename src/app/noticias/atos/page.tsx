import Link from "next/link";
import { ActAttribution } from "@/components/news/news-attribution";
import { NewsSubnav } from "@/components/news/news-subnav";
import { Card, Container, DataUnavailable, PageHeader } from "@/components/ui";
import { getRegulatoryAct, getRegulatoryActs } from "@/lib/api/queries";
import { pageMetadata } from "@/lib/metadata";
import { topicLabel } from "@/lib/news";

export const metadata = pageMetadata({
  title: "Atos oficiais do setor elétrico",
  description:
    "Resoluções, portarias e outros atos da ANEEL e do MME publicados no Diário Oficial da União, com a referência completa de publicação.",
  path: "/noticias/atos",
});

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function one(value: string | string[] | undefined): string | undefined {
  const text = Array.isArray(value) ? value[0] : value;
  return text?.trim() || undefined;
}

export default async function ActsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const organ = one(params.organ);
  const cursor = one(params.cursor);
  const acts = await getRegulatoryActs({ organ, cursor });

  const withBody = acts.ok
    ? await Promise.all(
        acts.data.items.map(async (act) => ({ act, detail: await getRegulatoryAct(act.id) })),
      )
    : [];

  return (
    <Container>
      <PageHeader eyebrow="Notícias" title="Atos oficiais">
        <p>
          Atos oficiais não têm proteção de direito autoral (Lei 9.610/1998, art. 8º, IV) e são
          exibidos na íntegra, sempre com a referência de publicação no Diário Oficial da União.
        </p>
      </PageHeader>
      <NewsSubnav active="atos" />

      <div className="mt-8 space-y-4">
        {!acts.ok ? (
          <DataUnavailable title="Não foi possível carregar os atos">
            {acts.error.detail}
          </DataUnavailable>
        ) : acts.data.items.length === 0 ? (
          <Card className="p-5">
            <p className="text-ink-2">
              Ainda não há atos oficiais por aqui. A coleta do Diário Oficial depende de um canal
              aberto de dados e ainda não foi ativada.
            </p>
          </Card>
        ) : (
          withBody.map(({ act, detail }) => (
            <Card key={act.id} as="section" className="p-5">
              <h2 className="text-lg leading-snug font-semibold">
                {act.organ} · {act.act_type}
                {act.act_number ? ` nº ${act.act_number}` : ""}
              </h2>
              <p className="mt-1 text-base">{act.title}</p>
              {act.summary ? <p className="text-ink-2 mt-2 leading-7">{act.summary}</p> : null}
              <ul className="mt-3 flex flex-wrap gap-2" aria-label="Temas">
                {act.topics.map((slug) => (
                  <li key={slug} className="bg-surface-2 text-ink-2 rounded-full px-3 py-1 text-xs">
                    {topicLabel(slug)}
                  </li>
                ))}
              </ul>
              <div className="mt-3">
                <ActAttribution act={act} />
              </div>
              {detail.ok && detail.data.body ? (
                <details className="mt-3">
                  <summary className="text-accent cursor-pointer text-sm font-semibold">
                    Ler o texto integral
                  </summary>
                  <div className="mt-2 text-sm leading-7 whitespace-pre-line">
                    {detail.data.body}
                  </div>
                </details>
              ) : null}
            </Card>
          ))
        )}
      </div>

      {acts.ok && acts.data.next_cursor ? (
        <p className="mt-8">
          <Link
            href={`/noticias/atos?${new URLSearchParams({
              ...(organ ? { organ } : {}),
              cursor: acts.data.next_cursor,
            }).toString()}`}
            className="text-accent font-semibold underline"
          >
            Ver mais antigos
          </Link>
        </p>
      ) : null}
    </Container>
  );
}
