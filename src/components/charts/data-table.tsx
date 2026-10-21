import { formatShortMonth, formatNumber } from "@/lib/format";
import type { ChartRow, ChartSeries } from "./types";

interface DataTableProps {
  caption: string;
  rows: ChartRow[];
  series: ChartSeries[];
  unit: string;
  digits?: number;
}

export function ChartDataTable({ caption, rows, series, unit, digits = 1 }: DataTableProps) {
  return (
    <details className="mt-3 text-sm">
      <summary className="cursor-pointer text-[var(--color-accent)] underline">
        Ver dados em tabela
      </summary>
      <div className="mt-2 max-h-80 overflow-auto rounded border border-[var(--color-grid)]">
        <table className="tabular w-full border-collapse text-left">
          <caption className="sr-only">{caption}</caption>
          <thead className="sticky top-0 bg-[var(--color-page)]">
            <tr>
              <th scope="col" className="px-3 py-2 font-semibold">
                Mês
              </th>
              {series.map((s) => (
                <th key={s.key} scope="col" className="px-3 py-2 text-right font-semibold">
                  {s.label} ({unit})
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.month} className="border-t border-[var(--color-grid)]">
                <th scope="row" className="px-3 py-1.5 font-normal">
                  {formatShortMonth(row.month)}
                </th>
                {series.map((s) => {
                  const value = row[s.key];
                  return (
                    <td key={s.key} className="px-3 py-1.5 text-right">
                      {formatNumber(typeof value === "number" ? value : null, digits)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}
