"use client";

import { useEffect, useState } from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatNumber } from "@/lib/format";
import { CHART_INK } from "./palette";

export interface SeriesDef {
  key: string;
  label: string;
  color: string;
  /** "area" series are stacked on each other; "line" series are drawn on top. */
  type: "area" | "line";
  dashed?: boolean;
}

/** A row is a point in time: `label` is shown on the axis and in the tooltip. */
export type SeriesRow = { label: string } & Record<string, number | string | null | undefined>;

/**
 * Time-series chart for hourly or daily data: stacked areas and/or lines. Colours come from the
 * caller (theme tokens or fixed hex), a legend and a text summary sit next to the picture.
 */
export function SeriesChart({
  title,
  summary,
  rows,
  series,
  unit,
  digits = 0,
  height = 300,
  tickEvery,
}: {
  title: string;
  summary: string;
  rows: SeriesRow[];
  series: SeriesDef[];
  unit: string;
  digits?: number;
  height?: number;
  /** Show one axis label every N points. */
  tickEvery?: number;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <figure className="border-grid bg-surface shadow-card rounded-2xl border p-4 sm:p-6">
      <figcaption>
        <p className="font-semibold">{title}</p>
        <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1">
          {series.map((item) => (
            <li key={item.key} className="text-ink-2 flex items-center gap-2 text-sm">
              <span
                aria-hidden
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ background: item.color }}
              />
              {item.label}
            </li>
          ))}
        </ul>
      </figcaption>
      <div
        className="relative mt-3"
        style={{ height }}
        role="img"
        aria-label={`${title}. ${summary}`}
      >
        <span className="text-ink-2 absolute top-0 left-0 text-xs">{unit}</span>
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={rows} margin={{ top: 22, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid stroke={CHART_INK.grid} strokeDasharray="3 5" vertical={false} />
              <XAxis
                dataKey="label"
                interval={tickEvery ? tickEvery - 1 : "preserveStartEnd"}
                minTickGap={28}
                tickLine={false}
                axisLine={{ stroke: CHART_INK.baseline }}
                tick={{ fill: CHART_INK.axis, fontSize: 12 }}
              />
              <YAxis
                width={52}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value: number) => formatNumber(value, digits)}
                tick={{ fill: CHART_INK.axis, fontSize: 12 }}
              />
              <Tooltip
                cursor={{ stroke: CHART_INK.baseline }}
                content={(props) => {
                  if (!props.active || !props.payload?.length) return null;
                  return (
                    <div className="border-grid bg-surface min-w-44 rounded-xl border px-4 py-3 text-sm shadow-lg">
                      <p className="mb-1 font-semibold">{props.label}</p>
                      <ul className="tabular space-y-0.5">
                        {props.payload.map((entry) => (
                          <li key={String(entry.dataKey)} className="flex items-center gap-2">
                            <span
                              aria-hidden
                              className="inline-block h-2.5 w-2.5 rounded-sm"
                              style={{ background: entry.color }}
                            />
                            <span className="text-ink-2">{entry.name}</span>
                            <span className="ml-auto pl-3 font-medium">
                              {typeof entry.value === "number"
                                ? `${formatNumber(entry.value, digits)} ${unit}`
                                : "—"}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                }}
              />
              {series
                .filter((item) => item.type === "area")
                .map((item) => (
                  <Area
                    key={item.key}
                    type="monotone"
                    dataKey={item.key}
                    name={item.label}
                    stackId="stack"
                    stroke={item.color}
                    fill={item.color}
                    fillOpacity={0.55}
                    strokeWidth={1}
                    isAnimationActive={false}
                  />
                ))}
              {series
                .filter((item) => item.type === "line")
                .map((item) => (
                  <Line
                    key={item.key}
                    type="monotone"
                    dataKey={item.key}
                    name={item.label}
                    stroke={item.color}
                    strokeWidth={2.5}
                    strokeDasharray={item.dashed ? "6 4" : undefined}
                    dot={false}
                    activeDot={{ r: 4 }}
                    isAnimationActive={false}
                    connectNulls
                  />
                ))}
            </ComposedChart>
          </ResponsiveContainer>
        ) : null}
      </div>
      <p className="text-muted mt-2 text-xs">{summary}</p>
    </figure>
  );
}
