import Link from "next/link";
import { AnalysisFilters } from "@/components/analysis-filters";
import { AnalysisDownloads } from "@/components/download-menu";
import { HourlyChart } from "@/components/charts/hourly-chart";
import { REASON_COLORS } from "@/components/charts/palette";
import { Container, DataUnavailable, Notice } from "@/components/ui";
import {
  getCurtailmentSummary,
  getGroupRanking,
  getHourlyProfile,
  getMonths,
} from "@/lib/api/queries";
import type {
  AggregateSource,
  CurtailmentSummary,
  GroupRankingResponse,
  HourlyPoint,
} from "@/lib/api/types";
import {
  formatBRLCompact,
  formatGWh,
  formatNumber,
  formatPercent,
  formatShortMonth,
} from "@/lib/format";
import { pageMetadata } from "@/lib/metadata";
import { REASONS } from "@/lib/reasons";
import { defaultPeriod, normalizeMonth } from "@/lib/series";

export const metadata = pageMetadata({
  title: "Análises de curtailment",
  description:
    "Quanto do corte é potencialmente compensável, quais empresas e pontos de conexão mais perdem e em que horas a energia sobra.",
  path: "/analises",
  noIndex: true,
});

type SearchParams = Record<string, string | string[] | undefined>;

const TABS = [
  { key: "compensacao", label: "Compensação" },
  { key: "empresas", label: "Empresas e conexões" },
  { key: "horario", label: "Perfil horário" },
] as const;
type TabKey = (typeof TABS)[number]["key"];

const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;
const SOURCES: readonly AggregateSource[] = ["total", "wind", "solar"];
const SCOPES = ["SIN", "N", "NE", "SE", "S"] as const;
const RANKING_SIZE = 15;
const COMPENSABLE_KEYS = new Set(["rel", "cnf"]);

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function periodLabel(start: string, end: string) {
  return start === end
    ? formatShortMonth(start)
    : `${formatShortMonth(start)} a ${formatShortMonth(end)}`;
}

function tabHref(tab: TabKey, params: SearchParams) {
  const next = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    const single = first(value);
    if (single && key !== "aba") next.set(key, single);
  }
  if (tab !== "compensacao") next.set("aba", tab);
  const query = next.toString();
  return query ? `/analises?${query}` : "/analises";
}

function Compensation({
  summary,
  start,
  end,
}: {
  summary: CurtailmentSummary;
  start: string;
  end: string;
}) {
  const reasons = [
    { key: "rel", mwh: summary.curtailed_rel_mwh },
    { key: "cnf", mwh: summary.curtailed_cnf_mwh },
    { key: "ene", mwh: summary.curtailed_ene_mwh },
    { key: "other", mwh: summary.curtailed_other_mwh },
  ] as const;
  const total = summary.curtailed_mwh || 1;
  const compensable = summary.curtailed_rel_mwh + summary.curtailed_cnf_mwh;
  const share = (compensable / total) * 100;
  const loss = summary.estimated_loss_brl;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="bg-accent text-on-accent rounded-2xl p-5 sm:p-6">
          <p className="text-sm opacity-85">Potencialmente compensável</p>
          <p className="font-display mt-1 text-3xl font-bold tracking-tight">
            {formatGWh(compensable)}
          </p>
          <p className="mt-1 text-sm opacity-90">
            {formatPercent(share)} do corte de {periodLabel(start, end)}
            {loss !== null ? `, cerca de ${formatBRLCompact((loss * share) / 100)}` : ""}
          </p>
        </div>
        <div className="border-grid bg-surface shadow-card rounded-2xl border p-5 sm:p-6">
          <p className="text-ink-2 text-sm">Sem previsão de compensação</p>
          <p className="font-display mt-1 text-3xl font-bold tracking-tight">
            {formatGWh(total - compensable)}
          </p>
          <p className="text-ink-2 mt-1 text-sm">
            {formatPercent(100 - share)} do corte, por sobreoferta e outros
          </p>
        </div>
      </div>

      <div
        className="flex h-4 overflow-hidden rounded-full"
        role="img"
        aria-label="Divisão do corte por motivo"
      >
        {reasons.map((reason) => (
          <div
            key={reason.key}
            style={{
              width: `${(reason.mwh / total) * 100}%`,
              background: REASON_COLORS[reason.key],
            }}
          />
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-muted border-grid border-b text-left">
              <th className="py-2 pr-4 font-medium">Motivo do corte</th>
              <th className="py-2 pr-4 text-right font-medium">Energia</th>
              <th className="py-2 pr-4 text-right font-medium">Parcela</th>
              <th className="py-2 font-medium">Compensação</th>
            </tr>
          </thead>
          <tbody>
            {REASONS.filter(
              (reason) => (reasons.find((r) => r.key === reason.key)?.mwh ?? 0) > 0,
            ).map((reason) => {
              const mwh = reasons.find((r) => r.key === reason.key)?.mwh ?? 0;
              return (
                <tr key={reason.key} className="border-grid border-b align-top">
                  <td className="py-3 pr-4">
                    <span
                      aria-hidden
                      className="mr-2 inline-block size-2.5 rounded-full"
                      style={{ background: REASON_COLORS[reason.key] }}
                    />
                    <span className="font-medium">{reason.name}</span>
                    <p className="text-ink-2 mt-0.5 max-w-md text-xs">{reason.explanation}</p>
                  </td>
                  <td className="tabular py-3 pr-4 text-right">{formatGWh(mwh)}</td>
                  <td className="tabular py-3 pr-4 text-right">
                    {formatPercent((mwh / total) * 100)}
                  </td>
                  <td className="py-3">
                    {COMPENSABLE_KEYS.has(reason.key) ? (
                      <span className="bg-accent-soft text-accent-strong rounded-full px-2.5 py-0.5 text-xs font-semibold">
                        Em tese compensável
                      </span>
                    ) : (
                      <span className="text-muted text-xs">Fora da regra atual</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Notice>
        Informativo, não é aconselhamento jurídico. Segundo a imprensa e escritórios do setor, a
        Portaria MME 140/2026 prevê compensar só cortes por confiabilidade elétrica ou
        indisponibilidade externa, em usinas ligadas à Rede Básica ou às DIT, para o período de
        1º/9/2023 a 25/11/2025. A ANEEL suspendeu os ressarcimentos em janeiro de 2026 e a Justiça
        negou a compensação integral em setembro (cabe recurso). Confirme a regra vigente antes de
        decidir. O valor em reais é proporcional à energia, pois o preço varia ao longo do mês.
      </Notice>
    </div>
  );
}

function RankingTable({
  title,
  ranking,
  showState,
}: {
  title: string;
  ranking: GroupRankingResponse | null;
  showState: boolean;
}) {
  if (!ranking || ranking.items.length === 0) {
    return <DataUnavailable title={`${title}: sem dados no período`} />;
  }
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="border-grid bg-surface shadow-card overflow-x-auto rounded-2xl border">
        <table className="w-full min-w-[40rem] text-sm">
          <thead>
            <tr className="text-muted border-grid border-b text-left">
              <th className="px-4 py-3 font-medium">#</th>
              <th className="px-2 py-3 font-medium">
                {showState ? "Ponto de conexão" : "Empresa"}
              </th>
              <th className="px-2 py-3 text-right font-medium">Usinas afetadas</th>
              <th className="px-2 py-3 text-right font-medium">Energia cortada</th>
              <th className="px-2 py-3 text-right font-medium">% de corte</th>
              <th className="px-2 py-3 text-right font-medium">Perda estimada</th>
              <th className="px-4 py-3 text-right font-medium">Compensável*</th>
            </tr>
          </thead>
          <tbody>
            {ranking.items.map((item) => (
              <tr key={item.name} className="border-grid border-b last:border-0">
                <td className="text-muted px-4 py-2.5">{item.rank}</td>
                <td className="px-2 py-2.5 font-medium">
                  {item.name}
                  {showState && item.state ? (
                    <span className="text-muted ml-2 text-xs font-normal">{item.state}</span>
                  ) : null}
                </td>
                <td className="tabular px-2 py-2.5 text-right">
                  {formatNumber(item.affected_plants, 0)}/{formatNumber(item.plants, 0)}
                </td>
                <td className="tabular px-2 py-2.5 text-right">{formatGWh(item.curtailed_mwh)}</td>
                <td className="tabular px-2 py-2.5 text-right">
                  {formatPercent(item.curtailment_pct)}
                </td>
                <td className="tabular px-2 py-2.5 text-right">
                  {formatBRLCompact(item.estimated_loss_brl)}
                </td>
                <td className="tabular px-4 py-2.5 text-right">
                  {item.curtailed_mwh > 0
                    ? formatPercent((item.compensable_mwh / item.curtailed_mwh) * 100, 0)
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function hourlyInsight(points: readonly HourlyPoint[]) {
  const weekday = points.filter((p) => p.day_type === "weekday");
  const peak = weekday.reduce<HourlyPoint | null>(
    (best, point) =>
      best === null || point.avg_curtailed_mwh > best.avg_curtailed_mwh ? point : best,
    null,
  );
  if (!peak) return null;
  const weekend = points.find((p) => p.day_type === "weekend" && p.hour === peak.hour);
  return { peak, weekend };
}

export default async function AnalysesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const monthsResult = await getMonths();
  const months = monthsResult.ok ? monthsResult.data.months.map(normalizeMonth).sort() : [];
  const firstMonth = months[0] ?? "";
  const lastMonth = months.at(-1) ?? "";

  const requestedTab = first(params.aba);
  const tab: TabKey = TABS.some((t) => t.key === requestedTab)
    ? (requestedTab as TabKey)
    : "compensacao";
  const requestedSource = first(params.fonte) as AggregateSource | undefined;
  const source: AggregateSource =
    requestedSource && SOURCES.includes(requestedSource) ? requestedSource : "total";
  const requestedScope = first(params.escopo);
  const scope = SCOPES.find((s) => s === requestedScope) ?? "SIN";
  const from = first(params.de);
  const to = first(params.ate);
  const validPeriod =
    from &&
    to &&
    MONTH_PATTERN.test(from) &&
    MONTH_PATTERN.test(to) &&
    from >= firstMonth &&
    to <= lastMonth &&
    from <= to;
  const { start, end } = validPeriod
    ? { start: from, end: to }
    : defaultPeriod(firstMonth, lastMonth);

  let content: React.ReactNode;
  if (!firstMonth) {
    content = <DataUnavailable />;
  } else if (tab === "compensacao") {
    const summary = await getCurtailmentSummary("SIN", start, end, source);
    content = summary.ok ? (
      <Compensation summary={summary.data} start={start} end={end} />
    ) : (
      <DataUnavailable />
    );
  } else if (tab === "empresas") {
    const [operators, connections] = await Promise.all([
      getGroupRanking("operators", { source, start, end, limit: RANKING_SIZE }),
      getGroupRanking("connection-points", { source, start, end, limit: RANKING_SIZE }),
    ]);
    content = (
      <div className="space-y-8">
        <RankingTable
          title="Empresas com mais energia cortada"
          ranking={operators.ok ? operators.data : null}
          showState={false}
        />
        <RankingTable
          title="Pontos de conexão com mais energia cortada"
          ranking={connections.ok ? connections.data : null}
          showState
        />
        <p className="text-muted text-xs">
          * Parcela do corte por confiabilidade elétrica ou indisponibilidade externa, em tese
          compensável. Empresa é o agente operador informado pelo ONS e pode reunir várias usinas.
        </p>
      </div>
    );
  } else {
    const profile = await getHourlyProfile(scope, source, start, end);
    const insight = profile.ok ? hourlyInsight(profile.data.points) : null;
    content =
      profile.ok && profile.data.points.length > 0 ? (
        <div className="space-y-4">
          {insight ? (
            <p className="text-ink-2 max-w-3xl leading-7">
              O corte médio chega ao pico às <strong>{insight.peak.hour}h</strong>: em dias úteis,{" "}
              <strong>{formatNumber(insight.peak.avg_curtailed_mwh / 1000, 1)} GWh</strong> por hora
              ({formatPercent(insight.peak.curtailment_pct)} do que poderia ser gerado)
              {insight.weekend
                ? `; nos fins de semana, ${formatNumber(insight.weekend.avg_curtailed_mwh / 1000, 1)} GWh.`
                : "."}
            </p>
          ) : null}
          <HourlyChart points={profile.data.points} />
        </div>
      ) : (
        <DataUnavailable title="Sem dados horários para esta seleção" />
      );
  }

  return (
    <Container>
      <header className="pt-8 pb-4 sm:pt-10">
        <p className="text-accent text-xs font-semibold tracking-[0.14em] uppercase">Análises</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
          Análises do curtailment
        </h1>
      </header>

      <nav
        aria-label="Análises"
        className="border-line bg-surface mb-5 inline-flex flex-wrap gap-1 rounded-lg border p-1"
      >
        {TABS.map((item) => (
          <Link
            key={item.key}
            href={tabHref(item.key, params)}
            aria-current={item.key === tab ? "page" : undefined}
            className={`rounded-md px-3 py-1.5 text-sm font-medium ${
              item.key === tab ? "bg-accent text-on-accent" : "text-ink-2 hover:bg-surface-2"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {firstMonth ? (
        <AnalysisFilters
          first={firstMonth}
          last={lastMonth}
          start={start}
          end={end}
          source={source}
          scope={tab === "horario" ? scope : undefined}
        />
      ) : null}
      {firstMonth ? (
        <div className="flex justify-end pb-4">
          <AnalysisDownloads filters={{ scope, source, start, end }} />
        </div>
      ) : null}
      <div className="pb-12">{content}</div>
    </Container>
  );
}
