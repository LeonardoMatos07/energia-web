import { DashboardView } from "@/components/views/dashboard-view";
import { pageMetadata } from "@/lib/metadata";
import { CURTAILMENT_DESCRIPTION } from "@/lib/site";

export const revalidate = 3600;

export const metadata = pageMetadata({
  title: "Painel nacional de curtailment eólico e solar",
  description: CURTAILMENT_DESCRIPTION,
  path: "/curtailment",
});

export default function CurtailmentPage() {
  return <DashboardView params={{}} />;
}
