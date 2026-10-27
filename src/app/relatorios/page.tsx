import Link from "next/link";
import { Tabs } from "@/components/tabs";
import { Container, DataUnavailable, PageHeader } from "@/components/ui";
import type { ReportSummary } from "@/lib/api/types";
import { getReports } from "@/lib/api/queries";
import { formatDate, formatLongMonth } from "@/lib/format";
import { pageMetadata } from "@/lib/metadata";

export const revalidate = 3600;

export const metadata = pageMetadata({
  title: "Relatórios mensais de curtailment",
  description:
    "Análises mensais sobre os cortes de geração eólica e solar no Brasil, com base nos dados do ONS. Escolha o ano e leia o relatório do mês.",
  path: "/relatorios",
});

function yearOf(report: ReportSummary) {
  return Number(report.month.slice(0, 4));
}

function ReportList({ reports }: { reports: ReportSummary[] }) {
  return (
    <ul className="space-y-4">
      {reports.map((report) => (
        <li key={report.slug}>
          <article className="border-grid bg-surface rounded-lg border p-4">
            <p className="text-ink-2 text-sm">
              Referência: {formatLongMonth(report.month)}
              {report.published_at ? ` · publicado em ${formatDate(report.published_at)}` : null}
            </p>
            <h2 className="mt-1 text-lg font-semibold">
              <Link href={`/relatorios/${report.slug}`} className="text-accent underline">
                {report.title}
              </Link>
            </h2>
            {report.summary ? <p className="text-ink-2 mt-1">{report.summary}</p> : null}
          </article>
        </li>
      ))}
    </ul>
  );
}

export default async function ReportsPage() {
  const result = await getReports();
  const items = result.ok
    ? [...result.data.items].sort((a, b) => b.month.localeCompare(a.month))
    : [];
  const years = [...new Set(items.map(yearOf))].sort((a, b) => b - a);

  return (
    <Container>
      <PageHeader title="Relatórios mensais">
        <p>
          O que mudou no mês, onde os cortes se concentraram e por quê. Escolha o ano para ver os
          relatórios.
        </p>
      </PageHeader>

      {!result.ok ? (
        <DataUnavailable />
      ) : items.length === 0 ? (
        <DataUnavailable title="Nenhum relatório publicado ainda">
          Assine a newsletter na página inicial para saber quando o primeiro sair.
        </DataUnavailable>
      ) : (
        <Tabs
          label="Ano"
          panels={years.map((year) => ({
            key: String(year),
            label: String(year),
            content: <ReportList reports={items.filter((report) => yearOf(report) === year)} />,
          }))}
        />
      )}
    </Container>
  );
}
