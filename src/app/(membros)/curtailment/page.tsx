import { HeroChart } from "@/components/hero-visual";
import { DashboardView } from "@/components/views/dashboard-view";
import { Container } from "@/components/ui";
import { getSubsystemCurtailment } from "@/lib/api/queries";
import { formatShortMonth, mwhToGwh } from "@/lib/format";
import { pageMetadata } from "@/lib/metadata";
import { SITE_DESCRIPTION } from "@/lib/site";

export const revalidate = 3600;

const CHART_MONTHS = 24;

export const metadata = pageMetadata({
  title: "Painel nacional de curtailment eólico e solar",
  description: SITE_DESCRIPTION,
  path: "/curtailment",
});

export default async function CurtailmentPage() {
  const total = await getSubsystemCurtailment("total");
  const points = total.ok
    ? total.data.items
        .filter((row) => row.subsystem === "SIN")
        .slice(-CHART_MONTHS)
        .map((row) => ({ label: formatShortMonth(row.month), value: mwhToGwh(row.curtailed_mwh) }))
    : [];

  return (
    <>
      {points.length > 1 ? (
        <Container>
          <div className="mx-auto mt-6 max-w-3xl">
            <HeroChart
              title="Energia cortada no mês"
              unit="GWh"
              caption="Brasil, eólica + solar, últimos 24 meses."
              points={points}
            />
          </div>
        </Container>
      ) : null}
      <DashboardView params={{}} />
    </>
  );
}
