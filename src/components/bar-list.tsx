export interface BarItem {
  key: string;
  label: string;
  /** Bar length, 0 to max. */
  value: number;
  /** Text shown at the right (already formatted). */
  display: string;
  note?: string;
  color?: string;
}

/** Horizontal bars as a list: readable without colour (label + number) and with screen readers. */
export function BarList({
  items,
  max,
  label,
}: {
  items: readonly BarItem[];
  max?: number;
  label: string;
}) {
  const top = max ?? Math.max(...items.map((item) => item.value), 0);
  return (
    <ul aria-label={label} className="space-y-3">
      {items.map((item) => {
        const width = top > 0 ? Math.max(0, Math.min(100, (item.value / top) * 100)) : 0;
        return (
          <li key={item.key}>
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="text-ink font-medium">
                {item.label}
                {item.note ? <span className="text-muted ml-2 text-xs">{item.note}</span> : null}
              </span>
              <span className="tabular text-ink-2 shrink-0">{item.display}</span>
            </div>
            <div className="bg-surface-2 mt-1 h-2 overflow-hidden rounded-full" aria-hidden>
              <div
                className="h-full rounded-full"
                style={{ width: `${width}%`, background: item.color ?? "var(--color-series-1)" }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
