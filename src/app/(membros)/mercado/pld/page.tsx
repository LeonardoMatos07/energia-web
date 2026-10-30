import Link from "next/link";
import { MonthlyChart } from "@/components/charts/monthly-chart";
import { DataAttribution } from "@/components/data-attribution";
import { Card, Container, DataUnavailable, Notice, PageHeader, Section } from "@/components/ui";
import { getHydroSubsystems, getPld, getSubsystemCurtailment } from "@/lib/api/queries";
import type { HydroSubsystemPoint, SubsystemMonthlyCurtailment } from "@/lib/api/types";
import { formatBRL, formatGWh, formatNumber, formatPercent, formatShortMonth } from "@/lib/format";
import { SUBSYSTEMS } from "@/lib/geo";
import { PLD_COLORS, parseSubsystem, pldRows, subsystemLabel, toMonth } from "@/lib/market";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Preço da energia (PLD)",
  description:
    "O PLD médio mensal por submercado desde 2021, ao lado do corte de geração e da energia natural afluente do mesmo período.",
  path: "/mercado/pld",
  noIndex: true,
});

type SearchParams = Record<string, string | string[] | undefined>;
const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

const TABLE_MONTHS = 12;

function lastMonths(count: number, today: Date): string[] {
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - index, 1));
    return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
  }).reverse();
}

function averageByMonth(
  points: readonly HydroSubsystemPoint[],
  pick: "storage_pct" | "ena_storable_pct_mlt",
) {
  const sums = new Map<string, { total: number; count: number }>();
  for (const point of points) {
    const value = point[pick];
    if (value === null) continue;
    const entry = sums.get(toMonth(point.day)) ?? { total: 0, count: 0 };
    entry.total += value;
    entry.count += 1;
    sums.set(toMonth(point.day), entry);
  }
  return new Map([...sums].map(([month, { total, count }]) => [month, total / count]));
}

export default async function PldPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const subsystem = parseSubsystem(first((await searchParams).submercado));
  const today = new Date();
  const months = lastMonths(TABLE_MONTHS, today);
  const from = `${months[0]}-01`;
  const to = today.toISOString().slice(0, 10);

  const [monthly, curtailment, hydro] = await Promise.all([
    getPld("monthly", { from: "2021-01-01", to }),
    getSubsystemCurtailment("total", months[0], months[months.length - 1]),
    getHydroSubsystems(subsystem, from, to),
  ]);

  return (
    <Container>
      <PageHeader eyebrow="Mercado" title="Preço da energia: o PLD por submercado">
        <p>
          O Preço de Liquidação das Diferenças (PLD) é o preço da energia no mercado de curto prazo,
          calculado hora a hora para cada submercado. Quando há sobra de energia (e muito vento, sol
          e chuva), ele cai para o piso regulatório; quando falta, sobe.
        </p>
      </PageHeader>

      {!monthly.ok ? (
        <DataUnavailable />
      ) : (
        <>
          <Section id="serie" title="PLD médio mensal">
            <MonthlyChart
              title="PLD médio mensal por submercado"
              description="Média das horas de cada mês, em R$/MWh."
              rows={pldRows(monthly.data.points) as never}
              series={SUBSYSTEMS.map((item) => ({
                key: item.id,
                label: item.name,
                color: PLD_COLORS[item.id],
              }))}
              unit="R$/MWh"
              digits={0}
              periodFilter
            />
            <DataAttribution source={monthly.data.source} />
          </Section>

          <Section id="comparacao" title={`Preço, corte e água: ${subsystemLabel(subsystem)}`}>
            <nav aria-label="Submercado" className="mb-4 flex flex-wrap gap-2">
              {SUBSYSTEMS.map((item) => (
                <Link
                  key={item.id}
                  href={`/mercado/pld?submercado=${item.id}`}
                  aria-current={item.id === subsystem ? "page" : undefined}
                  className={`rounded-full border px-3 py-1.5 text-sm ${
                    item.id === subsystem
                      ? "bg-accent text-on-accent border-transparent"
                      : "border-grid text-ink-2 hover:text-ink"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
            <ComparisonTable
              subsystem={subsystem}
              months={months}
              pld={monthly.data.points.filter((point) => point.subsystem === subsystem)}
              curtailment={curtailment.ok ? curtailment.data.items : []}
              hydro={hydro.ok ? hydro.data.points : []}
            />
            <p className="text-muted mt-3 max-w-3xl text-xs leading-5">
              Corte: geração eólica e solar reduzida por ordem do ONS (nosso próprio pipeline sobre
              dados do ONS). ENA (energia natural afluente, % da média de longo prazo) e
              armazenamento dos reservatórios: média dos dias do mês, dados do ONS. O PLD costuma
              ser mais baixo quando a água e o vento sobram, mas há outros fatores; a tabela mostra
              a coincidência no tempo, não uma relação de causa.
            </p>
          </Section>

          <Section id="sobre" title="Como ler">
            <Notice>
              O PLD é um preço do mercado de curto prazo, com piso e teto definidos pela ANEEL para
              cada ano. Não é a tarifa de quem paga a conta de luz. A série de “PLD sombra” que a
              CCEE publica é uma simulação paralela e não entra aqui.
            </Notice>
          </Section>
        </>
      )}
    </Container>
  );
}

function ComparisonTable({
  subsystem,
  months,
  pld,
  curtailment,
  hydro,
}: {
  subsystem: string;
  months: string[];
  pld: {
    period: string;
    pld_avg_brl_per_mwh: number;
    hours_at_floor: number | null;
    hours: number | null;
  }[];
  curtailment: SubsystemMonthlyCurtailment[];
  hydro: HydroSubsystemPoint[];
}) {
  const pldByMonth = new Map(pld.map((point) => [toMonth(point.period), point]));
  const curtailmentByMonth = new Map(
    curtailment
      .filter((item) => item.subsystem === subsystem)
      .map((item) => [toMonth(item.month), item]),
  );
  const ena = averageByMonth(hydro, "ena_storable_pct_mlt");
  const storage = averageByMonth(hydro, "storage_pct");
  return (
    <Card className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-sm">
        <caption className="sr-only">
          PLD, corte de geração e água por mês no submercado {subsystem}
        </caption>
        <thead className="bg-surface-2 text-ink-2 text-left">
          <tr>
            <th scope="col" className="px-4 py-3 font-medium">
              Mês
            </th>
            <th scope="col" className="px-4 py-3 text-right font-medium">
              PLD médio
            </th>
            <th scope="col" className="px-4 py-3 text-right font-medium">
              Horas no piso
            </th>
            <th scope="col" className="px-4 py-3 text-right font-medium">
              Corte (GWh)
            </th>
            <th scope="col" className="px-4 py-3 text-right font-medium">
              Corte (% do possível)
            </th>
            <th scope="col" className="px-4 py-3 text-right font-medium">
              ENA (% da MLT)
            </th>
            <th scope="col" className="px-4 py-3 text-right font-medium">
              Reservatórios (%)
            </th>
          </tr>
        </thead>
        <tbody className="tabular">
          {months.map((month) => {
            const price = pldByMonth.get(month);
            const cut = curtailmentByMonth.get(month);
            return (
              <tr key={month} className="border-grid border-t">
                <th scope="row" className="px-4 py-2.5 text-left font-medium">
                  {formatShortMonth(month)}
                </th>
                <td className="px-4 py-2.5 text-right">
                  {price ? formatBRL(price.pld_avg_brl_per_mwh) : "—"}
                </td>
                <td className="px-4 py-2.5 text-right">
                  {price?.hours_at_floor != null && price.hours
                    ? `${formatNumber(price.hours_at_floor, 0)} de ${formatNumber(price.hours, 0)}`
                    : "—"}
                </td>
                <td className="px-4 py-2.5 text-right">
                  {cut ? formatGWh(cut.curtailed_mwh) : "—"}
                </td>
                <td className="px-4 py-2.5 text-right">
                  {cut ? formatPercent(cut.curtailment_pct) : "—"}
                </td>
                <td className="px-4 py-2.5 text-right">
                  {ena.has(month) ? formatPercent(ena.get(month) ?? null, 0) : "—"}
                </td>
                <td className="px-4 py-2.5 text-right">
                  {storage.has(month) ? formatPercent(storage.get(month) ?? null, 0) : "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Card>
  );
}
