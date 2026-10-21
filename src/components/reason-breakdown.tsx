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

  return (
    <div className="space-y-4">
      <ul className="space-y-4">
        {MOTIVOS.map((m) => {
          const value = periodo[m.campo] ?? 0;
          const share = total > 0 ? (value / total) * 100 : 0;
          return (
            <li key={m.key}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                <p className="font-medium">
                  <span
                    aria-hidden
                    className="mr-2 inline-block h-3 w-3 rounded-sm align-middle"
                    style={{ background: MOTIVO_COLORS[m.key] }}
                  />
                  {m.nome} <span className="text-sm text-[var(--color-muted)]">({m.sigla})</span>
                </p>
                <p className="tabular text-sm">
                  <span className="font-semibold">{formatEnergy(value)}</span>{" "}
                  <span className="text-[var(--color-ink-2)]">· {formatPercent(share)} do corte</span>
                </p>
              </div>
              <div
                className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-[var(--color-grid)]"
                aria-hidden
              >
                <div
                  className="h-full rounded-full"
                  style={{ width: `${Math.min(100, share)}%`, background: MOTIVO_COLORS[m.key] }}
                />
              </div>
              <p className="mt-1 text-sm text-[var(--color-ink-2)]">{m.explicacao}</p>
            </li>
          );
        })}
      </ul>

      <div className="overflow-x-auto">
        <table className="tabular w-full min-w-[320px] text-left text-sm">
          <caption className="sr-only">Energia cortada por motivo de restrição</caption>
          <thead>
            <tr className="border-b border-[var(--color-line)]">
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
              <tr key={m.key} className="border-b border-[var(--color-grid)]">
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
    </div>
  );
}

export function sumMotivos(
  rows: readonly Partial<Record<MotivoCampo, number | null>>[],
): MotivoValues {
  const acc: MotivoValues = { corte_rel_mwh: 0, corte_cnf_mwh: 0, corte_ene_mwh: 0, corte_outros_mwh: 0 };
  for (const row of rows) {
    for (const m of MOTIVOS) acc[m.campo] += row[m.campo] ?? 0;
  }
  return acc;
}
