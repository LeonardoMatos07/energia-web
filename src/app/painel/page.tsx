import Link from "next/link";
import { MonthlyChart } from "@/components/charts/monthly-chart";
import { SOURCE_COLORS, SUBSYSTEM_COLORS } from "@/components/charts/palette";
import { JsonLd } from "@/components/json-ld";
import { NewsletterForm } from "@/components/newsletter-form";
import { KpiFilters } from "@/components/kpi-filters";
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
import { getCurtailmentSummary, getSubsystemCurtailment } from "@/lib/api/queries";
import type { SubsystemMonthlyCurtailment } from "@/lib/api/types";
import {
  formatBRLCompact,
  formatGWh,
  formatLongMonth,
  formatNumber,
  formatPercent,
  formatShortMonth,
  mwhToGwh,
} from "@/lib/format";
import { DEFAULT_SCOPE, STATES, REGIONS, SUBSYSTEMS, findState, subsystemName } from "@/lib/geo";
import { pageMetadata } from "@/lib/metadata";
import { normalizeMonth, pivotByMonth } from "@/lib/series";
import { SITE_DESCRIPTION } from "@/lib/site";
import { datasetJsonLd, temporalCoverage } from "@/lib/structured-data";
import { subscribeNewsletter } from "@/app/newsletter/actions";

export const revalidate = 3600;

export const metadata = pageMetadata({
  title: "Painel nacional de curtailment eólico e solar",
  description: SITE_DESCRIPTION,
  path: "/painel",
});

const KIND_OPTIONS = ["stacked-bar", "line"] as const;
const STACK_ORDER = ["NE", "SE", "S", "N"] as const;

const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;
const SUBSYSTEM_IDS: readonly string[] = SUBSYSTEMS.map((s) => s.id);

type SearchParams = Record<string, string | string[] | undefined>;

function onlySin(rows: SubsystemMonthlyCurtailment[]) {
  return rows.filter((r) => r.subsystem === "SIN");
}

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function parseScope(value: string | undefined) {
  const upper = value?.toUpperCase();
  if (upper && (SUBSYSTEM_IDS.includes(upper) || findState(upper))) return upper;
  return DEFAULT_SCOPE;
}

function parsePeriod(params: SearchParams, firstMonth: string, lastMonth: string) {
  const from = first(params.de);
  const to = first(params.ate);
  const valid =
    from !== undefined &&
    to !== undefined &&
    MONTH_PATTERN.test(from) &&
    MONTH_PATTERN.test(to) &&
    from >= firstMonth &&
    to <= lastMonth &&
    from <= to;
  return valid ? { start: from, end: to } : { start: lastMonth, end: lastMonth };
}

function scopeName(scope: string) {
  if (scope === DEFAULT_SCOPE) return "Brasil (SIN)";
  return findState(scope)?.name ?? subsystemName(scope);
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const [total, wind, solar] = await Promise.all([
    getSubsystemCurtailment("total"),
    getSubsystemCurtailment("wind"),
    getSubsystemCurtailment("solar"),
  ]);

  const totalRows = total.ok ? total.data.items : [];
  const sinTotal = onlySin(totalRows);

  const bySource = pivotByMonth(
    [...(wind.ok ? onlySin(wind.data.items) : []), ...(solar.ok ? onlySin(solar.data.items) : [])],
    (r) => r.source,
    (r) => mwhToGwh(r.curtailed_mwh),
  );
  const bySubsystem = pivotByMonth(
    totalRows.filter((r) => r.subsystem !== "SIN"),
    (r) => r.subsystem,
    (r) => mwhToGwh(r.curtailed_mwh),
  );

  const hasData = sinTotal.length > 0;
  const months = sinTotal.map((r) => normalizeMonth(r.month));
  const firstMonth = months[0] ?? "";
  const lastMonth = months.at(-1) ?? "";
  const scope = parseScope(first(params.unidade));
  const { start, end } = parsePeriod(params, firstMonth, lastMonth);
  const summary = hasData ? await getCurtailmentSummary(scope, start, end) : null;
  const kpi = summary?.ok ? summary.data : null;
  const isLatestNational = scope === DEFAULT_SCOPE && start === lastMonth && end === lastMonth;
  const periodLabel =
    start === end
      ? formatLongMonth(start)
      : `${formatShortMonth(start)} a ${formatShortMonth(end)}`;

  return (
    <Container>
      <JsonLd
        data={datasetJsonLd({
          name: "Curtailment mensal de usinas eólicas e solares no Brasil (SIN)",
          description:
            "Energia eólica e solar cortada por restrições de operação do ONS, por mês, fonte e subsistema, com perda estimada em R$.",
          path: "/painel",
          temporalCoverage: temporalCoverage(months),
          spatialCoverage: "Brasil",
        })}
      />
      <PageHeader
        eyebrow="Monitor de curtailment"
        title="Quanta energia limpa o Brasil deixa de gerar"
      >
        <p>
          Quando a rede não consegue receber toda a energia, o ONS manda usinas eólicas e solares
          reduzirem a produção. Esse corte — o <em>curtailment</em> — é energia que existia e foi
          desperdiçada. Aqui você acompanha, mês a mês, onde e quanto.
        </p>
      </PageHeader>

      {!hasData ? (
        <DataUnavailable />
      ) : (
        <>
          <Section
            id="resumo"
            title={
              isLatestNational ? `Último mês com dados: ${periodLabel}` : `${scopeName(scope)}`
            }
            description={
              isLatestNational
                ? "Total nacional (SIN), eólica + solar."
                : `${periodLabel} · eólica + solar. Escolha outro período ou unidade abaixo.`
            }
          >
            <KpiFilters first={firstMonth} last={lastMonth} start={start} end={end} scope={scope} />
            {kpi ? (
              <StatGrid>
                <StatTile
                  highlight
                  label="Energia cortada"
                  value={formatGWh(kpi.curtailed_mwh)}
                  note="eólica + solar"
                />
                <StatTile
                  label="% de corte"
                  value={formatPercent(kpi.curtailment_pct)}
                  note="cortada ÷ (gerada + cortada)"
                />
                <StatTile
                  label="Perda estimada"
                  value={formatBRLCompact(kpi.estimated_loss_brl)}
                  note={
                    <Link href="/metodologia#perda" className="hover:text-accent underline">
                      estimativa pelo PLD
                    </Link>
                  }
                />
                <StatTile
                  label="Usinas afetadas"
                  value={formatNumber(kpi.affected_plants, 0)}
                  note={start === end ? "com algum corte no mês" : "com algum corte no período"}
                />
              </StatGrid>
            ) : (
              <DataUnavailable title="Indicadores indisponíveis" />
            )}
          </Section>

          <Section
            id="evolution"
            title="Evolução mensal"
            description="Energia que deixou de ser gerada por ordem do ONS, mês a mês."
          >
            <Tabs
              label="Detalhar por"
              panels={[
                {
                  key: "source",
                  label: "Por fonte",
                  content:
                    bySource.length > 0 ? (
                      <MonthlyChart
                        title="Energia cortada por mês, eólica e solar"
                        description="Total nacional. Dados de usinas solares só existem a partir de abril de 2024."
                        rows={bySource}
                        kindOptions={KIND_OPTIONS}
                        unit="GWh"
                        series={[
                          { key: "wind", label: "Eólica", color: SOURCE_COLORS.wind },
                          { key: "solar", label: "Solar", color: SOURCE_COLORS.solar },
                        ]}
                      />
                    ) : (
                      <DataUnavailable title="Série por fonte indisponível" />
                    ),
                },
                {
                  key: "subsystem",
                  label: "Por subsistema",
                  content:
                    bySubsystem.length > 0 ? (
                      <MonthlyChart
                        title="Energia cortada por mês e subsistema"
                        description="Eólica + solar. O Nordeste concentra a maior parte dos parques."
                        rows={bySubsystem}
                        unit="GWh"
                        series={STACK_ORDER.map((id) => ({
                          key: id,
                          label: SUBSYSTEMS.find((s) => s.id === id)?.name ?? id,
                          color: SUBSYSTEM_COLORS[id],
                        }))}
                        kindOptions={KIND_OPTIONS}
                      />
                    ) : (
                      <DataUnavailable title="Série por subsistema indisponível" />
                    ),
                },
              ]}
            />
            <div className="mt-4">
              <Notice>
                Os números dos meses mais recentes podem mudar: o ONS revisa os dados após a
                publicação. Valores em R$ são estimativas.{" "}
                <Link href="/metodologia" className="font-medium underline">
                  Entenda a metodologia
                </Link>
                .
              </Notice>
            </div>
          </Section>
        </>
      )}

      <Section
        id="states"
        title="Veja por estado"
        action={
          <Link href="/estados" className="text-accent font-medium hover:underline">
            Todos os estados →
          </Link>
        }
      >
        <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
          {REGIONS.map((region) => (
            <div key={region}>
              <h3 className="text-muted text-xs font-semibold tracking-wide uppercase">{region}</h3>
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {STATES.filter((e) => e.region === region).map((e) => (
                  <li key={e.state}>
                    <Link
                      href={`/estados/${e.state.toLowerCase()}`}
                      className="border-line bg-surface hover:border-accent hover:bg-accent-soft hover:text-accent-strong inline-flex min-w-11 justify-center rounded-lg border px-2.5 py-1.5 text-sm font-medium"
                      title={e.name}
                    >
                      {e.state} <span className="sr-only">— {e.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      <div id="newsletter" className="py-6 sm:py-8">
        <NewsletterForm action={subscribeNewsletter} signupSource="home" />
      </div>
    </Container>
  );
}
