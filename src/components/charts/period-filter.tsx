"use client";

import { monthSpan, shiftMonth } from "@/lib/series";
import { MonthPicker } from "./month-picker";

const PRESETS = [
  { label: "12 meses", months: 12 },
  { label: "2 anos", months: 24 },
] as const;

const LATEST_PRESET = { label: "Último mês", months: 1 } as const;

export function PeriodFilter({
  first,
  last,
  start,
  end,
  onChange,
  includeLatest = false,
  label = "Período do gráfico",
  className = "mt-4",
}: {
  first: string;
  last: string;
  start: string;
  end: string;
  onChange: (start: string, end: string) => void;
  includeLatest?: boolean;
  label?: string;
  className?: string;
}) {
  const span = monthSpan(first, last);
  const presets = [...(includeLatest ? [LATEST_PRESET] : []), ...PRESETS].filter(
    (preset) => span > preset.months,
  );
  const isActive = (months: number | null) =>
    end === last && start === (months === null ? first : shiftMonth(last, -(months - 1)));
  const chip = (active: boolean) =>
    `rounded-md px-2.5 py-1 text-sm font-medium transition-colors ${
      active ? "bg-accent text-on-accent" : "text-ink-2 hover:bg-surface-2"
    }`;

  return (
    <div
      role="group"
      aria-label={label}
      className={`flex flex-wrap items-center gap-x-4 gap-y-2 ${className}`}
    >
      <div className="border-line bg-surface inline-flex gap-1 rounded-lg border p-1">
        {presets.map((preset) => (
          <button
            key={preset.months}
            type="button"
            aria-pressed={isActive(preset.months)}
            className={chip(isActive(preset.months))}
            onClick={() => onChange(shiftMonth(last, -(preset.months - 1)), last)}
          >
            {preset.label}
          </button>
        ))}
        <button
          type="button"
          aria-pressed={isActive(null)}
          className={chip(isActive(null))}
          onClick={() => onChange(first, last)}
        >
          Tudo
        </button>
      </div>
      <MonthPicker
        label="De"
        value={start}
        min={first}
        max={end}
        onChange={(month) => onChange(month, end)}
      />
      <MonthPicker
        label="Até"
        value={end}
        min={start}
        max={last}
        onChange={(month) => onChange(start, month)}
      />
    </div>
  );
}
