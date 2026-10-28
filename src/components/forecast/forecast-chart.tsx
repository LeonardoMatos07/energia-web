"use client";

import { useEffect, useMemo, useState } from "react";
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
import type { ForecastPoint } from "@/lib/api/types";
import { chartRows, formatDay } from "@/lib/forecast";
import { formatPercent } from "@/lib/format";

export function ForecastChart({
  points,
  height = 280,
}: {
  points: readonly ForecastPoint[];
  height?: number;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const rows = useMemo(() => chartRows(points), [points]);
  const midnights = useMemo(
    () => rows.filter((row) => row.ts.slice(11, 13) === "00").map((row) => row.ts),
    [rows],
  );

  return (
    <figure className="border-grid bg-surface shadow-card rounded-2xl border p-4 sm:p-6">
      <figcaption className="text-ink-2 mb-3 text-sm">
        Corte esperado por hora, em % da geração possível. As linhas verticais marcam a meia-noite
        de cada dia; horas sem geração esperada (solar à noite) ficam em branco.
      </figcaption>
      <div
        className="relative"
        style={{ height }}
        role="img"
        aria-label="Corte esperado de energia, em porcentagem, hora a hora nos próximos dias"
      >
        <span className="text-ink-2 absolute top-0 left-0 text-sm font-semibold">
          % da geração possível
        </span>
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={rows} margin={{ top: 28, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid stroke={CHART_INK.grid} strokeDasharray="3 5" vertical={false} />
              {midnights.map((ts) => (
                <ReferenceLine key={ts} x={ts} stroke={CHART_INK.baseline} strokeDasharray="2 4" />
              ))}
              <XAxis
                dataKey="ts"
                tickFormatter={(ts: string) => formatDay(ts)}
                ticks={midnights}
                tickLine={false}
                axisLine={{ stroke: CHART_INK.baseline }}
                tick={{ fill: CHART_INK.axis, fontSize: 12 }}
              />
              <YAxis
                width={44}
                domain={[0, "auto"]}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value: number) => `${Math.round(value)}%`}
                tick={{ fill: CHART_INK.axis, fontSize: 12 }}
              />
              <Tooltip
                cursor={{ stroke: CHART_INK.baseline }}
                content={(props) => {
                  if (!props.active || !props.payload?.length) return null;
                  const row = props.payload[0]?.payload as (typeof rows)[number] | undefined;
                  if (!row) return null;
                  return (
                    <div className="border-grid bg-surface min-w-44 rounded-xl border px-4 py-3 text-sm shadow-lg">
                      <p className="mb-1 font-semibold">
                        {formatDay(row.ts)} às {row.ts.slice(11, 13)}h
                      </p>
                      <p className="tabular text-ink-2">
                        Corte esperado:{" "}
                        <span className="text-ink font-medium">
                          {row.expected === null ? "não se aplica" : formatPercent(row.expected, 0)}
                        </span>
                      </p>
                      <p className="tabular text-ink-2">
                        Risco de corte relevante:{" "}
                        <span className="text-ink font-medium">
                          {row.risk === null ? "—" : formatPercent(row.risk, 0)}
                        </span>
                      </p>
                    </div>
                  );
                }}
              />
              <Line
                type="monotone"
                dataKey="expected"
                name="Corte esperado"
                stroke={SERIES.s3}
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 4 }}
                isAnimationActive={false}
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : null}
      </div>
    </figure>
  );
}
