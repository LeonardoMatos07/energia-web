"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatMesCurto, formatMesLongo, formatNumber } from "@/lib/format";
import { ChartDataTable } from "./data-table";
import { CHART_INK } from "./palette";
import type { ChartRow, ChartSeries } from "./types";

export interface MonthlyChartProps {
  title: string;
  description?: string;
  rows: ChartRow[];
  series: ChartSeries[];
  /** Unit of the values in `rows`, shown on the axis, tooltip and table (e.g. "GWh", "%"). */
  unit: string;
  kind?: "stacked-bar" | "line";
  digits?: number;
  height?: number;
}

interface TooltipEntry {
  dataKey?: string | number;
  name?: string | number;
  value?: number | string | null;
  color?: string;
}

function ChartTooltip({
  active,
  payload,
  label,
  unit,
  digits,
  showTotal,
}: {
  active?: boolean;
  payload?: readonly TooltipEntry[];
  label?: string | number;
  unit: string;
  digits: number;
  showTotal: boolean;
}) {
  if (!active || !payload?.length) return null;
  const numeric = payload.filter((p) => typeof p.value === "number");
  const total = numeric.reduce((sum, p) => sum + (p.value as number), 0);
  return (
    <div className="rounded-xl border border-[var(--color-grid)] bg-white px-4 py-3 text-sm shadow-lg shadow-[#18372b]/10">
      <p className="mb-1 font-semibold">{formatMesLongo(String(label))}</p>
      <ul className="tabular space-y-0.5">
        {payload.map((p) => (
          <li key={String(p.dataKey)} className="flex items-center gap-2">
            <span
              aria-hidden
              className="inline-block h-2.5 w-2.5 rounded-sm"
              style={{ background: p.color }}
            />
            <span className="text-[var(--color-ink-2)]">{p.name}:</span>
            <span className="ml-auto pl-3 font-medium">
              {typeof p.value === "number" ? `${formatNumber(p.value, digits)} ${unit}` : "—"}
            </span>
          </li>
        ))}
        {showTotal && numeric.length > 1 ? (
          <li className="mt-1 flex border-t border-[var(--color-grid)] pt-1">
            <span className="text-[var(--color-ink-2)]">Total:</span>
            <span className="ml-auto pl-3 font-semibold">
              {formatNumber(total, digits)} {unit}
            </span>
          </li>
        ) : null}
      </ul>
    </div>
  );
}

/** Monthly time series (stacked bars or lines) with legend, tooltip and a table view. */
export function MonthlyChart({
  title,
  description,
  rows,
  series,
  unit,
  kind = "stacked-bar",
  digits = 1,
  height = 300,
}: MonthlyChartProps) {
  // Recharts measures the DOM; render the plot only after mount to avoid SSR size warnings.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const tickFormatter = (v: number) => formatNumber(v, v !== 0 && Math.abs(v) < 10 ? 1 : 0);
  const axisProps = {
    tick: { fill: CHART_INK.axis, fontSize: 12 },
    stroke: CHART_INK.baseline,
  };

  const common = (
    <>
      <CartesianGrid vertical={false} stroke={CHART_INK.grid} />
      <XAxis
        dataKey="mes"
        tickFormatter={(m: string) => formatMesCurto(m)}
        minTickGap={16}
        tickLine={false}
        {...axisProps}
      />
      <YAxis
        width={56}
        tickFormatter={tickFormatter}
        tickLine={false}
        axisLine={false}
        label={{
          value: unit,
          position: "insideTopLeft",
          offset: -2,
          dy: -14,
          fill: CHART_INK.axis,
          fontSize: 12,
        }}
        {...axisProps}
      />
      <Tooltip
        content={(props) => (
          <ChartTooltip
            active={props.active}
            payload={props.payload as readonly TooltipEntry[] | undefined}
            label={props.label}
            unit={unit}
            digits={digits}
            showTotal={kind === "stacked-bar"}
          />
        )}
        cursor={kind === "stacked-bar" ? { fill: "rgba(11,11,11,0.05)" } : { stroke: CHART_INK.baseline }}
      />
      {series.length > 1 ? (
        <Legend
          verticalAlign="top"
          align="left"
          height={32}
          iconType="square"
          wrapperStyle={{ fontSize: 13, color: "var(--color-ink-2)" }}
        />
      ) : null}
    </>
  );

  return (
    <figure className="rounded-2xl border border-[var(--color-grid)] bg-[var(--color-surface)] p-4 shadow-[0_2px_8px_rgba(25,55,43,0.04)] sm:p-6">
      <figcaption>
        <h3 className="text-lg font-bold tracking-tight">{title}</h3>
        {description ? <p className="mt-1 text-sm text-[var(--color-ink-2)]">{description}</p> : null}
      </figcaption>
      <div className="mt-4" style={{ height }} role="img" aria-label={`${title}. Valores em ${unit}. Os dados completos estão na tabela abaixo.`}>
        {mounted && rows.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            {kind === "line" ? (
              <LineChart data={rows} margin={{ top: 16, right: 8, left: 0, bottom: 0 }}>
                {common}
                {series.map((s) => (
                  <Line
                    key={s.key}
                    type="monotone"
                    dataKey={s.key}
                    name={s.label}
                    stroke={s.color}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, strokeWidth: 2, stroke: CHART_INK.surface }}
                    connectNulls
                    isAnimationActive={false}
                  />
                ))}
              </LineChart>
            ) : (
              <BarChart data={rows} margin={{ top: 16, right: 8, left: 0, bottom: 0 }}>
                {common}
                {series.map((s, i) => (
                  <Bar
                    key={s.key}
                    dataKey={s.key}
                    name={s.label}
                    stackId="total"
                    fill={s.color}
                    stroke={CHART_INK.surface}
                    strokeWidth={1}
                    radius={i === series.length - 1 ? [3, 3, 0, 0] : 0}
                    maxBarSize={28}
                    isAnimationActive={false}
                  />
                ))}
              </BarChart>
            )}
          </ResponsiveContainer>
        ) : null}
      </div>
      <ChartDataTable caption={title} rows={rows} series={series} unit={unit} digits={digits} />
    </figure>
  );
}
