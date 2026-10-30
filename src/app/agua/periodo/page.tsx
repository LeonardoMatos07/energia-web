import { WaterView } from "@/components/views/water-view";
import { pageMetadata } from "@/lib/metadata";

export const dynamic = "force-dynamic";

export const metadata = pageMetadata({
  title: "Água: reservatórios, vazões e energia vertida",
  description:
    "Nível dos reservatórios (energia armazenada) e energia natural afluente por subsistema, os maiores reservatórios e as usinas que mais vertem, com dados abertos do ONS.",
  path: "/agua",
  noIndex: true,
});

export default async function WaterPeriodPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <WaterView params={await searchParams} />;
}
