"use client";

import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import { PeriodFilter } from "@/components/charts/period-filter";
import { defaultPeriod } from "@/lib/series";

export function DashboardFilters({
  first,
  last,
  start,
  end,
}: {
  first: string;
  last: string;
  start: string;
  end: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  const fallback = defaultPeriod(first, last);

  function navigate(nextStart: string, nextEnd: string) {
    const params = new URLSearchParams();
    if (nextStart !== fallback.start || nextEnd !== fallback.end) {
      params.set("de", nextStart);
      params.set("ate", nextEnd);
    }
    const query = params.toString();
    startTransition(() =>
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false }),
    );
  }

  return (
    <div
      className="border-grid bg-surface mb-6 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-2xl border p-4"
      aria-busy={pending}
    >
      <p className="text-sm font-semibold">Período</p>
      <PeriodFilter
        includeLatest
        label="Período do painel"
        className=""
        first={first}
        last={last}
        start={start}
        end={end}
        onChange={navigate}
      />
      {pending ? <span className="text-muted text-sm">Atualizando…</span> : null}
    </div>
  );
}
