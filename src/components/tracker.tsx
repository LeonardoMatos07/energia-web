"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { trackEvent } from "@/lib/track";

const MIN_ENGAGEMENT_MS = 1000;

export function Tracker() {
  const pathname = usePathname();
  const visibleMs = useRef(0);
  const visibleSince = useRef<number | null>(null);
  const maxScroll = useRef(0);

  useEffect(() => {
    visibleMs.current = 0;
    visibleSince.current = document.visibilityState === "visible" ? Date.now() : null;
    maxScroll.current = 0;

    const onScroll = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollable <= 0) return;
      const percent = Math.round(
        ((window.scrollY + window.innerHeight) / document.documentElement.scrollHeight) * 100,
      );
      maxScroll.current = Math.max(maxScroll.current, Math.min(percent, 100));
    };
    const pause = () => {
      if (visibleSince.current !== null) {
        visibleMs.current += Date.now() - visibleSince.current;
        visibleSince.current = null;
      }
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") visibleSince.current = Date.now();
      else {
        pause();
        flush();
      }
    };
    const flush = () => {
      pause();
      if (visibleMs.current >= MIN_ENGAGEMENT_MS) {
        trackEvent("page.engagement", {
          duration_ms: visibleMs.current,
          max_scroll_pct: maxScroll.current,
        });
      }
      visibleMs.current = 0;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", flush);
    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", flush);
      flush();
    };
  }, [pathname]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = (event.target as HTMLElement | null)?.closest<HTMLElement>("[data-track]");
      const name = target?.dataset.track;
      if (name) trackEvent("ui.click", { id: name });
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
