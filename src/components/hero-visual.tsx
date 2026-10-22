import { AnimatedNumber } from "@/components/animated-number";

export interface HeroPoint {
  label: string;
  value: number;
}

const WIDTH = 520;
const HEIGHT = 240;
const PAD = { top: 18, right: 20, bottom: 30, left: 12 };
const GRID_LINES = 3;

function smoothPath(points: readonly [number, number][]): string {
  if (points.length < 2) return "";
  const first = points[0]!;
  let path = `M ${first[0].toFixed(1)} ${first[1].toFixed(1)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i]!;
    const p1 = points[i]!;
    const p2 = points[i + 1]!;
    const p3 = points[i + 2] ?? p2;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    path += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return path;
}

export function HeroChart({
  points,
  unit,
  caption,
  title,
}: {
  points: readonly HeroPoint[];
  unit: string;
  caption: string;
  title: string;
}) {
  if (points.length < 2) return null;
  const last = points[points.length - 1]!;
  const first = points[0]!;
  const max = Math.max(...points.map((point) => point.value)) * 1.12;
  const innerWidth = WIDTH - PAD.left - PAD.right;
  const innerHeight = HEIGHT - PAD.top - PAD.bottom;
  const coordinates = points.map((point, index): [number, number] => [
    PAD.left + (index / (points.length - 1)) * innerWidth,
    PAD.top + innerHeight - (point.value / max) * innerHeight,
  ]);
  const line = smoothPath(coordinates);
  const end = coordinates[coordinates.length - 1]!;
  const baseline = PAD.top + innerHeight;
  const area = `${line} L ${end[0].toFixed(1)} ${baseline} L ${PAD.left} ${baseline} Z`;

  return (
    <figure className="hero-float border-grid bg-surface/80 shadow-card rounded-3xl border p-5 backdrop-blur-md sm:p-6">
      <figcaption>
        <p className="text-ink-2 text-sm">{title}</p>
        <p className="font-display text-ink mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
          <AnimatedNumber value={last.value} suffix={` ${unit}`} />
        </p>
      </figcaption>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label={`${title}: de ${first.label} a ${last.label}, ${caption}`}
        className="mt-3 h-auto w-full"
      >
        <defs>
          <linearGradient id="hero-area" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.32" />
            <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {Array.from({ length: GRID_LINES + 1 }, (_, index) => {
          const y = PAD.top + (innerHeight / GRID_LINES) * index;
          return (
            <line
              key={index}
              x1={PAD.left}
              x2={WIDTH - PAD.right}
              y1={y}
              y2={y}
              stroke="var(--color-grid)"
              strokeWidth="1"
              strokeDasharray={index === GRID_LINES ? undefined : "3 5"}
            />
          );
        })}
        <path d={area} fill="url(#hero-area)" className="chart-area" />
        <path
          d={line}
          pathLength={1}
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="chart-line"
        />
        <g className="chart-dot">
          <circle
            cx={end[0]}
            cy={end[1]}
            r="5"
            className="chart-pulse"
            fill="var(--color-brand-drop)"
          />
          <circle
            cx={end[0]}
            cy={end[1]}
            r="5.5"
            fill="var(--color-brand-drop)"
            stroke="var(--color-surface)"
            strokeWidth="2"
          />
        </g>
        <text x={PAD.left} y={HEIGHT - 8} fill="var(--color-muted)" fontSize="12">
          {first.label}
        </text>
        <text
          x={WIDTH - PAD.right}
          y={HEIGHT - 8}
          fill="var(--color-muted)"
          fontSize="12"
          textAnchor="end"
        >
          {last.label}
        </text>
      </svg>
      <p className="text-muted mt-1 text-xs">{caption}</p>
    </figure>
  );
}

export function HeroBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="hero-blob absolute -top-24 -left-20 size-96 rounded-full bg-[var(--color-series-1)] opacity-25 blur-3xl" />
      <div
        className="hero-blob absolute top-10 -right-24 size-80 rounded-full bg-[var(--color-series-2)] opacity-20 blur-3xl"
        style={{ animationDelay: "-6s" }}
      />
      <div
        className="hero-blob absolute right-1/3 -bottom-24 size-72 rounded-full bg-[var(--color-brand-drop)] opacity-15 blur-3xl"
        style={{ animationDelay: "-11s" }}
      />
      <svg
        className="hero-wave absolute bottom-0 left-0 h-24 text-[var(--color-accent)] opacity-20"
        viewBox="0 0 2880 96"
        preserveAspectRatio="none"
      >
        <path
          id="hero-wave-a"
          fill="currentColor"
          d="M0 48 C 120 16, 240 16, 360 48 S 600 80, 720 48 S 960 16, 1080 48 S 1320 80, 1440 48 L 1440 96 L 0 96 Z"
        />
        <use href="#hero-wave-a" x="1440" />
      </svg>
      <svg
        className="hero-wave hero-wave-slow absolute bottom-0 left-0 h-16 text-[var(--color-series-2)] opacity-15"
        viewBox="0 0 2880 96"
        preserveAspectRatio="none"
      >
        <path
          id="hero-wave-b"
          fill="currentColor"
          d="M0 56 C 120 80, 240 80, 360 56 S 600 24, 720 56 S 960 88, 1080 56 S 1320 24, 1440 56 L 1440 96 L 0 96 Z"
        />
        <use href="#hero-wave-b" x="1440" />
      </svg>
    </div>
  );
}
