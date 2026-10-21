"use client";

import { usePathname, useRouter } from "next/navigation";
import { useId, useTransition } from "react";
import { PeriodFilter } from "@/components/charts/period-filter";
import { REGIONS, STATES, SUBSYSTEMS } from "@/lib/geo";

export const DEFAULT_SCOPE = "SIN";

export function KpiFilters({
  first,
  last,
  start,
  end,
  scope,
}: {
  first: string;
  last: string;
  start: string;
  end: string;
  scope: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  const id = useId();

  function navigate(next: { start: string; end: string; scope: string }) {
    const params = new URLSearchParams();
    if (next.start !== last || next.end !== last) {
      params.set("de", next.start);
      params.set("ate", next.end);
    }
    if (next.scope !== DEFAULT_SCOPE) params.set("unidade", next.scope);
    const query = params.toString();
    startTransition(() =>
      router.replace(query ? `${pathname}?${query}#resumo` : `${pathname}#resumo`, {
        scroll: false,
      }),
    );
  }

  return (
    <div className="mb-5 flex flex-wrap items-center gap-x-6 gap-y-3" aria-busy={pending}>
      <PeriodFilter
        includeLatest
        label="Período dos indicadores"
        className=""
        first={first}
        last={last}
        start={start}
        end={end}
        onChange={(nextStart, nextEnd) => navigate({ start: nextStart, end: nextEnd, scope })}
      />
      <div className="flex items-center gap-2">
        <label htmlFor={`${id}-scope`} className="text-ink-2 text-sm">
          Unidade
        </label>
        <select
          id={`${id}-scope`}
          value={scope}
          onChange={(event) => navigate({ start, end, scope: event.target.value })}
          className="border-line bg-surface text-ink focus-visible:border-accent rounded-lg border px-3 py-1.5 text-sm font-medium"
        >
          <option value={DEFAULT_SCOPE}>Brasil (SIN)</option>
          <optgroup label="Subsistemas">
            {SUBSYSTEMS.map((subsystem) => (
              <option key={subsystem.id} value={subsystem.id}>
                {subsystem.name}
              </option>
            ))}
          </optgroup>
          {REGIONS.map((region) => (
            <optgroup key={region} label={`Estados — ${region}`}>
              {STATES.filter((state) => state.region === region).map((state) => (
                <option key={state.state} value={state.state}>
                  {state.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>
      {pending ? <span className="text-muted text-sm">Atualizando…</span> : null}
    </div>
  );
}
