import Link from "next/link";
import { Suspense } from "react";
import { BlockSkeleton } from "@/components/block-skeleton";
import { NewsBlock } from "@/components/blocks/news-block";
import { GenerationMixPie } from "@/components/generation-mix-pie";
import { HeroBackdrop, HeroChart, type HeroPoint } from "@/components/hero-visual";
import { JsonLd } from "@/components/json-ld";
import { MemberNewsletter } from "@/components/member-newsletter";
import { TodayStrip } from "@/components/today-strip";
import { ToolCard } from "@/components/tool-card";
import { Card, Container, Section } from "@/components/ui";
import { getGenerationMix, getSubsystemCurtailment } from "@/lib/api/queries";
import { formatPercent, formatShortMonth, mwhToGwh } from "@/lib/format";
import { pageMetadata } from "@/lib/metadata";
import { getCurrentMember } from "@/lib/members";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";
import { publisher } from "@/lib/structured-data";
import { latestRenewableShare, sinMonthlyTotals } from "@/lib/system";
import { TOOLS } from "@/lib/tools";

// The home tab shows only the site name (not "%s | name").
export const metadata = {
  ...pageMetadata({ title: SITE_NAME, description: SITE_DESCRIPTION, path: "/" }),
  title: { absolute: SITE_NAME },
};

const HERO_MONTHS = 24;

const AREAS = [
  {
    href: "/sistema",
    title: "Sistema",
    text: "Carga, geração por fonte, intercâmbio e térmicas, hora a hora.",
  },
  {
    href: "/agua",
    title: "Água",
    text: "Reservatórios, afluências e a energia que vira vertimento.",
  },
  {
    href: "/mercado/pld",
    title: "Mercado",
    text: "PLD, mercado livre, bandeiras tarifárias e qualidade do fornecimento.",
  },
  {
    href: "/curtailment",
    title: "Curtailment",
    text: "Quanta energia eólica e solar é cortada, por estado e por usina.",
  },
  {
    href: "/noticias",
    title: "Notícias",
    text: "O que ONS, ANEEL, CCEE e o governo publicam, com fonte e licença.",
  },
  {
    href: "/relatorios",
    title: "Relatórios",
    text: "Um relatório por mês de curtailment, desde 2021.",
  },
] as const;

export default async function LandingPage() {
  const [mix, member] = await Promise.all([getGenerationMix(), getCurrentMember()]);

  // Hero: SIN generation per month; if the mix is unavailable, fall back to curtailment.
  let heroPoints: HeroPoint[] = [];
  let hero = {
    title: "Geração de energia no SIN, por mês",
    unit: "TWh",
    caption: "Brasil, todas as fontes, últimos 24 meses.",
    digits: 1,
    fit: true,
  };
  if (mix.ok) {
    heroPoints = sinMonthlyTotals(mix.data.points)
      .slice(-HERO_MONTHS)
      .map((row) => ({ label: formatShortMonth(row.month), value: row.energy_mwh / 1_000_000 }));
  }
  if (heroPoints.length < 2) {
    const total = await getSubsystemCurtailment("total");
    const sin = total.ok ? total.data.items.filter((row) => row.subsystem === "SIN") : [];
    heroPoints = sin.slice(-HERO_MONTHS).map((row) => ({
      label: formatShortMonth(row.month),
      value: mwhToGwh(row.curtailed_mwh),
    }));
    hero = {
      title: "Energia cortada no mês",
      unit: "GWh",
      caption: "Brasil, eólica + solar, últimos 24 meses.",
      digits: 1,
      fit: false,
    };
  }
  const renewable = mix.ok ? latestRenewableShare(mix.data.points) : null;

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
            <h1
              className="hero-rise max-w-3xl text-4xl leading-[1.05] font-bold tracking-tight text-balance sm:text-6xl"
              style={{ animationDelay: "0.1s" }}
            >
              O setor elétrico brasileiro,{" "}
              <span className="bg-gradient-to-r from-[var(--color-series-1)] to-[var(--color-series-2)] bg-clip-text text-transparent">
                em movimento
              </span>
            </h1>
            <p
              className="hero-rise text-ink-2 mt-5 max-w-xl text-lg leading-8"
              style={{ animationDelay: "0.25s" }}
            >
              Geração, reservatórios, preços, notícias e curtailment, com dados oficiais, num só
              lugar.
            </p>
            <div
              className="hero-rise mt-8 flex flex-wrap items-center gap-3"
              style={{ animationDelay: "0.4s" }}
            >
              <Link
                href="/painel"
                data-track="landing.hero_panel"
                className="bg-accent text-on-accent shadow-card rounded-full px-5 py-2.5 text-sm font-semibold hover:opacity-90"
              >
                Explorar o Painel
              </Link>
              {member ? (
                <MemberNewsletter enabled={member.marketing_opt_in} />
              ) : (
                <Link
                  href="/cadastro"
                  data-track="landing.hero_signup"
                  className="border-line bg-surface/80 hover:border-accent hover:bg-accent-soft rounded-full border px-5 py-2.5 text-sm font-semibold backdrop-blur"
                >
                  Criar conta gratuita
                </Link>
              )}
            </div>
          </div>
          <div className="hero-rise" style={{ animationDelay: "0.55s" }}>
            <HeroChart
              title={hero.title}
              unit={hero.unit}
              caption={hero.caption}
              points={heroPoints}
              digits={hero.digits}
              fit={hero.fit}
            />
          </div>
        </div>
      </header>

      <Section
        id="hoje"
        title="Hoje no setor"
        description="Os números que se acompanha todo dia, do preço da energia ao curtailment."
      >
        <Suspense fallback={<BlockSkeleton height={220} />}>
          <TodayStrip />
        </Suspense>
      </Section>

      {mix.ok && mix.data.points.length > 0 ? (
        <Section
          id="matriz"
          title="A matriz elétrica brasileira"
          action={
            <Link href="/sistema#matriz" className="text-accent underline">
              Ver a matriz mês a mês
            </Link>
          }
        >
          <Card className="p-6 sm:p-8">
            <GenerationMixPie points={mix.data.points} />
            {renewable ? (
              <p className="text-ink mt-6 text-sm font-semibold">
                {formatPercent(renewable.pct, 0)} da geração do último mês veio de fontes renováveis
                (hidro, eólica e solar).
              </p>
            ) : null}
            <p className="text-muted mt-2 text-xs leading-5">
              Participação de cada fonte na geração do Sistema Interligado Nacional no último mês
              disponível. Fonte: ONS, dados abertos (geração por fonte).
            </p>
          </Card>
        </Section>
      ) : null}

      <Section id="areas" title="Explore por área">
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {AREAS.map((area) => (
            <li key={area.href}>
              <Link
                href={area.href}
                data-track={`landing.area.${area.title.toLowerCase()}`}
                className="block h-full"
              >
                <Card className="hover:border-accent h-full px-5 py-4 transition-colors">
                  <h3 className="font-semibold">{area.title}</h3>
                  <p className="text-ink-2 mt-0.5 text-sm">{area.text}</p>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      <Section
        id="ferramentas"
        title="Ferramentas"
        description="Gratuitas, direto no navegador. Simuladores e mapa da rede estão a caminho."
        action={
          <Link href="/ferramentas" className="text-accent underline">
            Todas as ferramentas
          </Link>
        }
      >
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TOOLS.map((tool) => (
            <li key={tool.href}>
              <ToolCard tool={tool} />
            </li>
          ))}
        </ul>
      </Section>

      <Section
        id="noticias"
        title="Últimas notícias"
        action={
          <Link href="/noticias" className="text-accent underline">
            Todas as notícias
          </Link>
        }
      >
        <Suspense fallback={<BlockSkeleton height={300} />}>
          <NewsBlock limit={4} />
        </Suspense>
      </Section>

      {member ? null : (
        <Section
          id="conta"
          title="Tudo liberado com uma conta gratuita"
          description="Dados oficiais do ONS, metodologia aberta."
        >
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link
              href="/cadastro"
              data-track="landing.bottom_signup"
              className="bg-accent text-on-accent rounded-full px-5 py-2.5 text-sm font-semibold hover:opacity-90"
            >
              Criar conta gratuita
            </Link>
            <p className="text-muted text-sm">
              Inclui o detalhe do curtailment por estado e usina, a previsão e o download dos dados
              em Excel e CSV e dos relatórios e análises em PDF.
            </p>
          </div>
        </Section>
      )}
    </Container>
  );
}
