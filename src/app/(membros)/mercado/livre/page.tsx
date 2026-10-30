import { MonthlyChart } from "@/components/charts/monthly-chart";
import { DataAttribution } from "@/components/data-attribution";
import { Card, Container, DataUnavailable, PageHeader, Section } from "@/components/ui";
import { getMarketConsumption } from "@/lib/api/queries";
import { formatNumber, formatPercent, formatShortMonth } from "@/lib/format";
import { toMonth } from "@/lib/market";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Mercado livre de energia",
  description:
    "Quanto da energia é consumida no mercado livre e no regulado, e quantos agentes há por classe, segundo a CCEE.",
  path: "/mercado/livre",
  noIndex: true,
});

export default async function FreeMarketPage() {
  const result = await getMarketConsumption();
  if (!result.ok) {
    return (
      <Container>
        <DataUnavailable />
      </Container>
    );
  }
  const { consumption, agents, source } = result.data;
  const latestMonth = agents.length ? agents[agents.length - 1]?.month : undefined;
  const latestAgents = agents.filter((item) => item.month === latestMonth);
  const last = consumption[consumption.length - 1];
  return (
    <Container>
      <PageHeader eyebrow="Mercado" title="Mercado livre e mercado regulado">
        <p>
          No mercado regulado (ACR) a distribuidora fornece a energia. No livre (ACL) o consumidor
          negocia com quem quiser.
          {last
            ? ` Em ${formatShortMonth(toMonth(last.month))}, o mercado livre respondeu por ${formatPercent(last.free_share_pct)} do consumo.`
            : ""}
        </p>
      </PageHeader>
      <Section id="consumo" title="Consumo por ambiente (MW médios)">
        <MonthlyChart
          title="Consumo no mercado regulado e no livre"
          rows={consumption.map((item) => ({
            month: toMonth(item.month),
            regulado: item.regulated_mw_avg,
            livre: item.free_mw_avg,
          }))}
          series={[
            { key: "regulado", label: "Regulado (ACR)", color: "var(--color-series-2)" },
            { key: "livre", label: "Livre (ACL)", color: "var(--color-series-1)" },
          ]}
          unit="MW médios"
          kind="stacked-bar"
          digits={0}
        />
        <DataAttribution source={source} />
      </Section>
      <Section
        id="agentes"
        title={`Agentes por classe em ${formatShortMonth(toMonth(latestMonth ?? ""))}`}
      >
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[360px] text-sm">
            <caption className="sr-only">Quantidade de agentes por classe</caption>
            <thead className="bg-surface-2 text-ink-2 text-left">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">
                  Classe
                </th>
                <th scope="col" className="px-4 py-3 text-right font-medium">
                  Agentes
                </th>
              </tr>
            </thead>
            <tbody className="tabular">
              {latestAgents.map((item) => (
                <tr key={item.agent_class} className="border-grid border-t">
                  <th scope="row" className="px-4 py-2.5 text-left font-medium">
                    {item.agent_class}
                  </th>
                  <td className="px-4 py-2.5 text-right">{formatNumber(item.agents, 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
        <p className="text-muted mt-3 max-w-3xl text-xs leading-5">
          São contagens do mercado todo por classe. Não mostramos dados de empresas individuais.
        </p>
        <DataAttribution source={source} />
      </Section>
    </Container>
  );
}
