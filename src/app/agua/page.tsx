import { Suspense } from "react";
import { BlockSkeleton } from "@/components/block-skeleton";
import { ReservoirsBlock, SpilledBlock, StorageBlock } from "@/components/blocks/water-blocks";
import { Container, PageHeader, Section } from "@/components/ui";
import { pageMetadata } from "@/lib/metadata";

export const revalidate = 3600;

export const metadata = pageMetadata({
  title: "Água: reservatórios, vazões e energia vertida",
  description:
    "Nível dos reservatórios (energia armazenada) e energia natural afluente por subsistema, os maiores reservatórios e as usinas que mais vertem, com dados abertos do ONS.",
  path: "/agua",
});

export default function WaterPage() {
  return (
    <Container>
      <PageHeader eyebrow="Água" title="Reservatórios, vazões e energia vertida">
        A maior parte da eletricidade do Brasil vem da água. Aqui está quanto estoque os
        reservatórios guardam, quanta água chega e onde ela passa sem virar energia.
      </PageHeader>

      <Section
        id="armazenamento"
        title="Armazenamento e afluência"
        description="Por subsistema, no último ano."
      >
        <Suspense fallback={<BlockSkeleton height={520} />}>
          <StorageBlock />
        </Suspense>
      </Section>

      <div className="grid gap-x-8 lg:grid-cols-2">
        <Section id="reservatorios" title="Maiores reservatórios">
          <Suspense fallback={<BlockSkeleton height={420} />}>
            <ReservoirsBlock />
          </Suspense>
        </Section>
        <Section id="vertimento" title="Energia vertida">
          <Suspense fallback={<BlockSkeleton height={420} />}>
            <SpilledBlock />
          </Suspense>
        </Section>
      </div>
    </Container>
  );
}
