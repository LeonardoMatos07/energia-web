import Link from "next/link";
import { Suspense } from "react";
import { BlockSkeleton } from "@/components/block-skeleton";
import { PldBlock } from "@/components/blocks/market-blocks";
import {
  InterchangeSummary,
  PeaksSummary,
  SystemSummary,
  WaterSummary,
} from "@/components/blocks/summary-blocks";
import { Container, PageHeader, Section } from "@/components/ui";
import { pageMetadata } from "@/lib/metadata";

export const revalidate = 3600;

export const metadata = pageMetadata({
  title: "Painel do setor elétrico brasileiro",
  description:
    "Resumo analítico do setor elétrico brasileiro: carga, fonte líder, picos de geração, reservatórios, intercâmbio e preço da energia, com dados abertos oficiais.",
  path: "/painel",
});

export default function OverviewPage() {
  return (
    <Container>
      <PageHeader eyebrow="Painel" title="O setor elétrico brasileiro em resumo">
        Um resumo analítico, com dados abertos do ONS e da CCEE: carga, geração, água, intercâmbio e
        preço. A vitrine do dia, com a matriz elétrica e as notícias, está na{" "}
        <Link href="/" className="text-accent underline">
          página inicial
        </Link>
        ; o detalhe, em Sistema e Água.
      </PageHeader>

      <Section id="sistema" title="Sistema em resumo" description="Carga, renovável e fonte líder.">
        <Suspense fallback={<BlockSkeleton height={140} />}>
          <SystemSummary />
        </Suspense>
      </Section>

      <Section
        id="picos"
        title="Picos de geração"
        description="A maior potência instantânea de cada fonte no último mês."
      >
        <Suspense fallback={<BlockSkeleton height={140} />}>
          <PeaksSummary />
        </Suspense>
      </Section>

      <Section
        id="agua"
        title="Água em resumo"
        description="Energia armazenada (EAR) e afluência (ENA) por subsistema."
      >
        <Suspense fallback={<BlockSkeleton height={140} />}>
          <WaterSummary />
        </Suspense>
      </Section>

      <Section id="intercambio" title="Intercâmbio entre regiões">
        <Suspense fallback={<BlockSkeleton height={220} />}>
          <InterchangeSummary />
        </Suspense>
      </Section>

      <Section
        id="preco"
        title="Preço da energia (PLD)"
        action={
          <Link href="/mercado/pld" className="text-accent underline">
            Mercado
          </Link>
        }
      >
        <Suspense fallback={<BlockSkeleton height={380} />}>
          <PldBlock />
        </Suspense>
      </Section>
    </Container>
  );
}
