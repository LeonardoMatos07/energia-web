import Link from "next/link";
import { Suspense } from "react";
import { BlockSkeleton } from "@/components/block-skeleton";
import { CurtailmentBlock } from "@/components/blocks/curtailment-block";
import { PldBlock } from "@/components/blocks/market-blocks";
import { NewsBlock } from "@/components/blocks/news-block";
import { SystemSummary, WaterSummary } from "@/components/blocks/summary-blocks";
import { TodayStrip } from "@/components/today-strip";
import { Container, PageHeader, Section } from "@/components/ui";
import { pageMetadata } from "@/lib/metadata";

export const revalidate = 3600;

export const metadata = pageMetadata({
  title: "Painel do setor elétrico brasileiro",
  description:
    "Resumo do setor elétrico brasileiro: carga, fonte líder, reservatórios, PLD, bandeira tarifária, notícias e curtailment, com dados abertos oficiais.",
  path: "/painel",
});

const LINK = "text-accent underline";

export default function OverviewPage() {
  return (
    <Container>
      <PageHeader eyebrow="Painel" title="O setor elétrico brasileiro em resumo">
        Os números que o setor acompanha todo dia, com dados abertos do ONS e da CCEE. A matriz
        elétrica está na página inicial e o detalhe, em Sistema e Água.
      </PageHeader>

      <Section id="hoje" title="Hoje no setor">
        <Suspense fallback={<BlockSkeleton height={220} />}>
          <TodayStrip />
        </Suspense>
      </Section>

      <Section id="sistema" title="Sistema em resumo" description="Carga, renovável e fonte líder.">
        <Suspense fallback={<BlockSkeleton height={140} />}>
          <SystemSummary />
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

      <Section
        id="preco"
        title="Preço da energia (PLD)"
        action={
          <Link href="/mercado/pld" className={LINK}>
            Mercado
          </Link>
        }
      >
        <Suspense fallback={<BlockSkeleton height={380} />}>
          <PldBlock />
        </Suspense>
      </Section>

      <Section
        id="curtailment"
        title="Curtailment"
        description="Energia eólica e solar que o ONS mandou cortar."
      >
        <Suspense fallback={<BlockSkeleton height={120} />}>
          <CurtailmentBlock />
        </Suspense>
      </Section>

      <Section
        id="noticias"
        title="Últimas notícias"
        action={
          <Link href="/noticias" className={LINK}>
            Todas as notícias
          </Link>
        }
      >
        <Suspense fallback={<BlockSkeleton height={300} />}>
          <NewsBlock />
        </Suspense>
      </Section>
    </Container>
  );
}
