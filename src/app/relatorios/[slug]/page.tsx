import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/json-ld";
import { Markdown } from "@/components/markdown";
import { Container, DataUnavailable, PageHeader } from "@/components/ui";
import { getReport } from "@/lib/api/queries";
import { formatDate, formatLongMonth } from "@/lib/format";
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
  const result = await getReport(slug);
  if (!result.ok) return { title: "Relatório", robots: { index: false } };
  const r = result.data;
  return pageMetadata({
    title: r.title,
    description:
      r.summary ?? `Relatório de curtailment eólico e solar de ${formatLongMonth(r.month)}.`,
    path: `/relatorios/${r.slug}`,
    type: "article",
    publishedTime: r.published_at ?? undefined,
  });
}

export default async function ReportPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const result = await getReport(slug);

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
          headline: r.title,
          description: r.summary ?? undefined,
          datePublished: r.published_at ?? undefined,
          inLanguage: "pt-BR",
          mainEntityOfPage: absoluteUrl(`/relatorios/${r.slug}`),
          author: publisher(),
          publisher: publisher(),
          about: `Curtailment de usinas eólicas e solares no Brasil — ${formatLongMonth(r.month)}`,
        }}
      />
      <article className="mx-auto max-w-3xl">
        <PageHeader
          eyebrow={
            <>
              <Link href="/relatorios" className="underline">
                Relatórios
              </Link>{" "}
              · {formatLongMonth(r.month)}
            </>
          }
          title={r.title}
        >
          {r.summary ? <p>{r.summary}</p> : null}
          {r.published_at ? (
            <p className="mt-2 text-sm">
              Publicado em <time dateTime={r.published_at}>{formatDate(r.published_at)}</time>
            </p>
          ) : null}
        </PageHeader>
        <Markdown>{r.content}</Markdown>
      </article>
    </Container>
  );
}
