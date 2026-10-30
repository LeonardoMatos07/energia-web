import { DashboardView } from "@/components/views/dashboard-view";
import { pageMetadata } from "@/lib/metadata";
import { CURTAILMENT_DESCRIPTION } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata = pageMetadata({
  title: "Painel nacional de curtailment eólico e solar",
  description: CURTAILMENT_DESCRIPTION,
  path: "/curtailment",
  noIndex: true,
});

export default async function DashboardPeriodPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <DashboardView params={await searchParams} />;
}
