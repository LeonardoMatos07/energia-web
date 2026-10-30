import Link from "next/link";
import { Suspense } from "react";
import { BlockSkeleton } from "@/components/block-skeleton";
import { CurtailmentBlock } from "@/components/blocks/curtailment-block";
import { PldBlock } from "@/components/blocks/market-blocks";
import { NewsBlock } from "@/components/blocks/news-block";
import { BalanceBlock, MixBlock } from "@/components/blocks/system-blocks";
import { StorageBlock } from "@/components/blocks/water-blocks";
import { TodayStrip } from "@/components/today-strip";
import { Container, PageHeader, Section } from "@/components/ui";
import { pageMetadata } from "@/lib/metadata";

export const revalidate = 3600;

export const metadata = pageMetadata({
  title: "Painel do setor elétrico brasileiro",
  description:
    "Carga, geração por fonte, reservatórios, PLD, bandeira tarifária, notícias e curtailment do setor elétrico brasileiro, num só painel com dados abertos oficiais.",
  path: "/painel",
});

const MORE = { className: "text-accent underline" } as const;

export default function OverviewPage() {
  return (
    <Container>
      <PageHeader eyebrow="Painel" title="O setor elétrico brasileiro num só painel">
        Os números que o setor acompanha todo dia, com dados abertos do ONS e da CCEE. Cada bloco
        leva à área com o detalhe.
      </PageHeader>

      <Section id="hoje" title="Hoje no setor">
        <Suspense fallback={<BlockSkeleton height={220} />}>
          <TodayStrip />
        </Suspense>
      </Section>

      <Section
        id="carga"
        title="Carga e geração"
        action={
          <Link href="/sistema" {...MORE}>
            Sistema
          </Link>
        }
      >
        <Suspense fallback={<BlockSkeleton height={460} />}>
          <BalanceBlock />
        </Suspense>
      </Section>

      <Section
        id="matriz"
        title="Matriz elétrica"
        action={
          <Link href="/sistema#matriz" {...MORE}>
            Ver detalhes
          </Link>
        }
      >
        <Suspense fallback={<BlockSkeleton height={420} />}>
          <MixBlock />
        </Suspense>
      </Section>

      <Section
        id="agua"
        title="Reservatórios e afluências"
        action={
          <Link href="/agua" {...MORE}>
            Água
          </Link>
        }
      >
        <Suspense fallback={<BlockSkeleton height={520} />}>
          <StorageBlock />
        </Suspense>
      </Section>

      <Section
        id="preco"
        title="Preço da energia (PLD)"
        action={
          <Link href="/mercado/pld" {...MORE}>
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
          <Link href="/noticias" {...MORE}>
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
