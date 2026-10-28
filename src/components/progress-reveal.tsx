"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

const TICK_MS = 100;
const PAUSE_AT_END_MS = 250;

export const STAGES = [
  { until: 30, label: "Carregando o modelo treinado…" },
  { until: 60, label: "Lendo os resultados dos testes…" },
  { until: 90, label: "Preparando a previsão dos próximos 7 dias…" },
  { until: 100, label: "Montando os gráficos…" },
] as const;

export function stageLabel(percent: number): string {
  return (STAGES.find((stage) => percent < stage.until) ?? STAGES[STAGES.length - 1]!).label;
}

function alreadySeen(storageKey: string): boolean {
  try {
    return (
      window.sessionStorage.getItem(storageKey) === "1" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  } catch {
    return false;
  }
}

/**
 * Shows a progress bar that fills from 0 to 100% in `seconds`, then reveals the content.
 *
 * The content is already on the page (the server rendered it), so this is pacing, not loading:
 * it only runs the first time in a browser session, never again when a filter changes, can be
 * skipped, and is skipped for people who ask their system for less motion. Without JavaScript
 * the content is shown at once.
 */
export function ProgressReveal({
  seconds = 10,
  storageKey = "spillway-previsao-loaded",
  children,
}: {
  seconds?: number;
  storageKey?: string;
  children: ReactNode;
}) {
  const [percent, setPercent] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const started = useRef<number | null>(null);

  function reveal() {
    try {
      window.sessionStorage.setItem(storageKey, "1");
    } catch {
      // Private mode: it just runs again next time.
    }
    setRevealed(true);
  }

  useEffect(() => {
    if (alreadySeen(storageKey)) {
      setRevealed(true);
      return;
    }
    started.current = Date.now();
    let pause: ReturnType<typeof setTimeout> | undefined;
    const timer = setInterval(() => {
      const elapsed = Date.now() - (started.current ?? Date.now());
      const next = Math.min(100, (elapsed / (seconds * 1000)) * 100);
      setPercent(next);
      if (next >= 100) {
        clearInterval(timer);
        pause = setTimeout(reveal, PAUSE_AT_END_MS);
      }
    }, TICK_MS);
    return () => {
      clearInterval(timer);
      if (pause) clearTimeout(pause);
    };
    // reveal only touches storage and state; the timer must not restart when it changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seconds, storageKey]);

  const rounded = Math.round(percent);
  return (
    <>
      {revealed ? null : (
        <div
          role="status"
          aria-live="polite"
          className="border-grid bg-surface mx-auto my-10 max-w-xl rounded-2xl border p-6 sm:p-8"
        >
          <p className="text-ink font-semibold">{stageLabel(percent)}</p>
          <div
            role="progressbar"
            aria-label="Carregando a previsão"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={rounded}
            className="bg-surface-2 mt-4 h-3 w-full overflow-hidden rounded-full"
          >
            <div
              className="bg-accent h-full rounded-full transition-[width] duration-100 ease-linear"
              style={{ width: `${percent}%` }}
            />
          </div>
          <div className="text-ink-2 mt-3 flex items-center justify-between text-sm">
            <span className="tabular">{rounded}%</span>
            <button
              type="button"
              onClick={reveal}
              className="text-accent underline underline-offset-2 hover:opacity-80"
            >
              Mostrar agora
            </button>
          </div>
        </div>
      )}
      <noscript>
        <style>{"[data-progress-content]{display:block !important}"}</style>
      </noscript>
      <div
        data-progress-content
        hidden={!revealed}
        style={revealed ? undefined : { display: "none" }}
      >
        {children}
      </div>
    </>
  );
}
