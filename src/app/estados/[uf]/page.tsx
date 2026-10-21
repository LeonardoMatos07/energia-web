import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MonthlyChart } from "@/components/charts/monthly-chart";
import { FONTE_COLORS } from "@/components/charts/palette";
import type { ChartSeries } from "@/components/charts/types";
import { JsonLd } from "@/components/json-ld";
import { RankingTable } from "@/components/ranking-table";
import { ReasonBreakdown, sumMotivos } from "@/components/reason-breakdown";
import { Tabs } from "@/components/tabs";
import { Container, DataUnavailable, Notice, PageHeader, Section, StatGrid, StatTile } from "@/components/ui";
import type { ApiResult } from "@/lib/api/client";
import { getCurtailmentUf } from "@/lib/api/queries";
import type { CurtailmentMensalUf, CurtailmentUfResposta, FonteAgregada } from "@/lib/api/types";
import {
  formatBRLCompact,
  formatEnergy,
  formatFonte,
  formatMesCurto,
  formatMesLongo,
  formatNumber,
  formatPercent,
} from "@/lib/format";
import { findEstado } from "@/lib/geo";
import { pageMetadata } from "@/lib/metadata";
import { latest, normalizeMes, pickEnergyUnit, pivotByMonth } from "@/lib/series";
import { datasetJsonLd, temporalCoverage } from "@/lib/structured-data";

export const revalidate = 3600;

// No paths are prebuilt (the build must not depend on the API); each state is rendered
// on first request and then cached (ISR).
export function generateStaticParams() {
  return [];
}

type Params = { uf: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { uf } = await params;
  const estado = findEstado(uf);
  if (!estado) return { title: "Estado não encontrado" };
  return pageMetadata({
    title: `Curtailment eólico e solar em ${estado.nome} (${estado.uf})`,
    description: `Energia eólica e solar cortada por restrições do ONS em ${estado.nome}, mês a mês, e as usinas mais afetadas.`,
    path: `/estados/${estado.uf.toLowerCase()}`,
  });
}

function FontePanel({
  fonte,
  result,
  stacked,
  nomeEstado,
}: {
  fonte: FonteAgregada;
  result: ApiResult<CurtailmentUfResposta>;
  stacked?: { eolica: CurtailmentMensalUf[]; solar: CurtailmentMensalUf[] };
  nomeEstado: string;
}) {
  if (!result.ok) {
    return result.error.isNotFound ? (
      <DataUnavailable title="Sem dados para este estado">
        Não há usinas {fonte === "total" ? "eólicas ou solares" : fonte === "eolica" ? "eólicas" : "solares"}{" "}
        com restrições registradas pelo ONS em {nomeEstado}.
      </DataUnavailable>
    ) : (
      <DataUnavailable />
    );
  }

  const { serie, ranking, mes_ranking } = result.data;
  if (serie.length === 0) {
    return (
      <DataUnavailable title="Sem dados para esta fonte">
        Não há registros de {formatFonte(fonte).toLowerCase()} em {nomeEstado}.
      </DataUnavailable>
    );
  }

  const ultimo = latest(serie);
  const sourceRows = stacked ? [...stacked.eolica, ...stacked.solar] : serie;
  const energy = pickEnergyUnit(Math.max(...serie.map((r) => r.energia_cortada_mwh)));
  const series: ChartSeries[] = stacked
    ? [
        { key: "eolica", label: "Eólica", color: FONTE_COLORS.eolica },
        { key: "solar", label: "Solar", color: FONTE_COLORS.solar },
      ]
    : [
        {
          key: fonte,
          label: formatFonte(fonte),
          color: fonte === "solar" ? FONTE_COLORS.solar : FONTE_COLORS.eolica,
        },
      ];
  const rows = pivotByMonth(
    sourceRows,
    (r) => r.fonte,
    (r) => r.energia_cortada_mwh / energy.divisor,
  );

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 font-semibold">{formatMesLongo(ultimo?.mes)}</h3>
        <StatGrid>
          <StatTile label="Energia cortada" value={formatEnergy(ultimo?.energia_cortada_mwh)} />
          <StatTile label="% de corte" value={formatPercent(ultimo?.percentual_corte)} />
          <StatTile label="Perda estimada" value={formatBRLCompact(ultimo?.perda_estimada_brl)} note="estimativa" />
          <StatTile label="Usinas afetadas" value={formatNumber(ultimo?.usinas_afetadas, 0)} />
        </StatGrid>
      </div>

      <MonthlyChart
        title={`Energia cortada por mês em ${nomeEstado} — ${formatFonte(fonte).toLowerCase()} (${energy.unit})`}
        rows={rows}
        series={series}
        unit={energy.unit}
        digits={energy.digits}
      />

      <div>
        <h3 className="mb-1 font-semibold">
          Usinas mais afetadas em {formatMesLongo(mes_ranking)}
        </h3>
        <p className="mb-3 text-sm text-[var(--color-ink-2)]">
          Ranking por energia cortada no mês (até 20 usinas).
        </p>
        {ranking.length > 0 ? (
          <RankingTable
            itens={ranking}
            caption={`Usinas com mais energia cortada em ${nomeEstado}, ${formatMesCurto(mes_ranking)}`}
          />
        ) : (
          <p className="text-sm text-[var(--color-ink-2)]">Nenhuma usina com corte neste mês.</p>
        )}
      </div>

      <div>
        <h3 className="mb-3 font-semibold">Por que a energia foi cortada (todo o período)</h3>
        <ReasonBreakdown
          periodo={sumMotivos(serie)}
          ultimoMes={ultimo ? sumMotivos([ultimo]) : undefined}
          ultimoMesLabel={formatMesCurto(ultimo?.mes)}
        />
      </div>
    </div>
  );
}

export default async function EstadoPage({ params }: { params: Promise<Params> }) {
  const { uf } = await params;
  const estado = findEstado(uf);
  if (!estado) notFound();

  const [total, eolica, solar] = await Promise.all([
    getCurtailmentUf(estado.uf, "total"),
    getCurtailmentUf(estado.uf, "eolica"),
    getCurtailmentUf(estado.uf, "solar"),
  ]);

  const meses = total.ok ? total.data.serie.map((r) => normalizeMes(r.mes)) : [];

  return (
    <Container>
      <JsonLd
        data={datasetJsonLd({
          name: `Curtailment mensal eólico e solar — ${estado.nome}`,
          description: `Energia eólica e solar cortada por restrições do ONS em ${estado.nome}, por mês e fonte, e ranking das usinas mais afetadas.`,
          path: `/estados/${estado.uf.toLowerCase()}`,
          temporalCoverage: temporalCoverage(meses),
          spatialCoverage: `${estado.nome}, Brasil`,
        })}
      />
      <PageHeader
        eyebrow={
          <Link href="/estados" className="underline">
            Estados
          </Link>
        }
        title={`${estado.nome} (${estado.uf})`}
      >
        <p>Energia eólica e solar que deixou de ser gerada por ordem do ONS, mês a mês.</p>
      </PageHeader>

      <Section id="serie" title="Série mensal">
        <Tabs
          label="Fonte"
          panels={[
            {
              key: "total",
              label: "Total",
              content: (
                <FontePanel
                  fonte="total"
                  result={total}
                  nomeEstado={estado.nome}
                  stacked={
                    eolica.ok || solar.ok
                      ? {
                          eolica: eolica.ok ? eolica.data.serie : [],
                          solar: solar.ok ? solar.data.serie : [],
                        }
                      : undefined
                  }
                />
              ),
            },
            {
              key: "eolica",
              label: "Eólica",
              content: <FontePanel fonte="eolica" result={eolica} nomeEstado={estado.nome} />,
            },
            {
              key: "solar",
              label: "Solar",
              content: <FontePanel fonte="solar" result={solar} nomeEstado={estado.nome} />,
            },
          ]}
        />
      </Section>

      <Notice>
        Dados de usinas solares só existem a partir de abril de 2024. Os meses mais recentes podem
        ser revisados pelo ONS. <Link href="/metodologia" className="underline">Metodologia</Link>.
      </Notice>

      <p className="mt-6 text-sm">
        <Link href={`/usinas?uf=${estado.uf}`} className="text-[var(--color-accent)] underline">
          Ver todas as usinas de {estado.nome}
        </Link>
      </p>
    </Container>
  );
}
