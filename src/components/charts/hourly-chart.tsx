"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { HourlyPoint } from "@/lib/api/types";
import { formatNumber } from "@/lib/format";
import { CHART_INK, SERIES } from "./palette";

const HOURS = Array.from({ length: 24 }, (_, hour) => hour);
const SERIES_DEFS = [
  { key: "weekday", label: "Dias úteis", color: SERIES.s1 },
  { key: "weekend", label: "Fins de semana", color: SERIES.s3 },
] as const;

interface Row {
  hour: number;
  weekday: number | null;
  weekend: number | null;
}

export function HourlyChart({
  points,
  height = 320,
}: {
  points: readonly HourlyPoint[];
  height?: number;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const rows = useMemo<Row[]>(() => {
    const value = (dayType: string, hour: number) => {
      const point = points.find((p) => p.day_type === dayType && p.hour === hour);
      return point ? point.avg_curtailed_mwh / 1000 : null;
    };
    return HOURS.map((hour) => ({
      hour,
      weekday: value("weekday", hour),
      weekend: value("weekend", hour),
    }));
  }, [points]);

  return (
    <figure className="border-grid bg-surface shadow-card rounded-2xl border p-4 sm:p-6">
      <figcaption className="mb-3 flex flex-wrap items-center gap-x-5 gap-y-1">
        {SERIES_DEFS.map((series) => (
          <span key={series.key} className="text-ink-2 flex items-center gap-2 text-sm">
            <span
              aria-hidden
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ background: series.color }}
            />
            {series.label}
          </span>
        ))}
      </figcaption>
      <div
        className="relative"
        style={{ height }}
        role="img"
        aria-label="Energia cortada em média a cada hora do dia, em dias úteis e em fins de semana"
      >
        <span className="text-ink-2 absolute top-0 left-0 text-sm font-semibold">GWh por hora</span>
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={rows} margin={{ top: 28, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid stroke={CHART_INK.grid} strokeDasharray="3 5" vertical={false} />
              <XAxis
                dataKey="hour"
                tickFormatter={(hour: number) => `${hour}h`}
                interval={2}
                tickLine={false}
                axisLine={{ stroke: CHART_INK.baseline }}
                tick={{ fill: CHART_INK.axis, fontSize: 12 }}
              />
              <YAxis
                width={44}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value: number) => formatNumber(value, 0)}
                tick={{ fill: CHART_INK.axis, fontSize: 12 }}
              />
              <Tooltip
                cursor={{ stroke: CHART_INK.baseline }}
                content={(props) => {
                  if (!props.active || !props.payload?.length) return null;
                  return (
                    <div className="border-grid bg-surface min-w-44 rounded-xl border px-4 py-3 text-sm shadow-lg">
                      <p className="mb-1 font-semibold">{props.label}h</p>
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
                                ? `${formatNumber(entry.value, 2)} GWh`
                                : "—"}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                }}
              />
              {SERIES_DEFS.map((series) => (
                <Line
                  key={series.key}
                  type="monotone"
                  dataKey={series.key}
                  name={series.label}
                  stroke={series.color}
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 4 }}
                  isAnimationActive={false}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        ) : null}
      </div>
    </figure>
  );
}
