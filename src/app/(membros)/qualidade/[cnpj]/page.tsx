import Link from "next/link";
import { notFound } from "next/navigation";
import { MonthlyChart } from "@/components/charts/monthly-chart";
import { DataAttribution } from "@/components/data-attribution";
import { Container, DataUnavailable, PageHeader, Section } from "@/components/ui";
import { ApiError } from "@/lib/api/client";
import { getReliabilityDetail } from "@/lib/api/queries";
import { formatNumber } from "@/lib/format";
import { LIMIT_LABEL, limitStatus, toMonth } from "@/lib/market";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Qualidade do fornecimento por distribuidora",
  description: "DEC e FEC mês a mês de uma distribuidora, com o limite anual da ANEEL.",
  path: "/qualidade",
  noIndex: true,
});

type Params = { cnpj: string };
type SearchParams = Record<string, string | string[] | undefined>;

export default async function DistributorQualityPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<SearchParams>;
}) {
  const { cnpj } = await params;
  const rawYear = (await searchParams).ano;
  const year = Number(Array.isArray(rawYear) ? rawYear[0] : rawYear);
  const result = await getReliabilityDetail(cnpj, Number.isInteger(year) ? year : undefined);
  if (!result.ok && result.error instanceof ApiError && result.error.status === 404) notFound();
  if (!result.ok) {
    return (
      <Container>
        <DataUnavailable />
      </Container>
    );
  }
  const { distributor, points } = result.data;
  const status = limitStatus(distributor, "dec");
  const rows = points.map((point) => ({
    month: toMonth(point.month),
    dec: point.dec_hours,
    fec: point.fec_count,
  }));
  return (
    <Container>
      <PageHeader
        eyebrow="Qualidade"
        title={`${distributor.acronym}: DEC e FEC em ${result.data.year}`}
      >
        <p>
          Acumulado do ano até agora: DEC de {formatNumber(distributor.dec_hours, 2, 2)} horas e FEC
          de {formatNumber(distributor.fec_count, 2, 2)} interrupções, para{" "}
          {formatNumber(distributor.consumers, 0)} consumidores em {distributor.sets} conjuntos
          elétricos. Limite anual: {LIMIT_LABEL[status].toLowerCase()}.
        </p>
      </PageHeader>
      <Section id="mensal" title="Mês a mês">
        <div className="grid gap-6 lg:grid-cols-2">
          <MonthlyChart
            title="DEC (horas por consumidor)"
            rows={rows}
            series={[{ key: "dec", label: "DEC", color: "var(--color-series-3)" }]}
            unit="h"
            kind="bar"
            digits={2}
            periodFilter={false}
          />
          <MonthlyChart
            title="FEC (interrupções por consumidor)"
            rows={rows}
            series={[{ key: "fec", label: "FEC", color: "var(--color-series-2)" }]}
            unit="vezes"
            kind="bar"
            digits={2}
            periodFilter={false}
          />
        </div>
        <DataAttribution source={result.data.source} />
        <p className="mt-4 text-sm">
          <Link
            className="underline underline-offset-2"
            href={`/qualidade?ano=${result.data.year}`}
          >
            Voltar ao ranking
          </Link>
        </p>
      </Section>
    </Container>
  );
}
