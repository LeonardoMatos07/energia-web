"use client";

import { useSyncExternalStore } from "react";

export type SessionState = { member: { name: string; email: string } | null } | null;

let state: SessionState = null;
let inflight: Promise<void> | null = null;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

export function refreshSession(): Promise<void> {
  if (inflight) return inflight;
  inflight = fetch("/api/session", { cache: "no-store" })
    .then((response) => response.json() as Promise<SessionState>)
    .then((body) => {
      state = body;
    })
    .catch(() => {
      state = { member: null };
    })
    .finally(() => {
      inflight = null;
      emit();
    });
  return inflight;
}

export function useSession(): SessionState {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => state,
    () => null,
  );
}
