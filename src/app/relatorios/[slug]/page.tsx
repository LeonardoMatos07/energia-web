import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/json-ld";
import { Markdown } from "@/components/markdown";
import { Container, DataUnavailable, PageHeader } from "@/components/ui";
import { getRelatorio } from "@/lib/api/queries";
import { formatData, formatMesLongo } from "@/lib/format";
import { pageMetadata } from "@/lib/metadata";
import { absoluteUrl } from "@/lib/site";
import { publisher } from "@/lib/structured-data";

export const revalidate = 3600;

export function generateStaticParams() {
  return [];
}

type Params = { slug: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const result = await getRelatorio(slug);
  if (!result.ok) return { title: "Relatório", robots: { index: false } };
  const r = result.data;
  return pageMetadata({
    title: r.titulo,
    description: r.resumo ?? `Relatório de curtailment eólico e solar de ${formatMesLongo(r.mes)}.`,
    path: `/relatorios/${r.slug}`,
    type: "article",
    publishedTime: r.publicado_em ?? undefined,
  });
}

export default async function RelatorioPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const result = await getRelatorio(slug);

  if (!result.ok) {
    if (result.error.isNotFound) notFound();
    return (
      <Container>
        <PageHeader title="Relatório" />
        <DataUnavailable />
      </Container>
    );
  }

  const r = result.data;
  return (
    <Container>
      <JsonLd
        data={{
          "@type": "Article",
          headline: r.titulo,
          description: r.resumo ?? undefined,
          datePublished: r.publicado_em ?? undefined,
          inLanguage: "pt-BR",
          mainEntityOfPage: absoluteUrl(`/relatorios/${r.slug}`),
          author: publisher(),
          publisher: publisher(),
          about: `Curtailment de usinas eólicas e solares no Brasil — ${formatMesLongo(r.mes)}`,
        }}
      />
      <article className="mx-auto max-w-3xl">
        <PageHeader
          eyebrow={
            <>
              <Link href="/relatorios" className="underline">
                Relatórios
              </Link>{" "}
              · {formatMesLongo(r.mes)}
            </>
          }
          title={r.titulo}
        >
          {r.resumo ? <p>{r.resumo}</p> : null}
          {r.publicado_em ? (
            <p className="mt-2 text-sm">
              Publicado em <time dateTime={r.publicado_em}>{formatData(r.publicado_em)}</time>
            </p>
          ) : null}
        </PageHeader>
        <Markdown>{r.conteudo}</Markdown>
      </article>
    </Container>
  );
}
