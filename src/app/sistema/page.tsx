import Link from "next/link";
import { Suspense } from "react";
import { BlockSkeleton } from "@/components/block-skeleton";
import {
  BalanceBlock,
  InterchangeBlock,
  MixBlock,
  ThermalBlock,
} from "@/components/blocks/system-blocks";
import { Container, PageHeader, Section } from "@/components/ui";
import { pageMetadata } from "@/lib/metadata";

export const revalidate = 3600;

export const metadata = pageMetadata({
  title: "Sistema Interligado Nacional: carga, geração e intercâmbio",
  description:
    "Carga e geração do SIN hora a hora, matriz elétrica por fonte, intercâmbio entre regiões e despacho térmico, com dados abertos do ONS.",
  path: "/sistema",
});

export default function SystemPage() {
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

      <Section
        id="carga"
        title="Carga e geração"
        description="Últimos 7 dias com dados, somando os quatro subsistemas."
      >
        <Suspense fallback={<BlockSkeleton height={460} />}>
          <BalanceBlock />
        </Suspense>
      </Section>

      <Section id="matriz" title="Matriz elétrica" description="De onde vem a energia, mês a mês.">
        <Suspense fallback={<BlockSkeleton height={420} />}>
          <MixBlock />
        </Suspense>
      </Section>

      <div className="grid gap-x-8 lg:grid-cols-2">
        <Section id="intercambio" title="Intercâmbio entre regiões">
          <Suspense fallback={<BlockSkeleton height={260} />}>
            <InterchangeBlock />
          </Suspense>
        </Section>
        <Section id="termicas" title="Despacho térmico">
          <Suspense fallback={<BlockSkeleton height={260} />}>
            <ThermalBlock />
          </Suspense>
        </Section>
      </div>
    </Container>
  );
}
