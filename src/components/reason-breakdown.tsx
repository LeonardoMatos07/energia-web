import { formatEnergy, formatPercent } from "@/lib/format";
import { MOTIVOS, type MotivoCampo } from "@/lib/motivos";
import { MOTIVO_COLORS } from "./charts/palette";

type MotivoValues = Record<MotivoCampo, number>;

export interface ReasonBreakdownProps {
  /** Totals for the whole period. */
  periodo: MotivoValues;
  /** Values for the latest month (optional second column). */
  ultimoMes?: MotivoValues;
  ultimoMesLabel?: string;
}

/** Curtailed energy split by ONS restriction reason, with a plain-language explanation. */
export function ReasonBreakdown({ periodo, ultimoMes, ultimoMesLabel }: ReasonBreakdownProps) {
  const total = MOTIVOS.reduce((sum, m) => sum + (periodo[m.campo] ?? 0), 0);

  const shares = MOTIVOS.map((m) => {
    const value = periodo[m.campo] ?? 0;
    return { motivo: m, value, share: total > 0 ? (value / total) * 100 : 0 };
  });

  return (
    <div className="space-y-5">
      {/* One bar for the whole cut, split by reason: the proportions read at a glance. */}
      <div aria-hidden className="bg-grid flex h-3 w-full overflow-hidden rounded-full">
        {shares
          .filter(({ share }) => share > 0)
          .map(({ motivo, share }) => (
            <div
              key={motivo.key}
              className="border-surface h-full border-r-2 last:border-r-0"
              style={{ width: `${share}%`, background: MOTIVO_COLORS[motivo.key] }}
            />
          ))}
      </div>

      <ul className="grid gap-3 sm:grid-cols-2">
        {shares.map(({ motivo: m, value, share }) => (
          <li
            key={m.key}
            className={`border-grid bg-surface rounded-xl border p-4 ${value > 0 ? "" : "opacity-60"}`}
          >
            <div className="flex items-baseline justify-between gap-3">
              <p className="font-medium">
                <span
                  aria-hidden
                  className="mr-2 inline-block size-2.5 rounded-sm align-middle"
                  style={{ background: MOTIVO_COLORS[m.key] }}
                />
                {m.nome} <span className="text-muted text-sm">({m.sigla})</span>
              </p>
              <p className="tabular text-sm whitespace-nowrap">
                <span className="font-semibold">{formatEnergy(value)}</span>
              </p>
            </div>
            <p className="tabular text-ink-2 mt-0.5 text-sm">{formatPercent(share)} do corte</p>
            <p className="text-ink-2 mt-2 text-sm leading-5">{m.explicacao}</p>
          </li>
        ))}
      </ul>

      <details className="text-sm">
        <summary className="text-accent cursor-pointer underline">Ver números por motivo</summary>
        <div className="mt-2 overflow-x-auto">
          <table className="tabular w-full min-w-[320px] text-left text-sm">
            <caption className="sr-only">Energia cortada por motivo de restrição</caption>
            <thead>
              <tr className="border-line border-b">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Motivo
                </th>
                {ultimoMes ? (
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    {ultimoMesLabel ?? "Último mês"}
                  </th>
                ) : null}
                <th scope="col" className="py-2 text-right font-semibold">
                  Todo o período
                </th>
              </tr>
            </thead>
            <tbody>
              {MOTIVOS.map((m) => (
                <tr key={m.key} className="border-grid border-b">
                  <th scope="row" className="py-1.5 pr-3 font-normal">
                    {m.nome} ({m.sigla})
                  </th>
                  {ultimoMes ? (
                    <td className="py-1.5 pr-3 text-right">{formatEnergy(ultimoMes[m.campo])}</td>
                  ) : null}
                  <td className="py-1.5 text-right">{formatEnergy(periodo[m.campo])}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}

export function sumMotivos(
  rows: readonly Partial<Record<MotivoCampo, number | null>>[],
): MotivoValues {
  const acc: MotivoValues = {
    corte_rel_mwh: 0,
    corte_cnf_mwh: 0,
    corte_ene_mwh: 0,
    corte_outros_mwh: 0,
  };
  for (const row of rows) {
    for (const m of MOTIVOS) acc[m.campo] += row[m.campo] ?? 0;
  }
  return acc;
}
