import { DashboardView } from "@/components/views/dashboard-view";
import { pageMetadata } from "@/lib/metadata";
import { SITE_DESCRIPTION } from "@/lib/site";

export const revalidate = 3600;

export const metadata = pageMetadata({
  title: "Painel nacional de curtailment eólico e solar",
  description: SITE_DESCRIPTION,
  path: "/painel",
});

export default function DashboardPage() {
  return <DashboardView params={{}} />;
}
