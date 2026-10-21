"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatMesCurto, formatMesLongo, formatNumber } from "@/lib/format";
import { fillMonthGaps } from "@/lib/series";
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
    <div className="border-grid bg-surface min-w-44 rounded-xl border px-4 py-3 text-sm shadow-lg">
      <p className="mb-1 font-semibold">{formatMesLongo(String(label))}</p>
      <ul className="tabular space-y-0.5">
        {payload.map((p) => (
          <li key={String(p.dataKey)} className="flex items-center gap-2">
            <span
              aria-hidden
              className="inline-block h-2.5 w-2.5 rounded-sm"
              style={{ background: p.color }}
            />
            <span className="text-ink-2">{p.name}</span>
            <span className="ml-auto pl-3 font-medium">
              {typeof p.value === "number" ? `${formatNumber(p.value, digits)} ${unit}` : "—"}
            </span>
          </li>
        ))}
        {showTotal && numeric.length > 1 ? (
          <li className="border-grid mt-1 flex border-t pt-1">
            <span className="text-ink-2">Total</span>
            <span className="ml-auto pl-3 font-semibold">
              {formatNumber(total, digits)} {unit}
            </span>
          </li>
        ) : null}
      </ul>
    </div>
  );
}

function ChartLegend({ series, unit }: { series: ChartSeries[]; unit: string }) {
  return (
    <div className="text-ink-2 mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
      {series.length > 1
        ? series.map((s) => (
            <span key={s.key} className="inline-flex items-center gap-1.5">
              <span aria-hidden className="size-2.5 rounded-sm" style={{ background: s.color }} />
              {s.label}
            </span>
          ))
        : null}
      <span className="text-muted ml-auto text-xs">em {unit}</span>
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
  // Missing months stay on the axis as gaps; the table lists only months with data.
  const plotted = useMemo(() => fillMonthGaps(rows), [rows]);

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
        interval="preserveStartEnd"
        minTickGap={24}
        tickLine={false}
        tickMargin={8}
        {...axisProps}
      />
      <YAxis
        width={48}
        tickFormatter={tickFormatter}
        tickLine={false}
        axisLine={false}
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
        cursor={
          kind === "stacked-bar"
            ? { fill: "var(--color-surface-2)" }
            : { stroke: CHART_INK.baseline }
        }
      />
    </>
  );

  return (
    <figure className="border-grid bg-surface shadow-card rounded-2xl border p-4 sm:p-6">
      <figcaption>
        <h3 className="text-base font-semibold tracking-tight sm:text-lg">{title}</h3>
        {description ? <p className="text-ink-2 mt-1 text-sm">{description}</p> : null}
      </figcaption>
      <ChartLegend series={series} unit={unit} />
      <div
        className="mt-3"
        style={{ height }}
        role="img"
        aria-label={`${title}. Valores em ${unit}. Os dados completos estão na tabela abaixo.`}
      >
        {mounted && plotted.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            {kind === "line" ? (
              <LineChart data={plotted} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                {common}
                {series.map((s) => (
                  <Line
                    key={s.key}
                    type="linear"
                    dataKey={s.key}
                    name={s.label}
                    stroke={s.color}
                    strokeWidth={2}
                    // Small dots so a month with no neighbours still shows up between gaps.
                    dot={{ r: 2, strokeWidth: 0, fill: s.color }}
                    activeDot={{ r: 4, strokeWidth: 2, stroke: CHART_INK.surface }}
                    isAnimationActive={false}
                  />
                ))}
              </LineChart>
            ) : (
              <BarChart data={plotted} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
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
