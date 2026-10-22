"use client";

const ENDPOINT = "/api/track";
const DUPLICATE_WINDOW_MS = 400;

let lastKey = "";
let lastAt = 0;

export function trackEvent(action: string, properties: Record<string, unknown> = {}): void {
  if (typeof window === "undefined") return;
  const path = `${window.location.pathname}${window.location.search}`;
  const key = `${action}|${path}|${JSON.stringify(properties)}`;
  const now = Date.now();
  if (key === lastKey && now - lastAt < DUPLICATE_WINDOW_MS) return;
  lastKey = key;
  lastAt = now;

  const body = JSON.stringify({ events: [{ action, path, properties }] });
  try {
    if (navigator.sendBeacon?.(ENDPOINT, new Blob([body], { type: "application/json" }))) return;
    void fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    });
  } catch {}
}
