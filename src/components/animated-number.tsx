"use client";

import { useEffect, useState } from "react";

const DURATION_MS = 1600;

export function AnimatedNumber({
  value,
  digits = 1,
  suffix = "",
}: {
  value: number;
  digits?: number;
  suffix?: string;
}) {
  const [shown, setShown] = useState(value);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const startedAt = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - startedAt) / DURATION_MS, 1);
      setShown(value * (1 - Math.pow(1 - progress, 3)));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return (
    <span className="tabular">
      {new Intl.NumberFormat("pt-BR", {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
      }).format(shown)}
      {suffix}
    </span>
  );
}
