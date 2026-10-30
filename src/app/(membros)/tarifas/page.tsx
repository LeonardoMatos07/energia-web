import { MonthlyChart } from "@/components/charts/monthly-chart";
import { DataAttribution } from "@/components/data-attribution";
import { Card, Container, DataUnavailable, Notice, PageHeader, Section } from "@/components/ui";
import { getTariffFlags } from "@/lib/api/queries";
import { formatBRL, formatLongMonth } from "@/lib/format";
import { toMonth } from "@/lib/market";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Bandeiras tarifárias",
  description: "A bandeira tarifária de cada mês e o valor adicional cobrado, segundo a ANEEL.",
  path: "/tarifas",
  noIndex: true,
});

const FLAG_NOTE =
  "Valores homologados pela ANEEL, sem impostos. A conta de luz inclui tributos e outras cobranças; estes números não são a sua conta.";

export default async function TariffsPage() {
  const result = await getTariffFlags("2020-01-01");
  return (
    <Container>
      <PageHeader eyebrow="Tarifas" title="Bandeiras tarifárias mês a mês">
        <p>
          A bandeira indica o custo de gerar energia em cada mês. Verde não tem adicional; amarela e
          vermelha somam um valor à tarifa de cada kWh consumido.
        </p>
      </PageHeader>
      {!result.ok ? (
        <DataUnavailable />
      ) : (
        <>
          <Section id="historico" title="Adicional da bandeira por mês">
            <MonthlyChart
              title="Adicional da bandeira (R$/MWh)"
              rows={result.data.items.map((item) => ({
                month: toMonth(item.month),
                adicional: item.additional_brl_per_mwh,
              }))}
              series={[{ key: "adicional", label: "Adicional", color: "var(--color-series-3)" }]}
              unit="R$/MWh"
              kind="bar"
              digits={2}
            />
            <div className="mt-4">
              <Notice>{FLAG_NOTE}</Notice>
            </div>
            <DataAttribution
              source={result.data.source}
              note="valor em R$ por MWh (unidade inferida do histórico da ANEEL)"
            />
          </Section>
          <Section id="tabela" title="Últimos meses">
            <Card className="overflow-x-auto">
              <table className="w-full min-w-[420px] text-sm">
                <caption className="sr-only">Bandeira e adicional dos últimos 12 meses</caption>
                <thead className="bg-surface-2 text-ink-2 text-left">
                  <tr>
                    <th scope="col" className="px-4 py-3 font-medium">
                      Mês
                    </th>
                    <th scope="col" className="px-4 py-3 font-medium">
                      Bandeira
                    </th>
                    <th scope="col" className="px-4 py-3 text-right font-medium">
                      Adicional (R$/MWh)
                    </th>
                  </tr>
                </thead>
                <tbody className="tabular">
                  {[...result.data.items]
                    .reverse()
                    .slice(0, 12)
                    .map((item) => (
                      <tr key={item.month} className="border-grid border-t">
                        <th scope="row" className="px-4 py-2.5 text-left font-medium">
                          {formatLongMonth(toMonth(item.month))}
                        </th>
                        <td className="px-4 py-2.5">{item.flag}</td>
                        <td className="px-4 py-2.5 text-right">
                          {formatBRL(item.additional_brl_per_mwh)}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </Card>
          </Section>
        </>
      )}
    </Container>
  );
}
