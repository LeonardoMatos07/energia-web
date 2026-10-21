import { formatEnergy, formatPercent } from "@/lib/format";
import { REASONS, type ReasonField } from "@/lib/reasons";
import { REASON_COLORS } from "./charts/palette";

type ReasonValues = Record<ReasonField, number>;

export interface ReasonBreakdownProps {
  period: ReasonValues;
  latestMonth?: ReasonValues;
  latestMonthLabel?: string;
}

export function ReasonBreakdown({ period, latestMonth, latestMonthLabel }: ReasonBreakdownProps) {
  const total = REASONS.reduce((sum, m) => sum + (period[m.field] ?? 0), 0);

  const shares = REASONS.map((m) => {
    const value = period[m.field] ?? 0;
    return { reason: m, value, share: total > 0 ? (value / total) * 100 : 0 };
  });

  return (
    <div className="space-y-5">
      <div aria-hidden className="bg-grid flex h-3 w-full overflow-hidden rounded-full">
        {shares
          .filter(({ share }) => share > 0)
          .map(({ reason, share }) => (
            <div
              key={reason.key}
              className="border-surface h-full border-r-2 last:border-r-0"
              style={{ width: `${share}%`, background: REASON_COLORS[reason.key] }}
            />
          ))}
      </div>

      <ul className="grid gap-3 sm:grid-cols-2">
        {shares.map(({ reason: m, value, share }) => (
          <li
            key={m.key}
            className={`border-grid bg-surface rounded-xl border p-4 ${value > 0 ? "" : "opacity-60"}`}
          >
            <div className="flex items-baseline justify-between gap-3">
              <p className="font-medium">
                <span
                  aria-hidden
                  className="mr-2 inline-block size-2.5 rounded-sm align-middle"
                  style={{ background: REASON_COLORS[m.key] }}
                />
                {m.name} <span className="text-muted text-sm">({m.abbreviation})</span>
              </p>
              <p className="tabular text-sm whitespace-nowrap">
                <span className="font-semibold">{formatEnergy(value)}</span>
              </p>
            </div>
            <p className="tabular text-ink-2 mt-0.5 text-sm">{formatPercent(share)} do corte</p>
            <p className="text-ink-2 mt-2 text-sm leading-5">{m.explanation}</p>
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
                {latestMonth ? (
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    {latestMonthLabel ?? "Último mês"}
                  </th>
                ) : null}
                <th scope="col" className="py-2 text-right font-semibold">
                  Todo o período
                </th>
              </tr>
            </thead>
            <tbody>
              {REASONS.map((m) => (
                <tr key={m.key} className="border-grid border-b">
                  <th scope="row" className="py-1.5 pr-3 font-normal">
                    {m.name} ({m.abbreviation})
                  </th>
                  {latestMonth ? (
                    <td className="py-1.5 pr-3 text-right">{formatEnergy(latestMonth[m.field])}</td>
                  ) : null}
                  <td className="py-1.5 text-right">{formatEnergy(period[m.field])}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}

export function sumReasons(
  rows: readonly Partial<Record<ReasonField, number | null>>[],
): ReasonValues {
  const acc: ReasonValues = {
    curtailed_rel_mwh: 0,
    curtailed_cnf_mwh: 0,
    curtailed_ene_mwh: 0,
    curtailed_other_mwh: 0,
  };
  for (const row of rows) {
    for (const m of REASONS) acc[m.field] += row[m.field] ?? 0;
  }
  return acc;
}
