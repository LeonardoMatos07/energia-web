import type { GenerationMixPoint, GenerationSource } from "@/lib/api/types";
import { formatGWh, formatLongMonth, formatPercent } from "@/lib/format";
import { normalizeMonth } from "@/lib/series";

// Fixed hex fills: one recognisable colour per source, readable in both themes.
const SOURCES: Record<GenerationSource, { label: string; color: string }> = {
  hydro: { label: "Hidrelétrica", color: "#2f6fb5" },
  wind: { label: "Eólica", color: "#2a9d8f" },
  solar: { label: "Solar", color: "#e9a820" },
  thermal: { label: "Termelétrica", color: "#d9532f" },
};

// 24x24 line icons, drawn white on top of each slice.
const ICONS: Record<GenerationSource, string[]> = {
  hydro: ["M12 3C12 3 5 11 5 15a7 7 0 0 0 14 0C19 11 12 3 12 3Z"],
  wind: ["M12 12V22", "M12 12V3", "M12 12L19 16", "M12 12L5 16", "M9 22H15"],
  solar: [
    "M12 8a4 4 0 1 0 0.01 0Z",
    "M12 2V4",
    "M12 20V22",
    "M2 12H4",
    "M20 12H22",
    "M4.9 4.9L6.3 6.3",
    "M17.7 17.7L19.1 19.1",
    "M4.9 19.1L6.3 17.7",
    "M17.7 6.3L19.1 4.9",
  ],
  thermal: ["M12 3C13 8 18 10 18 15a6 6 0 0 1-12 0C6 12 8 11 9 9C10 11 11 11 12 3Z"],
};

const RADIUS = 100;

function polar(angle: number): [number, number] {
  return [RADIUS * Math.sin(angle), -RADIUS * Math.cos(angle)];
}

function slicePath(start: number, end: number): string {
  const [x1, y1] = polar(start);
  const [x2, y2] = polar(end);
  const large = end - start > Math.PI ? 1 : 0;
  return `M0 0 L${x1.toFixed(2)} ${y1.toFixed(2)} A${RADIUS} ${RADIUS} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`;
}

/** Brazilian electricity mix (share of generation by source) as a pie chart with a legend. */
export function GenerationMixPie({ points }: { points: GenerationMixPoint[] }) {
  const rows = points
    .filter((point) => point.subsystem === "SIN")
    .map((point) => ({ ...point, month: normalizeMonth(point.month) }));
  const month = rows
    .map((row) => row.month)
    .sort()
    .at(-1);
  const slices = rows
    .filter((row) => row.month === month && row.energy_mwh > 0)
    .sort((a, b) => b.energy_mwh - a.energy_mwh);
  const total = slices.reduce((sum, row) => sum + row.energy_mwh, 0);
  if (!month || total <= 0) return null;

  let angle = 0;
  const arcs = slices.map((row) => {
    const share = row.energy_mwh / total;
    const start = angle;
    angle += share * 2 * Math.PI;
    return { ...row, share, start, end: angle };
  });

  return (
    <div className="grid items-center gap-8 md:grid-cols-[minmax(0,320px)_1fr]">
      <svg
        viewBox="-104 -104 208 208"
        role="img"
        aria-label={`Matriz elétrica brasileira em ${formatLongMonth(month)}: ${arcs
          .map((arc) => `${SOURCES[arc.source].label} ${formatPercent(arc.share * 100)}`)
          .join(", ")}`}
        className="mx-auto w-full max-w-[320px]"
      >
        {arcs.length === 1 && arcs[0] ? (
          <circle r={RADIUS} style={{ fill: SOURCES[arcs[0].source].color }} />
        ) : (
          arcs.map((arc) => (
            <path
              key={arc.source}
              d={slicePath(arc.start, arc.end)}
              style={{ fill: SOURCES[arc.source].color, stroke: "var(--color-surface)" }}
              strokeWidth={2}
            />
          ))
        )}
        {arcs.map((arc) => {
          const size = Math.min(40, Math.max(24, arc.share * 120));
          const [cx, cy] = arcs.length === 1 ? [0, 0] : polar((arc.start + arc.end) / 2);
          const k = arcs.length === 1 ? 0 : 0.62;
          return (
            <g
              key={`icon-${arc.source}`}
              transform={`translate(${(cx * k - size / 2).toFixed(2)} ${(cy * k - size / 2).toFixed(2)}) scale(${(size / 24).toFixed(3)})`}
              fill="none"
              stroke="#ffffff"
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              {ICONS[arc.source].map((d) => (
                <path key={d} d={d} />
              ))}
            </g>
          );
        })}
      </svg>
      <ul className="space-y-3">
        {arcs.map((arc) => (
          <li key={arc.source} className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="h-4 w-4 shrink-0 rounded-sm"
              style={{ background: SOURCES[arc.source].color }}
            />
            <span className="flex-1 text-base font-medium">{SOURCES[arc.source].label}</span>
            <span className="tabular text-xl font-bold">{formatPercent(arc.share * 100)}</span>
            <span className="tabular text-ink-2 w-24 text-right text-sm">
              {formatGWh(arc.energy_mwh)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
