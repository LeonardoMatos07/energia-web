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
import { CHART_INK } from "@/components/charts/palette";
import type { CalibrationPoint } from "@/lib/forecast";
import { formatNumber } from "@/lib/format";

export interface ReliabilitySeries {
  key: string;
  label: string;
  color: string;
  description: string;
  dashed?: boolean;
  points: CalibrationPoint[];
}


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
      <figcaption className="mb-4 grid gap-3 sm:grid-cols-3">
        {series.map((item) => (
          <div key={item.key} className="flex items-start gap-3 text-sm">
            <svg aria-hidden width="28" height="12" className="mt-1.5 shrink-0">
              <line
                x1="2"
                x2="26"
                y1="6"
                y2="6"
                style={{ stroke: item.color, strokeWidth: 3 }}
                strokeDasharray={item.dashed ? "5 3" : undefined}
              />
              <circle cx="14" cy="6" r="3.5" style={{ fill: item.color }} />
            </svg>
            <span className="text-ink-2">
              <strong className="text-ink">{item.label}.</strong> {item.description}
            </span>
          </div>
        ))}
        <div className="flex items-start gap-3 text-sm">
          <svg aria-hidden width="28" height="12" className="mt-1.5 shrink-0">
            <line
              x1="2"
              x2="26"
              y1="6"
              y2="6"
              style={{ stroke: "var(--color-ink-2)", strokeWidth: 1.5 }}
              strokeDasharray="4 3"
            />
          </svg>
          <span className="text-ink-2">
            <strong className="text-ink">Previsão perfeita.</strong> Onde ficaria uma linha que
            acerta sempre: o risco previsto igual ao que aconteceu.
          </span>
        </div>
      </figcaption>
      <div
        className="relative"
        style={{ height }}
        role="img"
        aria-label="Gráfico de confiabilidade: risco previsto contra a frequência observada de horas com corte"
      >
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart margin={{ top: 12, right: 16, left: 16, bottom: 24 }}>
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
                  value: "Risco previsto pelo método (%)",
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
                label={{
                  value: "Horas com corte de fato (%)",
                  angle: -90,
                  position: "insideLeft",
                  offset: 4,
                  fill: CHART_INK.axis,
                  fontSize: 12,
                  style: { textAnchor: "middle" },
                }}
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
                stroke="var(--color-ink-2)"
                strokeOpacity={0.8}
                strokeWidth={1.5}
                strokeDasharray="4 3"
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
                  strokeDasharray={item.dashed ? "6 4" : undefined}
                  dot={{ r: 4, fill: item.color, stroke: item.color, strokeWidth: 1 }}
                  activeDot={{ r: 6, fill: item.color }}
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
