import { SystemView } from "@/components/views/system-view";
import { pageMetadata } from "@/lib/metadata";

export const revalidate = 3600;

export const metadata = pageMetadata({
  title: "Sistema Interligado Nacional: carga, geração e intercâmbio",
  description:
    "Carga e geração do SIN hora a hora, matriz elétrica por fonte, intercâmbio entre regiões e despacho térmico, com dados abertos do ONS.",
  path: "/sistema",
});

export default function SystemPage() {
  return <SystemView params={{}} />;
}
