import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MonthlyChart } from "@/components/charts/monthly-chart";
import { SOURCE_COLORS } from "@/components/charts/palette";
import type { ChartSeries } from "@/components/charts/types";
import { JsonLd } from "@/components/json-ld";
import { RankingTable } from "@/components/ranking-table";
import { ReasonBreakdown, sumReasons } from "@/components/reason-breakdown";
import { Tabs } from "@/components/tabs";
import {
  Container,
  DataUnavailable,
  Notice,
  PageHeader,
  Section,
  StatGrid,
  StatTile,
} from "@/components/ui";
import type { ApiResult } from "@/lib/api/client";
import { getStateCurtailment } from "@/lib/api/queries";
import type {
  StateMonthlyCurtailment,
  StateCurtailmentResponse,
  AggregateSource,
} from "@/lib/api/types";
import {
  formatBRLCompact,
  formatEnergy,
  formatSource,
  formatShortMonth,
  formatLongMonth,
  formatNumber,
  formatPercent,
} from "@/lib/format";
import { findState } from "@/lib/geo";
import { pageMetadata } from "@/lib/metadata";
import { latest, normalizeMonth, pickEnergyUnit, pivotByMonth } from "@/lib/series";
import { datasetJsonLd, temporalCoverage } from "@/lib/structured-data";

export const revalidate = 3600;

export function generateStaticParams() {
  return [];
}

type Params = { uf: string };

const KIND_OPTIONS = ["stacked-bar", "line"] as const;

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { uf: stateCode } = await params;
  const brazilianState = findState(stateCode);
  if (!brazilianState) return { title: "Estado não encontrado" };
  return pageMetadata({
    title: `Curtailment eólico e solar em ${brazilianState.name} (${brazilianState.state})`,
    description: `Energia eólica e solar cortada por restrições do ONS em ${brazilianState.name}, mês a mês, e as usinas mais afetadas.`,
    path: `/estados/${brazilianState.state.toLowerCase()}`,
  });
}

function SourcePanel({
  source,
  result,
  stacked,
  stateName,
  state,
}: {
  source: AggregateSource;
  state: string;
  result: ApiResult<StateCurtailmentResponse>;
  stacked?: { wind: StateMonthlyCurtailment[]; solar: StateMonthlyCurtailment[] };
  stateName: string;
}) {
  if (!result.ok) {
    return result.error.isNotFound ? (
      <DataUnavailable title="Sem dados para este estado">
        Não há usinas{" "}
        {source === "total" ? "eólicas ou solares" : source === "wind" ? "eólicas" : "solares"} com
        restrições registradas pelo ONS em {stateName}.
      </DataUnavailable>
    ) : (
      <DataUnavailable />
    );
  }

  const { series, ranking, ranking_month } = result.data;
  if (series.length === 0) {
    return (
      <DataUnavailable title="Sem dados para esta fonte">
        Não há registros de {formatSource(source).toLowerCase()} em {stateName}.
      </DataUnavailable>
    );
  }

  const latestRow = latest(series);
  const sourceRows = stacked ? [...stacked.wind, ...stacked.solar] : series;
  const energy = pickEnergyUnit(Math.max(...series.map((r) => r.curtailed_mwh)));
  const chartSeries: ChartSeries[] = stacked
    ? [
        { key: "wind", label: "Eólica", color: SOURCE_COLORS.wind },
        { key: "solar", label: "Solar", color: SOURCE_COLORS.solar },
      ]
    : [
        {
          key: source,
          label: formatSource(source),
          color: source === "solar" ? SOURCE_COLORS.solar : SOURCE_COLORS.wind,
        },
      ];
  const rows = pivotByMonth(
    sourceRows,
    (r) => r.source,
    (r) => r.curtailed_mwh / energy.divisor,
  );

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-ink-2 mb-3 text-sm font-medium">
          Último mês com dados: {formatLongMonth(latestRow?.month)}
        </h3>
        <StatGrid>
          <StatTile
            highlight
            label="Energia cortada"
            value={formatEnergy(latestRow?.curtailed_mwh)}
          />
          <StatTile label="% de corte" value={formatPercent(latestRow?.curtailment_pct)} />
          <StatTile
            label="Perda estimada"
            value={formatBRLCompact(latestRow?.estimated_loss_brl)}
            note="estimativa pelo PLD"
          />
          <StatTile label="Usinas afetadas" value={formatNumber(latestRow?.affected_plants, 0)} />
        </StatGrid>
      </div>

      <MonthlyChart
        title={`Energia cortada por mês em ${stateName} — ${formatSource(source).toLowerCase()} (${energy.unit})`}
        rows={rows}
        series={chartSeries}
        unit={energy.unit}
        digits={energy.digits}
        kindOptions={KIND_OPTIONS}
      />

      <div>
        <div className="mb-3 flex flex-wrap items-end justify-between gap-x-6 gap-y-1">
          <div>
            <h3 className="text-lg font-semibold tracking-tight">
              Usinas mais afetadas em {formatLongMonth(ranking_month)}
            </h3>
            <p className="text-ink-2 text-sm">
              Ranking por energia cortada no mês (até 20 usinas).
            </p>
          </div>
          <Link
            href={`/usinas?uf=${state}`}
            className="text-accent text-sm font-medium hover:underline"
          >
            Todas as usinas de {stateName} →
          </Link>
        </div>
        {ranking.length > 0 ? (
          <RankingTable
            items={ranking}
            caption={`Usinas com mais energia cortada em ${stateName}, ${formatShortMonth(ranking_month)}`}
          />
        ) : (
          <p className="text-ink-2 text-sm">Nenhuma usina com corte neste mês.</p>
        )}
      </div>

      <div>
        <h3 className="mb-3 text-lg font-semibold tracking-tight">
          Por que a energia foi cortada{" "}
          <span className="text-ink-2 font-normal">(todo o período)</span>
        </h3>
        <ReasonBreakdown
          period={sumReasons(series)}
          latestMonth={latestRow ? sumReasons([latestRow]) : undefined}
          latestMonthLabel={formatShortMonth(latestRow?.month)}
        />
      </div>
    </div>
  );
}

export default async function StatePage({ params }: { params: Promise<Params> }) {
  const { uf: stateCode } = await params;
  const brazilianState = findState(stateCode);
  if (!brazilianState) notFound();

  const [total, wind, solar] = await Promise.all([
    getStateCurtailment(brazilianState.state, "total"),
    getStateCurtailment(brazilianState.state, "wind"),
    getStateCurtailment(brazilianState.state, "solar"),
  ]);

  const months = total.ok ? total.data.series.map((r) => normalizeMonth(r.month)) : [];

  return (
    <Container>
      <JsonLd
        data={datasetJsonLd({
          name: `Curtailment mensal eólico e solar — ${brazilianState.name}`,
          description: `Energia eólica e solar cortada por restrições do ONS em ${brazilianState.name}, por mês e fonte, e ranking das usinas mais afetadas.`,
          path: `/estados/${brazilianState.state.toLowerCase()}`,
          temporalCoverage: temporalCoverage(months),
          spatialCoverage: `${brazilianState.name}, Brasil`,
        })}
      />
      <PageHeader
        eyebrow={
          <Link href="/estados" className="underline">
            Estados
          </Link>
        }
        title={`${brazilianState.name} (${brazilianState.state})`}
      >
        <p>Energia eólica e solar que deixou de ser gerada por ordem do ONS, mês a mês.</p>
      </PageHeader>

      <Section id="series" title="Série mensal">
        <Tabs
          label="Fonte"
          panels={[
            {
              key: "total",
              label: "Total",
              content: (
                <SourcePanel
                  state={brazilianState.state}
                  source="total"
                  result={total}
                  stateName={brazilianState.name}
                  stacked={
                    wind.ok || solar.ok
                      ? {
                          wind: wind.ok ? wind.data.series : [],
                          solar: solar.ok ? solar.data.series : [],
                        }
                      : undefined
                  }
                />
              ),
            },
            {
              key: "wind",
              label: "Eólica",
              content: (
                <SourcePanel
                  source="wind"
                  result={wind}
                  stateName={brazilianState.name}
                  state={brazilianState.state}
                />
              ),
            },
            {
              key: "solar",
              label: "Solar",
              content: (
                <SourcePanel
                  source="solar"
                  result={solar}
                  stateName={brazilianState.name}
                  state={brazilianState.state}
                />
              ),
            },
          ]}
        />
      </Section>

      <Notice>
        Dados de usinas solares só existem a partir de abril de 2024. Os meses mais recentes podem
        ser revisados pelo ONS.{" "}
        <Link href="/metodologia" className="underline">
          Metodologia
        </Link>
        .
      </Notice>
    </Container>
  );
}
