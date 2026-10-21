import Link from "next/link";
import { subscribeNewsletter } from "@/app/newsletter/actions";
import { JsonLd } from "@/components/json-ld";
import { NewsletterForm } from "@/components/newsletter-form";
import { Card, Container, Section, StatGrid, StatTile } from "@/components/ui";
import { getReports, getSubsystemCurtailment } from "@/lib/api/queries";
import type { SubsystemMonthlyCurtailment } from "@/lib/api/types";
import {
  formatBRLCompact,
  formatGWh,
  formatLongMonth,
  formatNumber,
  formatPercent,
  formatShortMonth,
} from "@/lib/format";
import { pageMetadata } from "@/lib/metadata";
import { latest, normalizeMonth, shiftMonth } from "@/lib/series";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE } from "@/lib/site";
import { publisher } from "@/lib/structured-data";

export const revalidate = 3600;

export const metadata = pageMetadata({
  title: `${SITE_NAME}: ${SITE_TAGLINE}`,
  description: SITE_DESCRIPTION,
  path: "/",
});

const FEATURES = [
  {
    href: "/painel",
    title: "Painel",
    text: "Energia cortada, % de corte, perda estimada e usinas afetadas, com filtro de período e gráficos em barras ou linhas.",
  },
  {
    href: "/estados",
    title: "Estados",
    text: "Veja como o corte se distribui pelo país e quais usinas mais perderam em cada estado.",
  },
  {
    href: "/usinas",
    title: "Usinas",
    text: "Uma página para cada usina e conjunto eólico ou solar, com o histórico mês a mês.",
  },
  {
    href: "/comparar",
    title: "Comparar",
    text: "Coloque usinas, estados e subsistemas lado a lado, em linhas, barras ou pizza.",
  },
  {
    href: "/relatorios",
    title: "Relatórios",
    text: "Um relatório para cada mês: o que mudou, onde os cortes se concentraram e por quê.",
  },
  {
    href: "/metodologia",
    title: "Metodologia",
    text: "De onde vêm os dados, como calculamos o corte e a perda em reais, e o que ainda é estimativa.",
  },
] as const;

function onlySin(rows: SubsystemMonthlyCurtailment[]) {
  return rows.filter((row) => row.subsystem === "SIN");
}

function percentChange(current: number, reference: number | undefined) {
  if (!reference) return null;
  const delta = ((current - reference) / reference) * 100;
  return `${delta >= 0 ? "+" : "−"}${formatPercent(Math.abs(delta))}`;
}

export default async function LandingPage() {
  const [total, wind, solar, reports] = await Promise.all([
    getSubsystemCurtailment("total"),
    getSubsystemCurtailment("wind"),
    getSubsystemCurtailment("solar"),
    getReports(),
  ]);

  const sinTotal = total.ok ? onlySin(total.data.items) : [];
  const latestRow = latest(sinTotal);
  const month = latestRow ? normalizeMonth(latestRow.month) : null;
  const sameMonthLastYear = month
    ? sinTotal.find((row) => normalizeMonth(row.month) === shiftMonth(month, -12))
    : undefined;
  const yearChange =
    latestRow && sameMonthLastYear
      ? percentChange(latestRow.curtailed_mwh, sameMonthLastYear.curtailed_mwh)
      : null;
  const windRow = wind.ok ? latest(onlySin(wind.data.items)) : undefined;
  const solarRow = solar.ok ? latest(onlySin(solar.data.items)) : undefined;
  const newestReport = reports.ok
    ? [...reports.data.items].sort((a, b) => b.month.localeCompare(a.month))[0]
    : undefined;

  const highlights = [
    newestReport
      ? {
          key: "report",
          label: `Relatório de ${formatLongMonth(newestReport.month)}`,
          title: newestReport.title,
          text: newestReport.summary,
          href: `/relatorios/${newestReport.slug}`,
          action: "Ler o relatório",
        }
      : null,
    latestRow && month && yearChange && sameMonthLastYear
      ? {
          key: "year",
          label: "Frente ao ano passado",
          title: `${yearChange} de energia cortada em ${formatShortMonth(month)} na comparação com ${formatShortMonth(sameMonthLastYear.month)}`,
          text: `Foram ${formatGWh(latestRow.curtailed_mwh)} agora, contra ${formatGWh(sameMonthLastYear.curtailed_mwh)} um ano antes. O percentual de corte foi de ${formatPercent(latestRow.curtailment_pct)} e de ${formatPercent(sameMonthLastYear.curtailment_pct)}.`,
          href: "/painel",
          action: "Explorar no painel",
        }
      : null,
    windRow && solarRow
      ? {
          key: "source",
          label: "Eólica e solar",
          title: `A solar perdeu ${formatPercent(solarRow.curtailment_pct)} do que poderia gerar, contra ${formatPercent(windRow.curtailment_pct)} da eólica`,
          text: `No último mês, a eólica teve ${formatGWh(windRow.curtailed_mwh)} cortados e a solar, ${formatGWh(solarRow.curtailed_mwh)}.`,
          href: "/comparar",
          action: "Comparar fontes",
        }
      : null,
  ].filter((item) => item !== null);

  return (
    <Container>
      <JsonLd
        data={{
          "@type": "WebSite",
          name: SITE_NAME,
          description: SITE_DESCRIPTION,
          inLanguage: "pt-BR",
          publisher: publisher(),
        }}
      />

      <header className="py-14 sm:py-20">
        <p className="text-accent text-xs font-semibold tracking-[0.14em] uppercase">{SITE_NAME}</p>
        <h1 className="mt-3 max-w-4xl text-4xl leading-[1.05] font-bold tracking-tight text-balance sm:text-6xl">
          {SITE_TAGLINE}
        </h1>
        <p className="text-ink-2 mt-5 max-w-2xl text-lg leading-8">
          Quando a rede não consegue receber toda a energia, o ONS manda usinas eólicas e solares
          reduzirem a produção. Esse corte é energia limpa que existia e foi desperdiçada. O{" "}
          {SITE_NAME} mostra, mês a mês, onde e quanto, usina por usina.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/painel"
            className="bg-accent text-on-accent rounded-full px-5 py-2.5 text-sm font-semibold hover:opacity-90"
          >
            Abrir o painel
          </Link>
          <Link
            href="/relatorios"
            className="border-line bg-surface hover:border-accent hover:bg-accent-soft rounded-full border px-5 py-2.5 text-sm font-semibold"
          >
            Ler os relatórios
          </Link>
        </div>
      </header>

      {latestRow && month ? (
        <Section
          id="numbers"
          title={`O Brasil em ${formatLongMonth(month)}`}
          description="Total nacional (SIN), eólica + solar, no último mês com dados."
          action={
            <Link href="/painel" className="text-accent font-medium hover:underline">
              Ver no painel →
            </Link>
          }
        >
          <StatGrid>
            <StatTile
              highlight
              label="Energia cortada"
              value={formatGWh(latestRow.curtailed_mwh)}
              note="eólica + solar"
            />
            <StatTile
              label="% de corte"
              value={formatPercent(latestRow.curtailment_pct)}
              note="cortada ÷ (gerada + cortada)"
            />
            <StatTile
              label="Perda estimada"
              value={formatBRLCompact(latestRow.estimated_loss_brl)}
              note="estimativa pelo PLD"
            />
            <StatTile
              label="Usinas afetadas"
              value={formatNumber(latestRow.affected_plants, 0)}
              note="com algum corte no mês"
            />
          </StatGrid>
        </Section>
      ) : null}

      {highlights.length > 0 ? (
        <Section
          id="highlights"
          title="Destaques dos dados"
          description="Calculados a cada atualização, a partir dos números oficiais do ONS."
        >
          <ul className="grid gap-4 lg:grid-cols-3">
            {highlights.map((item) => (
              <li key={item.key}>
                <Card className="flex h-full flex-col p-5">
                  <p className="text-accent text-xs font-semibold tracking-wide uppercase">
                    {item.label}
                  </p>
                  <h3 className="mt-2 text-lg leading-snug font-semibold text-balance">
                    {item.title}
                  </h3>
                  {item.text ? (
                    <p className="text-ink-2 mt-2 text-sm leading-6">{item.text}</p>
                  ) : null}
                  <Link
                    href={item.href}
                    className="text-accent mt-auto pt-4 text-sm font-medium hover:underline"
                  >
                    {item.action} →
                  </Link>
                </Card>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      <Section id="features" title="O que você encontra aqui">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <li key={feature.href}>
              <Link href={feature.href} className="block h-full">
                <Card className="hover:border-accent h-full p-5 transition-colors">
                  <h3 className="text-lg font-semibold">{feature.title}</h3>
                  <p className="text-ink-2 mt-1 text-sm leading-6">{feature.text}</p>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="data" title="De onde vêm os dados">
        <p className="text-ink-2 max-w-3xl leading-7">
          Tudo parte dos arquivos públicos de restrição de operação (<em>constrained-off</em>) do
          Operador Nacional do Sistema Elétrico. Processamos os dados todo mês, conferimos os totais
          contra os números oficiais e refazemos os últimos meses quando o ONS revisa uma
          publicação. Os valores em reais são estimativas, calculadas com o preço de referência do
          período.{" "}
          <Link href="/metodologia" className="text-accent font-medium underline">
            Veja a metodologia completa
          </Link>
          .
        </p>
      </Section>

      <div id="newsletter" className="py-6 sm:py-8">
        <NewsletterForm action={subscribeNewsletter} signupSource="landing" />
      </div>
    </Container>
  );
}
