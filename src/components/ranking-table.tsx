import Link from "next/link";
import type { UsinaRanking } from "@/lib/api/types";
import { formatBRLCompact, formatEnergy, formatFonte, formatPercent } from "@/lib/format";

/** Most affected plants in a month, each linking to its page. */
export function RankingTable({ itens, caption }: { itens: UsinaRanking[]; caption: string }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-[var(--color-grid)] bg-[var(--color-surface)]">
      <table className="tabular w-full min-w-[560px] text-left text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b border-[var(--color-line)]">
            <th scope="col" className="px-3 py-2 font-semibold">
              #
            </th>
            <th scope="col" className="px-3 py-2 font-semibold">
              Usina
            </th>
            <th scope="col" className="px-3 py-2 text-right font-semibold">
              Energia cortada
            </th>
            <th scope="col" className="px-3 py-2 text-right font-semibold">
              % de corte
            </th>
            <th scope="col" className="px-3 py-2 text-right font-semibold">
              Perda estimada
            </th>
          </tr>
        </thead>
        <tbody>
          {itens.map((u) => (
            <tr key={u.id} className="border-b border-[var(--color-grid)] last:border-0">
              <td className="px-3 py-2 text-[var(--color-muted)]">{u.posicao}º</td>
              <th scope="row" className="px-3 py-2 font-normal">
                <Link
                  href={`/usinas/${u.slug}`}
                  className="font-medium text-[var(--color-accent)] underline"
                >
                  {u.nome}
                </Link>
                <span className="block text-xs text-[var(--color-muted)]">
                  {formatFonte(u.fonte)} · {u.uf}
                </span>
              </th>
              <td className="px-3 py-2 text-right">{formatEnergy(u.energia_cortada_mwh)}</td>
              <td className="px-3 py-2 text-right">{formatPercent(u.percentual_corte)}</td>
              <td className="px-3 py-2 text-right">{formatBRLCompact(u.perda_estimada_brl)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
