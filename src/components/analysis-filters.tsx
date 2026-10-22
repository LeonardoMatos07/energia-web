"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { PeriodFilter } from "@/components/charts/period-filter";
import { inputClass } from "@/components/form-fields";
import { defaultPeriod } from "@/lib/series";

const SOURCES = [
  { value: "total", label: "Eólica + solar" },
  { value: "wind", label: "Só eólica" },
  { value: "solar", label: "Só solar" },
];

const SCOPES = [
  { value: "SIN", label: "Brasil (SIN)" },
  { value: "NE", label: "Nordeste" },
  { value: "SE", label: "Sudeste/Centro-Oeste" },
  { value: "S", label: "Sul" },
  { value: "N", label: "Norte" },
];

export function AnalysisFilters({
  first,
  last,
  start,
  end,
  source,
  scope,
}: {
  first: string;
  last: string;
  start: string;
  end: string;
  source: string;
  scope?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const current = useSearchParams();
  const [pending, startTransition] = useTransition();
  const fallback = defaultPeriod(first, last);

  function navigate(next: { start: string; end: string; source: string; scope?: string }) {
    const params = new URLSearchParams(current.toString());
    const set = (key: string, value: string | undefined, isDefault: boolean) => {
      if (value === undefined || isDefault) params.delete(key);
      else params.set(key, value);
    };
    set("de", next.start, next.start === fallback.start && next.end === fallback.end);
    set("ate", next.end, next.start === fallback.start && next.end === fallback.end);
    set("fonte", next.source, next.source === "total");
    set("escopo", next.scope, next.scope === "SIN");
    const query = params.toString();
    startTransition(() =>
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false }),
    );
  }

  return (
    <div
      className="border-grid bg-surface mb-6 flex flex-wrap items-center gap-x-5 gap-y-3 rounded-2xl border p-4"
      aria-busy={pending}
    >
      <PeriodFilter
        includeLatest
        label="Período da análise"
        className=""
        first={first}
        last={last}
        start={start}
        end={end}
        onChange={(nextStart, nextEnd) =>
          navigate({ start: nextStart, end: nextEnd, source, scope })
        }
      />
      <label className="flex items-center gap-2 text-sm">
        <span className="text-ink-2">Fonte</span>
        <select
          value={source}
          onChange={(event) => navigate({ start, end, source: event.target.value, scope })}
          className={`${inputClass} w-auto`}
        >
          {SOURCES.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      {scope !== undefined ? (
        <label className="flex items-center gap-2 text-sm">
          <span className="text-ink-2">Região</span>
          <select
            value={scope}
            onChange={(event) => navigate({ start, end, source, scope: event.target.value })}
            className={`${inputClass} w-auto`}
          >
            {SCOPES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      {pending ? <span className="text-muted text-sm">Atualizando…</span> : null}
    </div>
  );
}
