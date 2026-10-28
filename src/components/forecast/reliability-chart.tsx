"use client";

import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CHART_INK, SERIES } from "@/components/charts/palette";
import type { CalibrationPoint } from "@/lib/forecast";
import { formatNumber } from "@/lib/format";

export interface ReliabilitySeries {
  key: string;
  label: string;
  color: string;
  points: CalibrationPoint[];
}

export const RELIABILITY_COLORS = { model: SERIES.s3, baseline: SERIES.s2 } as const;

const TICKS = [0, 25, 50, 75, 100];

export function ReliabilityChart({
  series,
  height = 320,
}: {
  series: readonly ReliabilitySeries[];
  height?: number;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <figure className="border-grid bg-surface shadow-card rounded-2xl border p-4 sm:p-6">
      <figcaption className="mb-3 flex flex-wrap items-center gap-x-5 gap-y-1">
        {series.map((item) => (
          <span key={item.key} className="text-ink-2 flex items-center gap-2 text-sm">
            <span
              aria-hidden
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ background: item.color }}
            />
            {item.label}
          </span>
        ))}
        <span className="text-ink-2 flex items-center gap-2 text-sm">
          <span
            aria-hidden
            className="inline-block h-0.5 w-4"
            style={{ background: CHART_INK.baseline }}
          />
          Previsão perfeita
        </span>
      </figcaption>
      <div
        className="relative"
        style={{ height }}
        role="img"
        aria-label="Gráfico de confiabilidade: risco previsto contra a frequência observada de horas com corte"
      >
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart margin={{ top: 12, right: 16, left: 4, bottom: 24 }}>
              <CartesianGrid stroke={CHART_INK.grid} strokeDasharray="3 5" />
              <XAxis
                type="number"
                dataKey="predicted"
                domain={[0, 100]}
                ticks={TICKS}
                tickFormatter={(v: number) => `${v}%`}
                tickLine={false}
                axisLine={{ stroke: CHART_INK.baseline }}
                tick={{ fill: CHART_INK.axis, fontSize: 12 }}
                label={{
                  value: "Risco previsto",
                  position: "insideBottom",
                  offset: -14,
                  fill: CHART_INK.axis,
                  fontSize: 12,
                }}
              />
              <YAxis
                type="number"
                dataKey="observed"
                domain={[0, 100]}
                ticks={TICKS}
                width={48}
                tickFormatter={(v: number) => `${v}%`}
                tickLine={false}
                axisLine={false}
                tick={{ fill: CHART_INK.axis, fontSize: 12 }}
              />
              <ReferenceLine
                segment={[
                  { x: 0, y: 0 },
                  { x: 100, y: 100 },
                ]}
                stroke={CHART_INK.baseline}
                strokeDasharray="4 4"
              />
              <Tooltip
                content={(props) => {
                  if (!props.active || !props.payload?.length) return null;
                  const entry = props.payload[0];
                  const point = entry?.payload as CalibrationPoint | undefined;
                  if (!point) return null;
                  return (
                    <div className="border-grid bg-surface rounded-xl border px-4 py-3 text-sm shadow-lg">
                      <p className="font-semibold">{entry?.name}</p>
                      <p className="tabular text-ink-2">
                        Previsto: {formatNumber(point.predicted, 0)}%. Observado:{" "}
                        {formatNumber(point.observed, 0)}%
                      </p>
                      <p className="tabular text-muted">{formatNumber(point.n, 0)} horas</p>
                    </div>
                  );
                }}
              />
              {series.map((item) => (
                <Line
                  key={item.key}
                  data={item.points}
                  name={item.label}
                  dataKey="observed"
                  stroke={item.color}
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: item.color }}
                  isAnimationActive={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        ) : null}
      </div>
    </figure>
  );
}
