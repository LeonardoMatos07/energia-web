"use client";

import { useId, useState, type KeyboardEvent, type ReactNode } from "react";

export interface TabPanel {
  key: string;
  label: string;
  content: ReactNode;
}

/** Accessible tabs (WAI-ARIA pattern). All panels are server-rendered; only visibility changes. */
export function Tabs({
  panels,
  label,
  initial,
}: {
  panels: TabPanel[];
  label: string;
  initial?: string;
}) {
  const [active, setActive] = useState(initial ?? panels[0]?.key);
  const id = useId();

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const delta = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (!delta) return;
    event.preventDefault();
    const next = panels[(index + delta + panels.length) % panels.length];
    if (next) {
      setActive(next.key);
      document.getElementById(`${id}-tab-${next.key}`)?.focus();
    }
  }

  return (
    <div>
      <div
        role="tablist"
        aria-label={label}
        className="border-line bg-surface inline-flex flex-wrap gap-1 rounded-lg border p-1"
      >
        {panels.map((p, i) => {
          const selected = p.key === active;
          return (
            <button
              key={p.key}
              id={`${id}-tab-${p.key}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`${id}-panel-${p.key}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(p.key)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                selected
                  ? "bg-accent text-on-accent"
                  : "text-[var(--color-ink-2)] hover:bg-[var(--color-page)]"
              }`}
            >
              {p.label}
            </button>
          );
        })}
      </div>
      {panels.map((p) => (
        <div
          key={p.key}
          id={`${id}-panel-${p.key}`}
          role="tabpanel"
          aria-labelledby={`${id}-tab-${p.key}`}
          hidden={p.key !== active}
          className="mt-4"
        >
          {p.content}
        </div>
      ))}
    </div>
  );
}
