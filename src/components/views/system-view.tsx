import Link from "next/link";
import { Suspense } from "react";
import { AreaFilters } from "@/components/area-filters";
import { BlockSkeleton } from "@/components/block-skeleton";
import {
  BalanceBlock,
  InterchangeBlock,
  MixBlock,
  ThermalBlock,
} from "@/components/blocks/system-blocks";
import { Container, PageHeader, Section } from "@/components/ui";
import {
  balancePlan,
  currentMonth,
  FIRST_MONTH,
  MAX_DAILY_MONTHS,
  parseFilters,
  type SearchParams,
} from "@/lib/filters";

/**
 * The Sistema page for a set of search params (?de=&ate=&sub=). /sistema renders it statically
 * with no params; /sistema/periodo (reached by the middleware rewrite) renders it per request.
 */
export function SystemView({ params }: { params: SearchParams }) {
  const filters = parseFilters(params, FIRST_MONTH, currentMonth());
  const plan = balancePlan(filters);
  const key = `${filters.start}|${filters.end}|${filters.sub}`;
  const balanceNote =
    plan.kind === "recent"
      ? "Últimos 7 dias com dados, hora a hora."
      : plan.kind === "hourly"
        ? "Um mês, hora a hora."
        : `Média diária; mostra no máximo os últimos ${MAX_DAILY_MONTHS} meses do período.`;

  return (
    <Container>
      <PageHeader eyebrow="Sistema" title="O Sistema Interligado Nacional, hora a hora">
        Quanto o Brasil consome, quem gera essa energia, como ela circula entre as regiões e quais
        térmicas são ligadas, com dados abertos do ONS. Para o corte de geração eólica e solar, veja
        a área{" "}
        <Link href="/curtailment" className="text-accent underline">
          Curtailment
        </Link>
        .
      </PageHeader>

      <AreaFilters
        first={FIRST_MONTH}
        last={currentMonth()}
        start={filters.start}
        end={filters.end}
        sub={filters.sub}
        note="O período vale para a matriz, o intercâmbio e as térmicas. A carga e geração seguem a regra abaixo do título do bloco."
      />

      <Section id="carga" title="Carga e geração" description={balanceNote}>
        <Suspense key={key} fallback={<BlockSkeleton height={460} />}>
          <BalanceBlock filters={filters} />
        </Suspense>
      </Section>

      <Section id="matriz" title="Matriz elétrica" description="De onde vem a energia, mês a mês.">
        <Suspense key={key} fallback={<BlockSkeleton height={420} />}>
          <MixBlock filters={filters} />
        </Suspense>
      </Section>

      <div className="grid gap-x-8 lg:grid-cols-2">
        <Section id="intercambio" title="Intercâmbio entre regiões">
          <Suspense key={key} fallback={<BlockSkeleton height={260} />}>
            <InterchangeBlock filters={filters} />
          </Suspense>
        </Section>
        <Section id="termicas" title="Despacho térmico">
          <Suspense key={key} fallback={<BlockSkeleton height={260} />}>
            <ThermalBlock filters={filters} />
          </Suspense>
        </Section>
      </div>
    </Container>
  );
}
