import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MonthlyChart } from "@/components/charts/monthly-chart";
import { SOURCE_COLORS } from "@/components/charts/palette";
import type { ChartSeries } from "@/components/charts/types";
import { JsonLd } from "@/components/json-ld";
import { RankingTable } from "@/components/ranking-table";
import { ReasonBreakdown, sumReasons } from "@/components/reason-breakdown";
import { DashboardFilters } from "@/components/kpi-filters";
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
import { getCurtailmentSummary, getStateCurtailment } from "@/lib/api/queries";
import type {
  StateMonthlyCurtailment,
  StateCurtailmentResponse,
  AggregateSource,
  CurtailmentSummary,
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
import { describePeriod, requestedEnd, resolvePeriod } from "@/lib/period";
import { latest, normalizeMonth, pickEnergyUnit, pivotByMonth } from "@/lib/series";
import { datasetJsonLd, temporalCoverage } from "@/lib/structured-data";

export const dynamic = "force-dynamic";

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

function inPeriod<T extends { month: string }>(rows: readonly T[], start: string, end: string) {
  return rows.filter((row) => {
    const month = normalizeMonth(row.month);
    return month >= start && month <= end;
  });
}

function SourcePanel({
  source,
  result,
  stacked,
  stateName,
  state,
  start,
  end,
  summary,
}: {
  source: AggregateSource;
  state: string;
  result: ApiResult<StateCurtailmentResponse>;
  stacked?: { wind: StateMonthlyCurtailment[]; solar: StateMonthlyCurtailment[] };
  stateName: string;
  start: string;
  end: string;
  summary: ApiResult<CurtailmentSummary>;
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

  const { ranking, ranking_month } = result.data;
  const series = inPeriod(result.data.series, start, end);
  if (series.length === 0) {
    return (
      <DataUnavailable title="Sem dados para esta fonte">
        Não há registros de {formatSource(source).toLowerCase()} em {stateName}.
      </DataUnavailable>
    );
  }

  const latestRow = latest(series);
  const sourceRows = stacked ? inPeriod([...stacked.wind, ...stacked.solar], start, end) : series;
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
          {describePeriod(start, end, formatShortMonth)}
        </h3>
        {summary.ok ? (
          <StatGrid>
            <StatTile
              highlight
              label="Energia cortada"
              value={formatEnergy(summary.data.curtailed_mwh)}
            />
            <StatTile label="% de corte" value={formatPercent(summary.data.curtailment_pct)} />
            <StatTile
              label="Perda estimada"
              value={formatBRLCompact(summary.data.estimated_loss_brl)}
              note="estimativa pelo PLD"
            />
            <StatTile
              label="Usinas afetadas"
              value={formatNumber(summary.data.affected_plants, 0)}
            />
          </StatGrid>
        ) : (
          <DataUnavailable title="Indicadores indisponíveis" />
        )}
      </div>

      <MonthlyChart
        title={`Energia cortada por mês em ${stateName} — ${formatSource(source).toLowerCase()} (${energy.unit})`}
        rows={rows}
        series={chartSeries}
        unit={energy.unit}
        digits={energy.digits}
        kindOptions={KIND_OPTIONS}
        periodFilter={false}
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
          <span className="text-ink-2 font-normal">
            ({describePeriod(start, end, formatShortMonth)})
          </span>
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

export default async function StatePage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { uf: stateCode } = await params;
  const query = await searchParams;
  const brazilianState = findState(stateCode);
  if (!brazilianState) notFound();

  const rankingMonth = requestedEnd(query);
  const [total, wind, solar] = await Promise.all([
    getStateCurtailment(brazilianState.state, "total", rankingMonth),
    getStateCurtailment(brazilianState.state, "wind", rankingMonth),
    getStateCurtailment(brazilianState.state, "solar", rankingMonth),
  ]);

  const months = total.ok ? total.data.series.map((r) => normalizeMonth(r.month)).sort() : [];
  const firstMonth = months[0] ?? "";
  const lastMonth = months.at(-1) ?? "";
  const { start, end } = resolvePeriod(query, firstMonth, lastMonth);
  const [totalSummary, windSummary, solarSummary] = await Promise.all(
    (["total", "wind", "solar"] as const).map((source) =>
      getCurtailmentSummary(brazilianState.state, start, end, source),
    ),
  );

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
        {firstMonth ? (
          <DashboardFilters first={firstMonth} last={lastMonth} start={start} end={end} />
        ) : null}
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
                  start={start}
                  end={end}
                  summary={totalSummary!}
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
                  start={start}
                  end={end}
                  summary={windSummary!}
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
                  start={start}
                  end={end}
                  summary={solarSummary!}
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
