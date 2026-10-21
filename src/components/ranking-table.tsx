import Link from "next/link";
import type { UsinaRanking } from "@/lib/api/types";
import { formatBRLCompact, formatEnergy, formatFonte, formatPercent } from "@/lib/format";

/** Most affected plants in a month, each linking to its page. */
export function RankingTable({ itens, caption }: { itens: UsinaRanking[]; caption: string }) {
  const maxCut = Math.max(0, ...itens.map((u) => u.energia_cortada_mwh));
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
          {itens.map((u) => (
            <tr key={u.id} className="border-grid hover:bg-surface-2 border-b last:border-0">
              <td className="text-muted w-12 px-3 py-2.5">{u.posicao}º</td>
              <th scope="row" className="px-3 py-2.5 font-normal">
                <Link
                  href={`/usinas/${u.slug}`}
                  className="text-ink hover:text-accent font-medium hover:underline"
                >
                  {u.nome}
                </Link>
                <span className="text-muted block text-xs">
                  {formatFonte(u.fonte)} · {u.uf}
                </span>
              </th>
              <td className="px-3 py-2.5 text-right">
                {formatEnergy(u.energia_cortada_mwh)}
                <span aria-hidden className="bg-grid mt-1 ml-auto block h-1 w-24 rounded-full">
                  <span
                    className="bg-accent block h-full rounded-full"
                    style={{ width: `${maxCut > 0 ? (u.energia_cortada_mwh / maxCut) * 100 : 0}%` }}
                  />
                </span>
              </td>
              <td className="px-3 py-2.5 text-right">{formatPercent(u.percentual_corte, 1, 1)}</td>
              <td className="px-3 py-2.5 text-right">{formatBRLCompact(u.perda_estimada_brl)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
