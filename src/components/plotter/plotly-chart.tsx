"use client";

import { useEffect, useRef, useState } from "react";
import type { PlotlyFigure } from "@/lib/plotter/figure";

export interface PlotlyApi {
  react: (el: HTMLElement, data: unknown[], layout: unknown, config: unknown) => Promise<unknown>;
  purge: (el: HTMLElement) => void;
  toImage: (el: HTMLElement, opts: Record<string, unknown>) => Promise<string>;
}

let plotlyPromise: Promise<PlotlyApi> | null = null;

/** Plotly is large: it is only fetched on the plotter route, after the page is interactive. */
export function loadPlotly(): Promise<PlotlyApi> {
  plotlyPromise ??= import("plotly.js-dist-min").then(
    (module) => (module.default ?? module) as unknown as PlotlyApi,
  );
  return plotlyPromise;
}

export function PlotlyChart({
  figure,
  height = 420,
  onReady,
}: {
  figure: PlotlyFigure;
  height?: number;
  onReady?: (element: HTMLElement, plotly: PlotlyApi) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    let cancelled = false;
    loadPlotly()
      .then(async (plotly) => {
        if (cancelled) return;
        await plotly.react(element, figure.data, figure.layout, figure.config);
        onReady?.(element, plotly);
      })
      .catch(() => setFailed(true));
    return () => {
      cancelled = true;
    };
  }, [figure, onReady]);

  useEffect(() => {
    const element = ref.current;
    return () => {
      if (element) void loadPlotly().then((plotly) => plotly.purge(element));
    };
  }, []);

  if (failed) {
    return <p className="text-muted p-6 text-sm">Não foi possível carregar o gráfico.</p>;
  }
  return <div ref={ref} style={{ height }} role="img" aria-label="Gráfico do plotador" />;
}
