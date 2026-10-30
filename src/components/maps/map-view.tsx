"use client";

import { useEffect, useRef, useState, type ComponentType, type ReactNode } from "react";

/**
 * Frame of every map. The map engine is not imported here: the caller passes `load`, a dynamic
 * `import()` of the engine component, and it only runs once the frame is about to be seen
 * (IntersectionObserver). Today the engine is the SVG one (d3-geo); the point layers will pass a
 * MapLibre component the same way with `requires="webgl"`, and MapLibre stays out of the bundle
 * of every page that does not render it.
 */
export interface MapViewProps<P extends object> {
  /** What the map shows, for screen readers. */
  label: string;
  load: () => Promise<{ default: ComponentType<P> }>;
  props: P;
  /** Reserve the space so the page does not jump when the map arrives (CSS aspect-ratio). */
  aspect?: string;
  requires?: "webgl";
  /** Shown instead of the map when it cannot load (the page also keeps its table). */
  fallback?: ReactNode;
}

export function hasWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

type Phase = "idle" | "loading" | "ready" | "failed";

export function MapView<P extends object>({
  label,
  load,
  props,
  aspect = "600 / 620",
  requires,
  fallback,
}: MapViewProps<P>) {
  const frame = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [Engine, setEngine] = useState<ComponentType<P> | null>(null);

  useEffect(() => {
    const node = frame.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible || phase !== "idle") return;
    if (requires === "webgl" && !hasWebGL()) {
      setPhase("failed");
      return;
    }
    setPhase("loading");
    load().then(
      (module) => {
        setEngine(() => module.default);
        setPhase("ready");
      },
      () => setPhase("failed"),
    );
  }, [visible, phase, load, requires]);

  return (
    <div
      ref={frame}
      className="relative w-full"
      style={{ aspectRatio: phase === "ready" ? undefined : aspect }}
      aria-busy={phase === "loading"}
    >
      {phase === "ready" && Engine ? (
        <Engine {...props} />
      ) : phase === "failed" ? (
        <div
          role="status"
          className="border-line text-ink-2 flex h-full min-h-40 items-center justify-center rounded-xl border border-dashed p-6 text-center text-sm"
        >
          {fallback ?? "Não foi possível carregar o mapa. Use a tabela abaixo."}
        </div>
      ) : (
        <div
          role="img"
          aria-label={`Carregando o mapa: ${label}`}
          className="bg-surface-2 absolute inset-0 animate-pulse rounded-xl motion-reduce:animate-none"
        />
      )}
    </div>
  );
}
