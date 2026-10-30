import Link from "next/link";
import { MonthlyChart } from "@/components/charts/monthly-chart";
import { SOURCE_COLORS, SUBSYSTEM_COLORS } from "@/components/charts/palette";
import { JsonLd } from "@/components/json-ld";
import { MemberCallout } from "@/components/member-callout";
import { CurtailmentHero } from "@/components/curtailment-hero";
import { DashboardFilters } from "@/components/kpi-filters";
import { Tabs } from "@/components/tabs";
import { Container, DataUnavailable, Notice, Section, StatGrid, StatTile } from "@/components/ui";
import { getCurtailmentSummary, getReports, getSubsystemCurtailment } from "@/lib/api/queries";
import { reportForMonth } from "@/lib/month-report";
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
import { STATES, REGIONS, SUBSYSTEMS } from "@/lib/geo";
import { defaultPeriod, filterByMonthRange, normalizeMonth, pivotByMonth } from "@/lib/series";
import { datasetJsonLd, temporalCoverage } from "@/lib/structured-data";
import { getCurrentMember } from "@/lib/members";

const KIND_OPTIONS = ["stacked-bar", "line"] as const;
const STACK_ORDER = ["NE", "SE", "S", "N"] as const;

const NATIONAL_SCOPE = "SIN";

const HERO_MONTHS = 24;

const AREA_LINKS = [
  { href: "/estados", label: "Estados" },
  { href: "/usinas", label: "Usinas" },
  { href: "/comparar", label: "Comparar" },
  { href: "/relatorios", label: "Relatórios mensais" },
  { href: "/previsao", label: "Previsão" },
  { href: "/analises", label: "Análises" },
] as const;
const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

type SearchParams = Record<string, string | string[] | undefined>;

function onlySin(rows: SubsystemMonthlyCurtailment[]) {
  return rows.filter((r) => r.subsystem === "SIN");
}

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
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
  return valid ? { start: from, end: to } : defaultPeriod(firstMonth, lastMonth);
}

export async function DashboardView({ params }: { params: SearchParams }) {
  const [total, wind, solar, reports, member] = await Promise.all([
    getSubsystemCurtailment("total"),
    getSubsystemCurtailment("wind"),
    getSubsystemCurtailment("solar"),
    getReports(),
    getCurrentMember(),
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
  const { start, end } = parsePeriod(params, firstMonth, lastMonth);
  const sourceRows = filterByMonthRange(bySource, start, end);
  const subsystemRows = filterByMonthRange(bySubsystem, start, end);
  const summary = hasData ? await getCurtailmentSummary(NATIONAL_SCOPE, start, end) : null;
  const kpi = summary?.ok ? summary.data : null;
  const monthReport = reportForMonth(reports.ok ? reports.data.items : undefined, end);
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
          path: "/curtailment",
          temporalCoverage: temporalCoverage(months),
          spatialCoverage: "Brasil",
        })}
      />
      <CurtailmentHero
        points={sinTotal.slice(-HERO_MONTHS).map((row) => ({
          label: formatShortMonth(row.month),
          value: mwhToGwh(row.curtailed_mwh),
        }))}
        newsletterEnabled={member ? member.marketing_opt_in : undefined}
      />
      <header className="pb-2">
        <ul className="mt-4 flex flex-wrap gap-2 text-sm font-medium">
          {AREA_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="border-line bg-surface hover:border-accent hover:bg-accent-soft inline-block rounded-full border px-3.5 py-1.5"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </header>

      {monthReport ? (
        <aside className="border-grid bg-surface mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm">
          <p className="text-ink-2">
            <span className="text-ink font-semibold">
              Relatório de {formatLongMonth(monthReport.month)}:
            </span>{" "}
            {monthReport.title}
          </p>
          <span className="flex items-center gap-4 font-medium">
            <Link href={`/relatorios/${monthReport.slug}`} className="text-accent underline">
              Ler o relatório
            </Link>
            <Link href="/relatorios" className="text-ink-2 hover:text-accent underline">
              Todos os relatórios
            </Link>
          </span>
        </aside>
      ) : null}

      {!hasData ? (
        <DataUnavailable />
      ) : (
        <>
          <Section
            id="resumo"
            title={`Brasil: ${periodLabel}`}
            description="Total nacional (SIN), eólica + solar. O período escolhido vale para os indicadores e para os gráficos."
          >
            <DashboardFilters first={firstMonth} last={lastMonth} start={start} end={end} />
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
                    sourceRows.length > 0 ? (
                      <MonthlyChart
                        title="Energia cortada por mês, eólica e solar"
                        description="Total nacional. Dados de usinas solares só existem a partir de abril de 2024."
                        rows={sourceRows}
                        kindOptions={KIND_OPTIONS}
                        periodFilter={false}
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
                    subsystemRows.length > 0 ? (
                      <MonthlyChart
                        title="Energia cortada por mês e subsistema"
                        description="Eólica + solar. O Nordeste concentra a maior parte dos parques."
                        rows={subsystemRows}
                        unit="GWh"
                        periodFilter={false}
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

      <div className="py-2">
        <MemberCallout />
      </div>

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
    </Container>
  );
}
