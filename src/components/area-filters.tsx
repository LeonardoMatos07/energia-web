"use client";

import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import { PeriodFilter } from "@/components/charts/period-filter";
import { SUBSYSTEM_FILTERS, type SubsystemFilter } from "@/lib/filters";
import { defaultPeriod } from "@/lib/series";

/**
 * Period (the same PeriodFilter and URL parameters as the curtailment dashboard: ?de=&ate=) and,
 * where the data allows, subsystem (?sub=). The page is rendered on the server for each
 * combination, so every state is a shareable link. Default values are left out of the URL.
 */
export function AreaFilters({
  first,
  last,
  start,
  end,
  sub,
  withSubsystem = true,
  note,
}: {
  first: string;
  last: string;
  start: string;
  end: string;
  sub: SubsystemFilter;
  withSubsystem?: boolean;
  note?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  const fallback = defaultPeriod(first, last);

  function navigate(next: { start: string; end: string; sub: SubsystemFilter }) {
    const params = new URLSearchParams();
    if (next.start !== fallback.start || next.end !== fallback.end) {
      params.set("de", next.start);
      params.set("ate", next.end);
    }
    if (next.sub !== "SIN") params.set("sub", next.sub);
    const query = params.toString();
    startTransition(() =>
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false }),
    );
  }

  const chip = (active: boolean) =>
    `rounded-md px-2.5 py-1 text-sm font-medium transition-colors ${
      active ? "bg-accent text-on-accent" : "text-ink-2 hover:bg-surface-2"
    }`;

  return (
    <div
      className="border-grid bg-surface mb-6 flex flex-wrap items-center gap-x-5 gap-y-3 rounded-2xl border p-4"
      aria-busy={pending}
    >
      <p className="text-sm font-semibold">Período</p>
      <PeriodFilter
        includeLatest
        label="Período"
        className=""
        first={first}
        last={last}
        start={start}
        end={end}
        onChange={(nextStart, nextEnd) => navigate({ start: nextStart, end: nextEnd, sub })}
      />
      {withSubsystem ? (
        <>
          <p className="text-sm font-semibold">Região</p>
          <div
            role="group"
            aria-label="Região"
            className="border-line bg-surface inline-flex flex-wrap gap-1 rounded-lg border p-1"
          >
            {SUBSYSTEM_FILTERS.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={item.id === sub}
                className={chip(item.id === sub)}
                onClick={() => navigate({ start, end, sub: item.id })}
              >
                {item.label}
              </button>
            ))}
          </div>
        </>
      ) : null}
      <p role="status" className="text-muted text-sm">
        {pending ? "Atualizando…" : null}
      </p>
      {note ? <p className="text-muted w-full text-xs">{note}</p> : null}
    </div>
  );
}
