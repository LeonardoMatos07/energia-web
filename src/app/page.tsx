import Link from "next/link";
import { subscribeNewsletter } from "@/app/newsletter/actions";
import { HeroBackdrop, HeroChart } from "@/components/hero-visual";
import { JsonLd } from "@/components/json-ld";
import { NewsletterForm } from "@/components/newsletter-form";
import { Card, Container, Section, StatGrid, StatTile } from "@/components/ui";
import { getSubsystemCurtailment } from "@/lib/api/queries";
import {
  formatBRLCompact,
  formatGWh,
  formatLongMonth,
  formatNumber,
  formatPercent,
  formatShortMonth,
  mwhToGwh,
} from "@/lib/format";
import { pageMetadata } from "@/lib/metadata";
import { latest, normalizeMonth } from "@/lib/series";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE } from "@/lib/site";
import { publisher } from "@/lib/structured-data";

export const revalidate = 3600;

export const metadata = pageMetadata({
  title: `${SITE_NAME}: ${SITE_TAGLINE}`,
  description: SITE_DESCRIPTION,
  path: "/",
});

const HERO_MONTHS = 24;

const INCLUDED = [
  { href: "/painel", title: "Painel", text: "Números do país por período." },
  { href: "/estados", title: "Estados", text: "O corte em cada estado." },
  { href: "/usinas", title: "Usinas", text: "Histórico de cada usina." },
  { href: "/comparar", title: "Comparar", text: "Usinas e estados lado a lado." },
  { href: "/relatorios", title: "Relatórios", text: "Um por mês, desde 2021." },
  { href: "/analises", title: "Análises", text: "Compensação, empresas e horários." },
] as const;

export default async function LandingPage() {
  const total = await getSubsystemCurtailment("total");
  const sinTotal = total.ok ? total.data.items.filter((row) => row.subsystem === "SIN") : [];
  const latestRow = latest(sinTotal);
  const month = latestRow ? normalizeMonth(latestRow.month) : null;
  const heroPoints = sinTotal.slice(-HERO_MONTHS).map((row) => ({
    label: formatShortMonth(row.month),
    value: mwhToGwh(row.curtailed_mwh),
  }));

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
              A energia limpa que{" "}
              <span className="bg-gradient-to-r from-[var(--color-series-1)] to-[var(--color-series-2)] bg-clip-text text-transparent">
                transborda
              </span>{" "}
              da rede
            </h1>
            <p
              className="hero-rise text-ink-2 mt-5 max-w-xl text-lg leading-8"
              style={{ animationDelay: "0.25s" }}
            >
              Quanta energia eólica e solar o Brasil deixa de gerar, mês a mês, usina por usina.
            </p>
            <div
              className="hero-rise mt-8 flex flex-wrap items-center gap-3"
              style={{ animationDelay: "0.4s" }}
            >
              <Link
                href="/cadastro"
                className="bg-accent text-on-accent shadow-card rounded-full px-5 py-2.5 text-sm font-semibold hover:opacity-90"
              >
                Criar conta gratuita
              </Link>
              <Link
                href="/entrar"
                className="border-line bg-surface/80 hover:border-accent hover:bg-accent-soft rounded-full border px-5 py-2.5 text-sm font-semibold backdrop-blur"
              >
                Entrar
              </Link>
            </div>
          </div>
          <div className="hero-rise" style={{ animationDelay: "0.55s" }}>
            <HeroChart
              title="Energia cortada no mês"
              unit="GWh"
              caption="Brasil, eólica + solar, últimos 24 meses."
              points={heroPoints}
            />
          </div>
        </div>
      </header>

      {latestRow && month ? (
        <Section id="numbers" title={`O Brasil em ${formatLongMonth(month)}`}>
          <StatGrid>
            <StatTile
              highlight
              label="Energia cortada"
              value={formatGWh(latestRow.curtailed_mwh)}
            />
            <StatTile label="% de corte" value={formatPercent(latestRow.curtailment_pct)} />
            <StatTile
              label="Perda estimada"
              value={formatBRLCompact(latestRow.estimated_loss_brl)}
            />
            <StatTile label="Usinas afetadas" value={formatNumber(latestRow.affected_plants, 0)} />
          </StatGrid>
        </Section>
      ) : null}

      <Section
        id="included"
        title="Tudo liberado com uma conta gratuita"
        description="Dados oficiais do ONS, metodologia aberta."
      >
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {INCLUDED.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="block h-full">
                <Card className="hover:border-accent h-full px-5 py-4 transition-colors">
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="text-ink-2 mt-0.5 text-sm">{item.text}</p>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2">
          <Link
            href="/cadastro"
            className="bg-accent text-on-accent rounded-full px-5 py-2.5 text-sm font-semibold hover:opacity-90"
          >
            Criar conta gratuita
          </Link>
          <p className="text-muted text-sm">
            Em breve: download de dados, relatórios em PDF e API.
          </p>
        </div>
      </Section>

      <div id="newsletter" className="py-6 sm:py-8">
        <NewsletterForm action={subscribeNewsletter} signupSource="landing" />
      </div>
    </Container>
  );
}
