import Link from "next/link";
import { DataAttribution } from "@/components/data-attribution";
import { SeriesChart, type SeriesRow } from "@/components/charts/series-chart";
import { DataUnavailable } from "@/components/ui";
import { getPld } from "@/lib/api/queries";
import { formatBRL } from "@/lib/format";
import { SUBSYSTEMS } from "@/lib/geo";
import { PLD_COLORS } from "@/lib/market";

const PLD_DAYS = 60;

const isoDay = (date: Date) => date.toISOString().slice(0, 10);

/** Daily PLD per submarket for the last 60 days, with the CCEE attribution the API provides. */
export async function PldBlock() {
  const from = isoDay(new Date(Date.now() - PLD_DAYS * 86_400_000));
  const pld = await getPld("daily", { from });
  if (!pld.ok || pld.data.points.length === 0) return <DataUnavailable />;
  const byDay = new Map<string, SeriesRow>();
  for (const point of pld.data.points) {
    const day = point.period.slice(0, 10);
    const row = byDay.get(day) ?? { label: `${day.slice(8, 10)}/${day.slice(5, 7)}`, day };
    row[point.subsystem] = point.pld_avg_brl_per_mwh;
    byDay.set(day, row);
  }
  const rows = [...byDay.values()].sort((a, b) => String(a.day).localeCompare(String(b.day)));
  const last = rows.at(-1);
  const se = typeof last?.SE === "number" ? last.SE : null;
  return (
    <>
      <SeriesChart
        title="PLD médio diário por submercado"
        unit="R$/MWh"
        rows={rows}
        series={SUBSYSTEMS.map((item) => ({
          key: item.id,
          label: item.name,
          color: PLD_COLORS[item.id],
          type: "line" as const,
        }))}
        summary={`Média das horas de cada dia, nos últimos ${PLD_DAYS} dias.${
          se !== null ? ` Último dia no Sudeste/Centro-Oeste: ${formatBRL(se)}/MWh.` : ""
        }`}
        height={280}
      />
      <DataAttribution source={pld.data.source} />
      <p className="mt-2 text-sm">
        <Link href="/mercado/pld" className="text-accent underline">
          Ver o PLD mensal desde 2021
        </Link>
      </p>
    </>
  );
}
