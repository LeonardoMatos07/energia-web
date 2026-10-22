"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatShortMonth, formatLongMonth, formatNumber } from "@/lib/format";
import { defaultPeriod, fillMonthGaps, filterByMonthRange, monthSpan } from "@/lib/series";
import { ChartDataTable } from "./data-table";
import { trackEvent } from "@/lib/track";
import { PeriodFilter } from "./period-filter";
import { CHART_INK } from "./palette";
import type { ChartRow, ChartSeries } from "./types";

export interface MonthlyChartProps {
  title: string;
  description?: string;
  rows: ChartRow[];
  series: ChartSeries[];
  unit: string;
  kind?: ChartKind;
  digits?: number;
  height?: number;
  periodFilter?: boolean;
  kindOptions?: readonly ChartKind[];
}

export type ChartKind = "stacked-bar" | "bar" | "line" | "pie";

const KIND_LABELS: Record<ChartKind, string> = {
  "stacked-bar": "Barras",
  bar: "Barras",
  line: "Linhas",
  pie: "Pizza",
};

interface Slice {
  key: string;
  name: string;
  color: string;
  value: number;
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
      <p className="mb-1 font-semibold">{formatLongMonth(String(label))}</p>
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

function PieView({ slices, unit, digits }: { slices: Slice[]; unit: string; digits: number }) {
  const total = slices.reduce((sum, slice) => sum + slice.value, 0);
  if (total <= 0) {
    return (
      <p className="text-ink-2 flex h-full items-center justify-center text-sm">
        Sem valores para somar no período selecionado.
      </p>
    );
  }
  return (
    <div className="grid h-full items-center gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="h-full min-h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={slices}
              dataKey="value"
              nameKey="name"
              innerRadius="52%"
              outerRadius="90%"
              paddingAngle={slices.length > 1 ? 2 : 0}
              stroke={CHART_INK.surface}
              strokeWidth={2}
              isAnimationActive={false}
            >
              {slices.map((slice) => (
                <Cell key={slice.key} fill={slice.color} />
              ))}
            </Pie>
            <Tooltip
              content={(props) => {
                const entry = props.payload?.[0];
                if (!props.active || !entry) return null;
                const value = Number(entry.value);
                return (
                  <div className="border-grid bg-surface rounded-xl border px-4 py-3 text-sm shadow-lg">
                    <p className="font-semibold">{String(entry.name)}</p>
                    <p className="tabular text-ink-2">
                      {formatNumber(value, digits)} {unit} ·{" "}
                      {formatNumber((value / total) * 100, 1)}%
                    </p>
                  </div>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="tabular space-y-2.5 text-sm">
        {slices.map((slice) => (
          <li key={slice.key} className="flex items-start gap-2">
            <span
              aria-hidden
              className="mt-1 size-2.5 shrink-0 rounded-sm"
              style={{ background: slice.color }}
            />
            <div className="min-w-0">
              <p className="text-ink-2 break-words">{slice.name}</p>
              <p className="font-medium">
                {formatNumber(slice.value, digits)} {unit}
                <span className="text-muted font-normal">
                  {" "}
                  · {formatNumber((slice.value / total) * 100, 1)}%
                </span>
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ChartLegend({ series }: { series: ChartSeries[] }) {
  if (series.length < 2) return null;
  return (
    <div className="text-ink-2 mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
      {series.map((s) => (
        <span key={s.key} className="inline-flex items-center gap-1.5">
          <span aria-hidden className="size-2.5 rounded-sm" style={{ background: s.color }} />
          {s.label}
        </span>
      ))}
    </div>
  );
}

export function MonthlyChart({
  title,
  description,
  rows,
  series,
  unit,
  kind: kindProp = "line",
  digits = 1,
  height = 300,
  periodFilter = true,
  kindOptions,
}: MonthlyChartProps) {
  const [picked, setPicked] = useState<ChartKind>(kindProp);
  const kind = kindOptions ? picked : kindProp;
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const first = rows[0]?.month ?? "";
  const last = rows[rows.length - 1]?.month ?? "";
  const [range, setRange] = useState<{ start: string; end: string } | null>(null);
  const fallbackStart = periodFilter ? defaultPeriod(first, last).start : first;
  const start = range ? range.start : fallbackStart;
  const end = range ? range.end : last;
  const visibleRows = useMemo(() => filterByMonthRange(rows, start, end), [rows, start, end]);
  const plotted = useMemo(() => fillMonthGaps(visibleRows), [visibleRows]);
  const filterable = periodFilter && monthSpan(first || "0000-01", last || "0000-01") > 3;
  const slices = useMemo<Slice[]>(
    () =>
      series
        .map((s) => ({
          key: s.key,
          name: s.label,
          color: s.color,
          value: visibleRows.reduce((sum, row) => {
            const value = row[s.key];
            return sum + (typeof value === "number" ? value : 0);
          }, 0),
        }))
        .filter((slice) => slice.value > 0),
    [series, visibleRows],
  );
  const stacked = kind === "stacked-bar";

  const tickFormatter = (v: number) => formatNumber(v, v !== 0 && Math.abs(v) < 10 ? 1 : 0);
  const axisProps = {
    tick: { fill: CHART_INK.axis, fontSize: 12 },
    stroke: CHART_INK.baseline,
  };

  const common = (
    <>
      <CartesianGrid vertical={false} stroke={CHART_INK.grid} />
      <XAxis
        dataKey="month"
        tickFormatter={(m: string) => formatShortMonth(m)}
        interval="preserveStartEnd"
        minTickGap={24}
        tickLine={false}
        tickMargin={8}
        {...axisProps}
      />
      <YAxis
        width={52}
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
            showTotal={stacked}
          />
        )}
        cursor={
          kind === "line" ? { stroke: CHART_INK.baseline } : { fill: "var(--color-surface-2)" }
        }
      />
    </>
  );

  return (
    <figure className="border-grid bg-surface shadow-card rounded-2xl border p-4 sm:p-6">
      <figcaption className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <div className="min-w-0">
          <h3 className="text-base font-semibold tracking-tight sm:text-lg">{title}</h3>
          {description ? <p className="text-ink-2 mt-1 text-sm">{description}</p> : null}
        </div>
        {kindOptions && kindOptions.length > 1 ? (
          <div
            role="group"
            aria-label="Tipo de gráfico"
            className="border-line bg-surface inline-flex gap-1 rounded-lg border p-1"
          >
            {kindOptions.map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={option === kind}
                onClick={() => {
                  setPicked(option);
                  trackEvent("chart.kind_change", { kind: option, chart: title });
                }}
                className={`rounded-md px-2.5 py-1 text-sm font-medium transition-colors ${
                  option === kind ? "bg-accent text-on-accent" : "text-ink-2 hover:bg-surface-2"
                }`}
              >
                {KIND_LABELS[option]}
              </button>
            ))}
          </div>
        ) : null}
      </figcaption>
      {filterable ? (
        <PeriodFilter
          first={first}
          last={last}
          start={start}
          end={end}
          onChange={(nextStart, nextEnd) => {
            setRange(
              nextStart > nextEnd
                ? { start: nextStart, end: nextStart }
                : { start: nextStart, end: nextEnd },
            );
            trackEvent("chart.period_change", { chart: title, start: nextStart, end: nextEnd });
          }}
        />
      ) : null}
      {kind === "pie" ? null : <ChartLegend series={series} />}
      <div
        className="relative mt-3"
        style={{ height }}
        role="img"
        aria-label={`${title}. Valores em ${unit}. Os dados completos estão na tabela abaixo.`}
      >
        {plotted.length > 0 && kind !== "pie" ? (
          <span className="text-ink-2 absolute top-0 left-0 text-sm font-semibold">{unit}</span>
        ) : null}
        {plotted.length === 0 ? (
          <p className="text-ink-2 flex h-full items-center justify-center text-sm">
            Sem dados no período selecionado.
          </p>
        ) : kind === "pie" ? (
          mounted ? (
            <PieView slices={slices} unit={unit} digits={digits} />
          ) : null
        ) : mounted ? (
          <ResponsiveContainer width="100%" height="100%">
            {kind === "line" ? (
              <LineChart data={plotted} margin={{ top: 44, right: 12, left: 0, bottom: 0 }}>
                {common}
                {series.map((s) => (
                  <Line
                    key={s.key}
                    type="linear"
                    dataKey={s.key}
                    name={s.label}
                    stroke={s.color}
                    strokeWidth={2}
                    dot={{ r: 2, strokeWidth: 0, fill: s.color }}
                    activeDot={{ r: 4, strokeWidth: 2, stroke: CHART_INK.surface }}
                    isAnimationActive={false}
                  />
                ))}
              </LineChart>
            ) : (
              <BarChart data={plotted} margin={{ top: 44, right: 4, left: 0, bottom: 0 }}>
                {common}
                {series.map((s, i) => (
                  <Bar
                    key={s.key}
                    dataKey={s.key}
                    name={s.label}
                    stackId={stacked ? "total" : undefined}
                    fill={s.color}
                    stroke={CHART_INK.surface}
                    strokeWidth={stacked ? 2 : 0}
                    radius={!stacked || i === series.length - 1 ? [4, 4, 0, 0] : 0}
                    maxBarSize={stacked ? 28 : 18}
                    isAnimationActive={false}
                  />
                ))}
              </BarChart>
            )}
          </ResponsiveContainer>
        ) : null}
      </div>
      <ChartDataTable
        caption={title}
        rows={visibleRows}
        series={series}
        unit={unit}
        digits={digits}
      />
    </figure>
  );
}
