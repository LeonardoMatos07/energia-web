import Link from "next/link";
import { MonthlyChart } from "@/components/charts/monthly-chart";
import { SOURCE_COLORS, SUBSYSTEM_COLORS } from "@/components/charts/palette";
import { JsonLd } from "@/components/json-ld";
import { NewsletterForm } from "@/components/newsletter-form";
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
import { getSubsystemCurtailment } from "@/lib/api/queries";
import type { SubsystemMonthlyCurtailment } from "@/lib/api/types";
import {
  formatBRLCompact,
  formatGWh,
  formatLongMonth,
  formatNumber,
  formatPercent,
  mwhToGwh,
} from "@/lib/format";
import { STATES, REGIONS, SUBSYSTEMS } from "@/lib/geo";
import { pageMetadata } from "@/lib/metadata";
import { latest, normalizeMonth, pivotByMonth } from "@/lib/series";
import { SITE_DESCRIPTION } from "@/lib/site";
import { datasetJsonLd, temporalCoverage } from "@/lib/structured-data";
import { subscribeNewsletter } from "./newsletter/actions";

export const revalidate = 3600;

export const metadata = pageMetadata({
  title: "Painel nacional de curtailment eólico e solar",
  description: SITE_DESCRIPTION,
  path: "/",
});

function onlySin(rows: SubsystemMonthlyCurtailment[]) {
  return rows.filter((r) => r.subsystem === "SIN");
}

export default async function HomePage() {
  const [total, wind, solar] = await Promise.all([
    getSubsystemCurtailment("total"),
    getSubsystemCurtailment("wind"),
    getSubsystemCurtailment("solar"),
  ]);

  const totalRows = total.ok ? total.data.items : [];
  const sinTotal = onlySin(totalRows);
  const latestRow = latest(sinTotal);

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

  return (
    <Container>
      <JsonLd
        data={datasetJsonLd({
          name: "Curtailment mensal de usinas eólicas e solares no Brasil (SIN)",
          description:
            "Energia eólica e solar cortada por restrições de operação do ONS, por mês, fonte e subsistema, com perda estimada em R$.",
          path: "/",
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
            id="latest-month"
            title={`Último mês com dados: ${formatLongMonth(latestRow?.month)}`}
            description="Total nacional (SIN), eólica + solar."
          >
            <StatGrid>
              <StatTile
                highlight
                label="Energia cortada"
                value={formatGWh(latestRow?.curtailed_mwh)}
                note="eólica + solar"
              />
              <StatTile
                label="% de corte"
                value={formatPercent(latestRow?.curtailment_pct)}
                note="cortada ÷ (gerada + cortada)"
              />
              <StatTile
                label="Perda estimada"
                value={formatBRLCompact(latestRow?.estimated_loss_brl)}
                note={
                  <Link href="/metodologia#perda" className="hover:text-accent underline">
                    estimativa pelo PLD
                  </Link>
                }
              />
              <StatTile
                label="Usinas afetadas"
                value={formatNumber(latestRow?.affected_plants, 0)}
                note="com algum corte no mês"
              />
            </StatGrid>
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
                        series={SUBSYSTEMS.map((s) => ({
                          key: s.id,
                          label: s.name,
                          color: SUBSYSTEM_COLORS[s.id],
                        }))}
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
