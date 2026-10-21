import Link from "next/link";
import { Container, DataUnavailable, PageHeader } from "@/components/ui";
import { getReports } from "@/lib/api/queries";
import { formatDate, formatLongMonth } from "@/lib/format";
import { pageMetadata } from "@/lib/metadata";

export const revalidate = 3600;

export const metadata = pageMetadata({
  title: "Relatórios mensais de curtailment",
  description:
    "Análises mensais sobre os cortes de geração eólica e solar no Brasil, com base nos dados do ONS.",
  path: "/relatorios",
});

export default async function ReportsPage() {
  const result = await getReports();
  const items = result.ok
    ? [...result.data.items].sort((a, b) => b.month.localeCompare(a.month))
    : [];

  return (
    <Container>
      <PageHeader title="Relatórios mensais">
        <p>O que mudou no mês, onde os cortes se concentraram e por quê.</p>
      </PageHeader>

      {!result.ok ? (
        <DataUnavailable />
      ) : items.length === 0 ? (
        <DataUnavailable title="Nenhum relatório publicado ainda">
          Assine a newsletter na página inicial para saber quando o primeiro sair.
        </DataUnavailable>
      ) : (
        <ul className="space-y-4">
          {items.map((r) => (
            <li key={r.slug}>
              <article className="rounded-lg border border-[var(--color-grid)] bg-[var(--color-surface)] p-4">
                <p className="text-sm text-[var(--color-ink-2)]">
                  Referência: {formatLongMonth(r.month)}
                  {r.published_at ? ` · publicado em ${formatDate(r.published_at)}` : null}
                </p>
                <h2 className="mt-1 text-lg font-semibold">
                  <Link
                    href={`/relatorios/${r.slug}`}
                    className="text-[var(--color-accent)] underline"
                  >
                    {r.title}
                  </Link>
                </h2>
                {r.summary ? <p className="mt-1 text-[var(--color-ink-2)]">{r.summary}</p> : null}
              </article>
            </li>
          ))}
        </ul>
      )}
    </Container>
  );
}
