import { WaterView } from "@/components/views/water-view";
import { pageMetadata } from "@/lib/metadata";

export const revalidate = 3600;

export const metadata = pageMetadata({
  title: "Água: reservatórios, vazões e energia vertida",
  description:
    "Nível dos reservatórios (energia armazenada) e energia natural afluente por subsistema, os maiores reservatórios e as usinas que mais vertem, com dados abertos do ONS.",
  path: "/agua",
});

export default function WaterPage() {
  return <WaterView params={{}} />;
}
