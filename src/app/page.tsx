import Link from "next/link";
import { subscribeNewsletter } from "@/app/newsletter/actions";
import { JsonLd } from "@/components/json-ld";
import { HeroBackdrop, HeroChart } from "@/components/hero-visual";
import { NewsletterForm } from "@/components/newsletter-form";
import { Card, Container, Section, StatGrid, StatTile } from "@/components/ui";
import { getPlants, getReports, getSubsystemCurtailment } from "@/lib/api/queries";
import type { SubsystemMonthlyCurtailment } from "@/lib/api/types";
import { parseEntities, serializeEntities } from "@/lib/compare";
import {
  formatBRLCompact,
  formatGWh,
  formatLongMonth,
  formatNumber,
  formatPercent,
  formatShortMonth,
  mwhToGwh,
} from "@/lib/format";
import { STATES } from "@/lib/geo";
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

const VALUE_POINTS = [
  {
    title: "Veja onde a energia está sendo perdida",
    text: "Do total nacional até cada usina: histórico mês a mês por estado, subsistema, usina e conjunto eólico ou solar.",
  },
  {
    title: "Saiba quanto isso custa",
    text: "Cada corte vem com a perda estimada em reais, calculada com o preço de referência do período e com a metodologia aberta.",
  },
  {
    title: "Entenda por que foi cortada",
    text: "Separamos a energia cortada por motivo: confiabilidade elétrica, indisponibilidade externa e razão energética.",
  },
  {
    title: "Confie nos números",
    text: "Dados oficiais do ONS, conferidos mês a mês contra os totais publicados. Quando o ONS revisa um mês, nós reprocessamos.",
  },
] as const;

const COMPARE_EXAMPLES = [
  { label: "Bahia × Rio Grande do Norte", refs: "e:BA,e:RN" },
  { label: "Nordeste × Sul", refs: "s:NE,s:S" },
  { label: "Rio Grande do Norte × Brasil", refs: "e:RN,s:SIN" },
] as const;

const HERO_MONTHS = 24;

const COMING_SOON = [
  {
    title: "Download dos dados",
    text: "Baixe as séries mensais por estado, subsistema e usina em planilha, para analisar do seu jeito.",
  },
  {
    title: "Relatórios em PDF",
    text: "Leve o relatório do mês em PDF, pronto para anexar a uma apresentação ou enviar à sua equipe.",
  },
  {
    title: "API para extração de dados",
    text: "Acesse os números direto no seu sistema, sem copiar e colar, com documentação aberta.",
  },
] as const;

const EXPLORE = [
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
    text: "Uma página para cada usina e conjunto, com o histórico completo.",
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

function compareHref(refs: string) {
  return `/comparar?itens=${encodeURIComponent(serializeEntities(parseEntities(refs)))}`;
}

export default async function LandingPage() {
  const [total, wind, solar, reports, plants] = await Promise.all([
    getSubsystemCurtailment("total"),
    getSubsystemCurtailment("wind"),
    getSubsystemCurtailment("solar"),
    getReports(),
    getPlants({ pageSize: 1 }),
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
  const sortedReports = reports.ok
    ? [...reports.data.items].sort((a, b) => b.month.localeCompare(a.month))
    : [];
  const newestReport = sortedReports[0];
  const oldestReport = sortedReports.at(-1);
  const plantCount = plants.ok ? plants.data.total : null;

  const heroPoints = sinTotal.slice(-HERO_MONTHS).map((row) => ({
    label: formatShortMonth(row.month),
    value: mwhToGwh(row.curtailed_mwh),
  }));

  const proof = [
    sinTotal.length > 0 ? { value: String(sinTotal.length), label: "meses de histórico" } : null,
    plantCount ? { value: formatNumber(plantCount, 0), label: "usinas e conjuntos" } : null,
    { value: String(STATES.length), label: "estados" },
    sortedReports.length > 0
      ? { value: String(sortedReports.length), label: "relatórios mensais" }
      : null,
  ].filter((item) => item !== null);

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

      <header className="relative isolate my-6 overflow-hidden rounded-[2rem] border border-[var(--color-grid)] bg-gradient-to-br from-[var(--color-accent-soft)] via-[var(--color-surface)] to-[var(--color-page)] px-6 py-12 sm:my-8 sm:px-10 sm:py-16 lg:px-14 lg:py-20">
        <HeroBackdrop />
        <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <p
              className="hero-rise text-accent text-xs font-semibold tracking-[0.14em] uppercase"
              style={{ animationDelay: "0.05s" }}
            >
              {SITE_NAME} · monitor de curtailment
            </p>
            <h1
              className="hero-rise mt-3 max-w-3xl text-4xl leading-[1.05] font-bold tracking-tight text-balance sm:text-6xl"
              style={{ animationDelay: "0.15s" }}
            >
              A energia limpa que{" "}
              <span className="bg-gradient-to-r from-[var(--color-series-1)] to-[var(--color-series-2)] bg-clip-text text-transparent">
                transborda
              </span>{" "}
              da rede
            </h1>
            <p
              className="hero-rise text-ink-2 mt-5 max-w-xl text-lg leading-8"
              style={{ animationDelay: "0.3s" }}
            >
              Quando a rede não consegue receber toda a energia, o ONS manda usinas eólicas e
              solares reduzirem a produção. Esse corte é energia limpa que existia e foi
              desperdiçada. O {SITE_NAME} mostra, mês a mês, onde e quanto, usina por usina.
            </p>
            <div
              className="hero-rise mt-8 flex flex-wrap items-center gap-3"
              style={{ animationDelay: "0.45s" }}
            >
              <Link
                href="/painel"
                className="bg-accent text-on-accent shadow-card rounded-full px-5 py-2.5 text-sm font-semibold hover:opacity-90"
              >
                Abrir o painel
              </Link>
              <Link
                href="/comparar"
                className="border-line bg-surface/80 hover:border-accent hover:bg-accent-soft rounded-full border px-5 py-2.5 text-sm font-semibold backdrop-blur"
              >
                Comparar usinas e estados
              </Link>
              <span className="text-ink-2 text-sm">
                Gratuito e sem cadastro nesta primeira fase.
              </span>
            </div>
          </div>
          <div className="hero-rise" style={{ animationDelay: "0.6s" }}>
            <HeroChart
              title="Energia cortada no mês"
              unit="GWh"
              caption="Total nacional, eólica + solar, nos últimos 24 meses."
              points={heroPoints}
            />
          </div>
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

      <Section
        id="value"
        title="O que o Spillway entrega nesta primeira fase"
        description="Um monitor público do curtailment eólico e solar do Brasil, feito para quem precisa de números e não de opinião: geradores, investidores, consultorias, jornalistas e quem acompanha o setor."
      >
        {proof.length > 0 ? (
          <dl className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {proof.map((item) => (
              <div key={item.label} className="border-grid bg-surface rounded-2xl border p-4">
                <dd className="font-display text-accent text-3xl font-bold tracking-tight">
                  {item.value}
                </dd>
                <dt className="text-ink-2 mt-1 text-sm">{item.label}</dt>
              </div>
            ))}
          </dl>
        ) : null}
        <ul className="grid gap-4 sm:grid-cols-2">
          {VALUE_POINTS.map((point) => (
            <li key={point.title}>
              <Card className="h-full p-5">
                <h3 className="text-lg font-semibold">{point.title}</h3>
                <p className="text-ink-2 mt-1 text-sm leading-6">{point.text}</p>
              </Card>
            </li>
          ))}
        </ul>
      </Section>

      <section
        aria-label="Comparar e relatórios"
        className="grid gap-4 py-6 sm:py-8 lg:grid-cols-2"
      >
        <div className="bg-accent text-on-accent flex flex-col rounded-2xl p-6 sm:p-8">
          <p className="text-xs font-semibold tracking-[0.14em] uppercase opacity-85">Comparar</p>
          <h2 className="mt-2 text-2xl leading-tight font-bold tracking-tight text-balance sm:text-3xl">
            Qual usina perde mais? Qual estado sofre mais?
          </h2>
          <p className="mt-3 leading-7 opacity-90">
            Coloque até 6 usinas, estados ou subsistemas lado a lado, escolha o que medir (geração,
            energia cortada, perda em R$ ou % de corte) e veja em linhas, barras ou pizza. O link
            guarda tudo: é só compartilhar.
          </p>
          <ul className="mt-4 flex flex-wrap gap-2" aria-label="Exemplos de comparação">
            {COMPARE_EXAMPLES.map((example) => (
              <li key={example.refs}>
                <Link
                  href={compareHref(example.refs)}
                  className="inline-block rounded-full border border-current/40 px-3 py-1.5 text-sm font-medium hover:bg-white/15"
                >
                  {example.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/comparar"
            className="bg-surface text-accent-strong mt-auto self-start rounded-full px-5 py-2.5 text-sm font-semibold hover:opacity-90"
            style={{ marginTop: "1.5rem" }}
          >
            Comparar agora
          </Link>
        </div>

        <div className="border-grid bg-surface shadow-card flex flex-col rounded-2xl border p-6 sm:p-8">
          <p className="text-accent text-xs font-semibold tracking-[0.14em] uppercase">
            Relatórios
          </p>
          <h2 className="mt-2 text-2xl leading-tight font-bold tracking-tight text-balance sm:text-3xl">
            Um relatório pronto para cada mês
          </h2>
          <p className="text-ink-2 mt-3 leading-7">
            O que mudou, onde os cortes se concentraram e por quê, com o ranking dos estados e das
            usinas mais afetadas.
            {oldestReport && newestReport
              ? ` Já são ${sortedReports.length} relatórios, de ${formatShortMonth(oldestReport.month)} a ${formatShortMonth(newestReport.month)}.`
              : null}{" "}
            Leia no portal e receba o próximo por e-mail.
          </p>
          {newestReport ? (
            <Link
              href={`/relatorios/${newestReport.slug}`}
              className="border-line hover:border-accent hover:bg-accent-soft mt-4 block rounded-xl border p-4"
            >
              <span className="text-accent block text-xs font-semibold tracking-wide uppercase">
                Mais recente
              </span>
              <span className="mt-1 block font-semibold">{newestReport.title}</span>
            </Link>
          ) : null}
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/relatorios"
              className="bg-accent text-on-accent rounded-full px-5 py-2.5 text-sm font-semibold hover:opacity-90"
            >
              Ler os relatórios
            </Link>
            <Link
              href="#newsletter"
              className="border-line hover:border-accent hover:bg-accent-soft rounded-full border px-5 py-2.5 text-sm font-semibold"
            >
              Receber por e-mail
            </Link>
          </div>
        </div>
      </section>

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

      <Section id="explore" title="Explore o resto do site">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {EXPLORE.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="block h-full">
                <Card className="hover:border-accent h-full p-5 transition-colors">
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <p className="text-ink-2 mt-1 text-sm leading-6">{item.text}</p>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      <Section
        id="coming-soon"
        title="Em breve"
        description="O que estamos preparando para as próximas etapas."
      >
        <ul className="grid gap-4 sm:grid-cols-3">
          {COMING_SOON.map((item) => (
            <li key={item.title}>
              <Card className="border-line h-full border-dashed p-5">
                <span className="bg-accent-soft text-accent-strong inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold">
                  Em breve
                </span>
                <h3 className="mt-3 text-lg font-semibold">{item.title}</h3>
                <p className="text-ink-2 mt-1 text-sm leading-6">{item.text}</p>
              </Card>
            </li>
          ))}
        </ul>
        <p className="text-ink-2 mt-4 text-sm">
          Quer acompanhar?{" "}
          <Link href="#newsletter" className="text-accent font-medium underline">
            Assine o resumo mensal
          </Link>
          .
        </p>
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
