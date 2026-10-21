"use client";

import { useEffect, useId, useRef, useState } from "react";
import { formatShortMonth, SHORT_MONTHS } from "@/lib/format";

export interface MonthPickerProps {
  label: string;
  value: string;
  min: string;
  max: string;
  onChange: (month: string) => void;
}

function Chevron({ direction }: { direction: "left" | "right" | "down" }) {
  const rotation = { left: "rotate(90 10 10)", right: "rotate(-90 10 10)", down: "" }[direction];
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="size-4 shrink-0">
      <path
        d="M5 8l5 5 5-5"
        transform={rotation}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function MonthPicker({ label, value, min, max, onChange }: MonthPickerProps) {
  const [open, setOpen] = useState(false);
  const [year, setYear] = useState(() => Number(value.slice(0, 4)));
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const dialogId = useId();
  const minYear = Number(min.slice(0, 4));
  const maxYear = Number(max.slice(0, 4));

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      trigger.current?.focus();
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function toggle() {
    if (!open) setYear(Number(value.slice(0, 4)));
    setOpen(!open);
  }

  function pick(monthIndex: number) {
    onChange(`${year}-${String(monthIndex + 1).padStart(2, "0")}`);
    setOpen(false);
    trigger.current?.focus();
  }

  const arrow =
    "text-ink-2 hover:bg-surface-2 hover:text-ink inline-flex size-8 items-center justify-center rounded-md disabled:pointer-events-none disabled:opacity-30";

  return (
    <div ref={root} className="relative flex items-center gap-2">
      <span className="text-ink-2 text-sm">{label}</span>
      <button
        ref={trigger}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? dialogId : undefined}
        aria-label={`${label}: ${formatShortMonth(value)}. Escolher mês`}
        onClick={toggle}
        className="border-line bg-surface text-ink hover:border-accent focus-visible:border-accent inline-flex items-center gap-2 rounded-lg border py-1.5 pr-2 pl-3 text-sm font-medium tabular-nums"
      >
        <span className="capitalize">{formatShortMonth(value)}</span>
        <span className="text-muted">
          <Chevron direction="down" />
        </span>
      </button>
      {open ? (
        <div
          id={dialogId}
          role="dialog"
          aria-label={`${label}: escolher mês e ano`}
          className="border-line bg-surface shadow-card absolute top-full left-0 z-20 mt-2 w-64 rounded-xl border p-3 shadow-lg"
        >
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              aria-label="Ano anterior"
              className={arrow}
              disabled={year <= minYear}
              onClick={() => setYear(year - 1)}
            >
              <Chevron direction="left" />
            </button>
            <span className="font-display text-base font-bold tabular-nums">{year}</span>
            <button
              type="button"
              aria-label="Próximo ano"
              className={arrow}
              disabled={year >= maxYear}
              onClick={() => setYear(year + 1)}
            >
              <Chevron direction="right" />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-1">
            {SHORT_MONTHS.map((name, index) => {
              const month = `${year}-${String(index + 1).padStart(2, "0")}`;
              const selected = month === value;
              return (
                <button
                  key={name}
                  type="button"
                  disabled={month < min || month > max}
                  aria-pressed={selected}
                  onClick={() => pick(index)}
                  className={`rounded-lg py-2 text-sm font-medium capitalize disabled:pointer-events-none disabled:opacity-30 ${
                    selected ? "bg-accent text-on-accent" : "text-ink hover:bg-accent-soft"
                  }`}
                >
                  {name}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
