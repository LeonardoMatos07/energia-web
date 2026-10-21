import Link from "next/link";
import { MonthlyChart } from "@/components/charts/monthly-chart";
import { FONTE_COLORS, SUBSISTEMA_COLORS } from "@/components/charts/palette";
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
import { getCurtailmentSin } from "@/lib/api/queries";
import type { CurtailmentMensalSin } from "@/lib/api/types";
import {
  formatBRLCompact,
  formatGWh,
  formatMesLongo,
  formatNumber,
  formatPercent,
  mwhToGwh,
} from "@/lib/format";
import { ESTADOS, REGIOES, SUBSISTEMAS } from "@/lib/geo";
import { pageMetadata } from "@/lib/metadata";
import { latest, normalizeMes, pivotByMonth } from "@/lib/series";
import { SITE_DESCRIPTION } from "@/lib/site";
import { datasetJsonLd, temporalCoverage } from "@/lib/structured-data";
import { subscribeNewsletter } from "./newsletter/actions";

// Pages regenerate hourly at most; API responses stay in the data cache for a day
// (or until `/api/revalidar` is called), so an hourly render is cheap and lets a page
// built while the API was down recover on its own.
export const revalidate = 3600;

export const metadata = pageMetadata({
  title: "Painel nacional de curtailment eólico e solar",
  description: SITE_DESCRIPTION,
  path: "/",
});

function onlySin(rows: CurtailmentMensalSin[]) {
  return rows.filter((r) => r.subsistema === "SIN");
}

export default async function HomePage() {
  const [total, eolica, solar] = await Promise.all([
    getCurtailmentSin("total"),
    getCurtailmentSin("eolica"),
    getCurtailmentSin("solar"),
  ]);

  const totalRows = total.ok ? total.data.itens : [];
  const sinTotal = onlySin(totalRows);
  const ultimo = latest(sinTotal);

  const porFonte = pivotByMonth(
    [
      ...(eolica.ok ? onlySin(eolica.data.itens) : []),
      ...(solar.ok ? onlySin(solar.data.itens) : []),
    ],
    (r) => r.fonte,
    (r) => mwhToGwh(r.energia_cortada_mwh),
  );
  const porSubsistema = pivotByMonth(
    totalRows.filter((r) => r.subsistema !== "SIN"),
    (r) => r.subsistema,
    (r) => mwhToGwh(r.energia_cortada_mwh),
  );

  const hasData = sinTotal.length > 0;
  const meses = sinTotal.map((r) => normalizeMes(r.mes));

  return (
    <Container>
      <JsonLd
        data={datasetJsonLd({
          name: "Curtailment mensal de usinas eólicas e solares no Brasil (SIN)",
          description:
            "Energia eólica e solar cortada por restrições de operação do ONS, por mês, fonte e subsistema, com perda estimada em R$.",
          path: "/",
          temporalCoverage: temporalCoverage(meses),
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
            id="ultimo-mes"
            title={`Último mês com dados: ${formatMesLongo(ultimo?.mes)}`}
            description="Total nacional (SIN), eólica + solar."
          >
            <StatGrid>
              <StatTile
                highlight
                label="Energia cortada"
                value={formatGWh(ultimo?.energia_cortada_mwh)}
                note="eólica + solar"
              />
              <StatTile
                label="% de corte"
                value={formatPercent(ultimo?.percentual_corte)}
                note="cortada ÷ (gerada + cortada)"
              />
              <StatTile
                label="Perda estimada"
                value={formatBRLCompact(ultimo?.perda_estimada_brl)}
                note={
                  <Link href="/metodologia#perda" className="hover:text-accent underline">
                    estimativa pelo PLD
                  </Link>
                }
              />
              <StatTile
                label="Usinas afetadas"
                value={formatNumber(ultimo?.usinas_afetadas, 0)}
                note="com algum corte no mês"
              />
            </StatGrid>
          </Section>

          <Section
            id="evolucao"
            title="Evolução mensal"
            description="Energia que deixou de ser gerada por ordem do ONS, mês a mês."
          >
            <Tabs
              label="Detalhar por"
              panels={[
                {
                  key: "fonte",
                  label: "Por fonte",
                  content:
                    porFonte.length > 0 ? (
                      <MonthlyChart
                        title="Energia cortada por mês, eólica e solar"
                        description="Total nacional. Dados de usinas solares só existem a partir de abril de 2024."
                        rows={porFonte}
                        unit="GWh"
                        series={[
                          { key: "eolica", label: "Eólica", color: FONTE_COLORS.eolica },
                          { key: "solar", label: "Solar", color: FONTE_COLORS.solar },
                        ]}
                      />
                    ) : (
                      <DataUnavailable title="Série por fonte indisponível" />
                    ),
                },
                {
                  key: "subsistema",
                  label: "Por subsistema",
                  content:
                    porSubsistema.length > 0 ? (
                      <MonthlyChart
                        title="Energia cortada por mês e subsistema"
                        description="Eólica + solar. O Nordeste concentra a maior parte dos parques."
                        rows={porSubsistema}
                        unit="GWh"
                        series={SUBSISTEMAS.map((s) => ({
                          key: s.id,
                          label: s.nome,
                          color: SUBSISTEMA_COLORS[s.id],
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
        id="estados"
        title="Veja por estado"
        action={
          <Link href="/estados" className="text-accent font-medium hover:underline">
            Todos os estados →
          </Link>
        }
      >
        <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
          {REGIOES.map((regiao) => (
            <div key={regiao}>
              <h3 className="text-muted text-xs font-semibold tracking-wide uppercase">{regiao}</h3>
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {ESTADOS.filter((e) => e.regiao === regiao).map((e) => (
                  <li key={e.uf}>
                    <Link
                      href={`/estados/${e.uf.toLowerCase()}`}
                      className="border-line bg-surface hover:border-accent hover:bg-accent-soft hover:text-accent-strong inline-flex min-w-11 justify-center rounded-lg border px-2.5 py-1.5 text-sm font-medium"
                      title={e.nome}
                    >
                      {e.uf} <span className="sr-only">— {e.nome}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      <div id="newsletter" className="py-6 sm:py-8">
        <NewsletterForm action={subscribeNewsletter} origem="home" />
      </div>
    </Container>
  );
}
