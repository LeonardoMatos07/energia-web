"use client";

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
import { CHART_INK, ENTITY_COLORS } from "@/components/charts/palette";
import { formatNumber } from "@/lib/format";
import { chartRows, type ChartSpec } from "@/lib/report-chart";

const HEIGHT = 280;

export function ReportChart({ spec }: { spec: ChartSpec }) {
  const rows = chartRows(spec);
  const unit = spec.unit ? ` ${spec.unit}` : "";
  const many = spec.series.length > 1;
  const axis = { stroke: CHART_INK.axis, fontSize: 12 };
  const common = {
    data: rows,
    margin: { top: 8, right: 8, bottom: 0, left: 0 },
  };
  const tooltip = (
    <Tooltip
      formatter={(value, name) => [`${formatNumber(Number(value), 1)}${unit}`, name]}
      contentStyle={{
        background: CHART_INK.surface,
        border: `1px solid ${CHART_INK.grid}`,
        borderRadius: 12,
      }}
    />
  );
  const grid = <CartesianGrid vertical={false} stroke={CHART_INK.grid} />;
  const xAxis = <XAxis dataKey="label" tickLine={false} tickMargin={8} interval={0} {...axis} />;
  const yAxis = (
    <YAxis
      width={56}
      tickLine={false}
      axisLine={false}
      tickFormatter={(v: number) => formatNumber(v, 0)}
      {...axis}
    />
  );
  const legend = many ? <Legend verticalAlign="top" height={28} iconType="square" /> : null;

  return (
    <figure className="not-prose my-8">
      <figcaption className="text-ink mb-2 text-base font-semibold">
        {spec.title}
        {spec.unit ? <span className="text-muted font-normal"> ({spec.unit})</span> : null}
      </figcaption>
      <div
        role="img"
        aria-label={`${spec.title}: ${spec.labels.join(", ")}`}
        style={{ height: HEIGHT }}
      >
        <ResponsiveContainer width="100%" height="100%">
          {spec.type === "line" ? (
            <LineChart {...common}>
              {grid}
              {xAxis}
              {yAxis}
              {tooltip}
              {legend}
              {spec.series.map((s, i) => (
                <Line
                  key={s.name}
                  name={s.name}
                  dataKey={`s${i}`}
                  stroke={ENTITY_COLORS[i]}
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              ))}
            </LineChart>
          ) : (
            <BarChart {...common}>
              {grid}
              {xAxis}
              {yAxis}
              {tooltip}
              {legend}
              {spec.series.map((s, i) => (
                <Bar
                  key={s.name}
                  name={s.name}
                  dataKey={`s${i}`}
                  fill={ENTITY_COLORS[i]}
                  stackId={spec.type === "stacked-bar" ? "total" : undefined}
                  radius={spec.type === "stacked-bar" ? 0 : [4, 4, 0, 0]}
                  isAnimationActive={false}
                />
              ))}
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
      <details className="text-ink-2 mt-2 text-sm">
        <summary className="cursor-pointer text-[var(--color-accent)] underline">
          Ver dados em tabela
        </summary>
        <div className="mt-2 max-h-80 overflow-auto rounded border border-[var(--color-grid)]">
          <table className="tabular w-full border-collapse text-left">
            <caption className="sr-only">{spec.title}</caption>
            <thead className="sticky top-0 bg-[var(--color-page)]">
              <tr>
                <th scope="col" className="px-3 py-2 font-semibold">
                  Período
                </th>
                {spec.series.map((s) => (
                  <th key={s.name} scope="col" className="px-3 py-2 text-right font-semibold">
                    {s.name}
                    {unit}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {spec.labels.map((label, index) => (
                <tr key={label} className="border-t border-[var(--color-grid)]">
                  <th scope="row" className="px-3 py-1.5 font-normal">
                    {label}
                  </th>
                  {spec.series.map((s) => (
                    <td key={s.name} className="px-3 py-1.5 text-right">
                      {formatNumber(s.values[index], 1)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </figure>
  );
}
