"use client";

import { useEffect, useRef, useState } from "react";
import type { ChartOption } from "@/lib/plotter/figure";

type Instance = {
  setOption: (option: ChartOption, notMerge?: boolean) => void;
  resize: () => void;
  dispose: () => void;
};

/**
 * Draws a chart. `build` receives the page's text color, so the chart follows the light and dark
 * theme; it is called again when the theme attribute on <html> changes. ECharts is loaded on
 * demand, so the page is interactive before the library arrives.
 */
export function EChart({
  build,
  height = 420,
  label = "Gráfico",
}: {
  build: (ink: string) => ChartOption;
  height?: number;
  label?: string;
}) {
  const host = useRef<HTMLDivElement>(null);
  const instance = useRef<Instance | null>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [theme, setTheme] = useState(0);

  useEffect(() => {
    const element = host.current;
    if (!element) return;
    let cancelled = false;
    let observer: ResizeObserver | null = null;
    import("@/lib/plotter/echarts")
      .then(({ echarts }) => {
        if (cancelled) return;
        instance.current = echarts.init(element, undefined, { renderer: "canvas" }) as Instance;
        observer = new ResizeObserver(() => instance.current?.resize());
        observer.observe(element);
        setReady(true);
      })
      .catch(() => setFailed(true));
    return () => {
      cancelled = true;
      observer?.disconnect();
      instance.current?.dispose();
      instance.current = null;
    };
  }, []);

  useEffect(() => {
    const observer = new MutationObserver(() => setTheme((value) => value + 1));
    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const element = host.current;
    if (!ready || !element || !instance.current) return;
    instance.current.setOption(build(getComputedStyle(element).color), true);
  }, [ready, build, theme]);

  if (failed) {
    return <p className="text-muted p-6 text-sm">Não foi possível carregar o gráfico.</p>;
  }
  return <div ref={host} style={{ height }} role="img" aria-label={label} />;
}
