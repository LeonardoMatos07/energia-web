export interface Histogram {
  /** Lower edge of every bin, plus the upper edge of the last one. */
  edges: number[];
  counts: number[];
  labels: string[];
}

function label(value: number): string {
  return Number(value.toPrecision(3)).toString();
}

/** Equal-width bins over [min, max]; the last bin includes the maximum. */
export function histogram(values: readonly (number | null)[], bins: number): Histogram | null {
  const data = values.filter((value): value is number => value !== null && Number.isFinite(value));
  if (data.length === 0) return null;
  const count = Math.max(1, Math.min(200, Math.floor(bins)));
  const min = Math.min(...data);
  const max = Math.max(...data);
  if (min === max) {
    return { edges: [min, max], counts: [data.length], labels: [label(min)] };
  }
  const width = (max - min) / count;
  const edges = Array.from({ length: count + 1 }, (_, i) => (i === count ? max : min + i * width));
  const counts = Array<number>(count).fill(0);
  for (const value of data) {
    counts[Math.min(count - 1, Math.floor((value - min) / width))]! += 1;
  }
  const labels = counts.map((_, i) => `${label(edges[i]!)} – ${label(edges[i + 1]!)}`);
  return { edges, counts, labels };
}

export interface BoxStats {
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  /** Whiskers reach the furthest points within 1.5 × IQR of the box; the rest are outliers. */
  outliers: number[];
  n: number;
}

/** Quantile by linear interpolation, the same default as NumPy. */
export function quantile(sorted: readonly number[], p: number): number {
  const position = (sorted.length - 1) * p;
  const lower = Math.floor(position);
  const upper = Math.ceil(position);
  return sorted[lower]! + (sorted[upper]! - sorted[lower]!) * (position - lower);
}

export function boxStats(values: readonly (number | null)[]): BoxStats | null {
  const sorted = values
    .filter((value): value is number => value !== null && Number.isFinite(value))
    .sort((a, b) => a - b);
  if (sorted.length === 0) return null;
  const q1 = quantile(sorted, 0.25);
  const q3 = quantile(sorted, 0.75);
  const fence = 1.5 * (q3 - q1);
  const inside = sorted.filter((value) => value >= q1 - fence && value <= q3 + fence);
  return {
    min: inside[0]!,
    q1,
    median: quantile(sorted, 0.5),
    q3,
    max: inside[inside.length - 1]!,
    outliers: sorted.filter((value) => value < q1 - fence || value > q3 + fence),
    n: sorted.length,
  };
}
