import Link from "next/link";
import { HeroBackdrop, HeroChart } from "@/components/hero-visual";
import { MemberNewsletter } from "@/components/member-newsletter";
import { Card, Container, Section, StatGrid, StatTile } from "@/components/ui";
import { DashboardView } from "@/components/views/dashboard-view";
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
import { getCurrentMember } from "@/lib/members";
import { latest, normalizeMonth } from "@/lib/series";
import { SITE_DESCRIPTION } from "@/lib/site";

export const revalidate = 3600;

const HERO_MONTHS = 24;

export const metadata = pageMetadata({
  title: "Painel nacional de curtailment eólico e solar",
  description: SITE_DESCRIPTION,
  path: "/curtailment",
});

const SECTIONS = [
  { href: "/estados", title: "Estados e usinas", text: "Onde o corte acontece, lado a lado." },
  { href: "/previsao", title: "Previsão", text: "Risco de corte hora a hora na próxima semana." },
  { href: "/analises", title: "Análises", text: "Compensação, empresas, horários e previsão." },
  { href: "/relatorios", title: "Relatórios", text: "Um por mês, desde 2021." },
] as const;

export default async function CurtailmentPage() {
  const [total, member] = await Promise.all([getSubsystemCurtailment("total"), getCurrentMember()]);
  const sinTotal = total.ok ? total.data.items.filter((row) => row.subsystem === "SIN") : [];
  const latestRow = latest(sinTotal);
  const month = latestRow ? normalizeMonth(latestRow.month) : null;
  const heroPoints = sinTotal.slice(-HERO_MONTHS).map((row) => ({
    label: formatShortMonth(row.month),
    value: mwhToGwh(row.curtailed_mwh),
  }));

  return (
    <>
      <Container>
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
              {member ? (
                <div
                  className="hero-rise mt-8 flex flex-wrap items-center gap-3"
                  style={{ animationDelay: "0.4s" }}
                >
                  <MemberNewsletter enabled={member.marketing_opt_in} />
                </div>
              ) : null}
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
              <StatTile
                label="Usinas afetadas"
                value={formatNumber(latestRow.affected_plants, 0)}
              />
            </StatGrid>
          </Section>
        ) : null}

        <Section
          id="areas"
          title="Tudo sobre curtailment"
          description="Dados oficiais do ONS, metodologia aberta."
        >
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {SECTIONS.map((item) => (
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
        </Section>
      </Container>
      <DashboardView params={{}} />
    </>
  );
}
