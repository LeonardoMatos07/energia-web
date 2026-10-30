import Link from "next/link";
import { DataUnavailable, StatGrid, StatTile } from "@/components/ui";
import { getSubsystemCurtailment } from "@/lib/api/queries";
import {
  formatBRLCompact,
  formatGWh,
  formatLongMonth,
  formatNumber,
  formatPercent,
} from "@/lib/format";
import { latest, normalizeMonth } from "@/lib/series";

/** Curtailment of the latest month (wind + solar, whole country) with the way into the area. */
export async function CurtailmentBlock() {
  const total = await getSubsystemCurtailment("total");
  const rows = total.ok ? total.data.items.filter((row) => row.subsystem === "SIN") : [];
  const row = latest(rows);
  if (!row) return <DataUnavailable />;
  return (
    <>
      <StatGrid>
        <StatTile highlight label="Energia cortada" value={formatGWh(row.curtailed_mwh)} />
        <StatTile label="% de corte" value={formatPercent(row.curtailment_pct)} />
        <StatTile label="Perda estimada" value={formatBRLCompact(row.estimated_loss_brl)} />
        <StatTile label="Usinas afetadas" value={formatNumber(row.affected_plants, 0)} />
      </StatGrid>
      <p className="text-ink-2 mt-3 text-sm">
        Eólica e solar no Brasil em {formatLongMonth(normalizeMonth(row.month))}. Por estado, por
        usina e com previsão para os próximos 7 dias na{" "}
        <Link href="/curtailment" className="text-accent underline">
          área Curtailment
        </Link>
        .
      </p>
    </>
  );
}
