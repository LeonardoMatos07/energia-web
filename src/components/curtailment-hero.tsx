import { HeroBackdrop, HeroChart, type HeroPoint } from "@/components/hero-visual";
import { MemberNewsletter } from "@/components/member-newsletter";

/** Opening of the Curtailment area: the message, the animated chart and the e-mail opt-in. */
export function CurtailmentHero({
  points,
  newsletterEnabled,
}: {
  points: readonly HeroPoint[];
  /** `undefined` when nobody is logged in (no opt-in is shown). */
  newsletterEnabled: boolean | undefined;
}) {
  return (
    <section className="relative isolate my-6 overflow-hidden rounded-[2rem] border border-[var(--color-grid)] bg-gradient-to-br from-[var(--color-accent-soft)] via-[var(--color-surface)] to-[var(--color-page)] px-6 py-12 sm:my-8 sm:px-10 sm:py-16 lg:px-14 lg:py-20">
      <HeroBackdrop />
      <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <p className="text-accent text-xs font-semibold tracking-[0.14em] uppercase">
            Área Curtailment
          </p>
          <h1
            className="hero-rise mt-2 max-w-3xl text-4xl leading-[1.05] font-bold tracking-tight text-balance sm:text-6xl"
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
          {newsletterEnabled !== undefined ? (
            <div
              className="hero-rise mt-8 flex flex-wrap items-center gap-3"
              style={{ animationDelay: "0.4s" }}
            >
              <MemberNewsletter enabled={newsletterEnabled} />
            </div>
          ) : null}
        </div>
        <div className="hero-rise" style={{ animationDelay: "0.55s" }}>
          <HeroChart
            title="Energia cortada no mês"
            unit="GWh"
            caption="Brasil, eólica + solar, últimos 24 meses."
            points={points}
          />
        </div>
      </div>
    </section>
  );
}
