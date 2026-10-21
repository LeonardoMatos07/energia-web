import Link from "next/link";
import type { RankedPlant } from "@/lib/api/types";
import { formatBRLCompact, formatEnergy, formatSource, formatPercent } from "@/lib/format";

export function RankingTable({ items, caption }: { items: RankedPlant[]; caption: string }) {
  const maxCut = Math.max(0, ...items.map((u) => u.curtailed_mwh));
  return (
    <div className="border-grid bg-surface shadow-card overflow-x-auto rounded-2xl border">
      <table className="tabular w-full min-w-[560px] text-left text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-grid bg-surface-2 text-ink-2 border-b text-xs tracking-wide uppercase">
            <th scope="col" className="px-3 py-2 font-medium">
              #
            </th>
            <th scope="col" className="px-3 py-2 font-medium">
              Usina
            </th>
            <th scope="col" className="px-3 py-2 text-right font-medium">
              Energia cortada
            </th>
            <th scope="col" className="px-3 py-2 text-right font-medium">
              % de corte
            </th>
            <th scope="col" className="px-3 py-2 text-right font-medium">
              Perda estimada
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((u) => (
            <tr key={u.id} className="border-grid hover:bg-surface-2 border-b last:border-0">
              <td className="text-muted w-12 px-3 py-2.5">{u.rank}º</td>
              <th scope="row" className="px-3 py-2.5 font-normal">
                <Link
                  href={`/usinas/${u.slug}`}
                  className="text-ink hover:text-accent font-medium hover:underline"
                >
                  {u.name}
                </Link>
                <span className="text-muted block text-xs">
                  {formatSource(u.source)} · {u.state}
                </span>
              </th>
              <td className="px-3 py-2.5 text-right">
                {formatEnergy(u.curtailed_mwh)}
                <span aria-hidden className="bg-grid mt-1 ml-auto block h-1 w-24 rounded-full">
                  <span
                    className="bg-accent block h-full rounded-full"
                    style={{ width: `${maxCut > 0 ? (u.curtailed_mwh / maxCut) * 100 : 0}%` }}
                  />
                </span>
              </td>
              <td className="px-3 py-2.5 text-right">{formatPercent(u.curtailment_pct, 1, 1)}</td>
              <td className="px-3 py-2.5 text-right">{formatBRLCompact(u.estimated_loss_brl)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
