import { SystemView } from "@/components/views/system-view";
import { pageMetadata } from "@/lib/metadata";

export const dynamic = "force-dynamic";

export const metadata = pageMetadata({
  title: "Sistema Interligado Nacional: carga, geração e intercâmbio",
  description:
    "Carga e geração do SIN hora a hora, matriz elétrica por fonte, intercâmbio entre regiões e despacho térmico, com dados abertos do ONS.",
  path: "/sistema",
  noIndex: true,
});

export default async function SystemPeriodPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <SystemView params={await searchParams} />;
}
