"use client";

import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import { inputClass } from "@/components/form-fields";
import type { Source } from "@/lib/api/types";
import { SOURCE_LABEL, type ScopeGroup } from "@/lib/forecast";

export function ForecastFilters({
  source,
  scope,
  groups,
}: {
  source: Source;
  scope: string;
  groups: ScopeGroup[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();

  function go(next: { source: Source; scope: string }) {
    const params = new URLSearchParams({ fonte: next.source, escopo: next.scope });
    startTransition(() => router.replace(`${pathname}?${params.toString()}`, { scroll: false }));
  }

  return (
    <div className="flex flex-wrap items-end gap-4" aria-busy={pending}>
      <fieldset>
        <legend className="text-ink-2 mb-1 text-sm font-medium">Fonte</legend>
        <div className="flex gap-1">
          {(["wind", "solar"] as const).map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={item === source}
              onClick={() => go({ source: item, scope })}
              className={`rounded-full px-4 py-1.5 text-sm font-medium ${
                item === source
                  ? "bg-accent-soft text-accent-strong"
                  : "text-ink-2 hover:bg-surface-2 hover:text-ink"
              }`}
            >
              {SOURCE_LABEL[item]}
            </button>
          ))}
        </div>
      </fieldset>
      <label className="block">
        <span className="text-ink-2 mb-1 block text-sm font-medium">Região</span>
        <select
          className={inputClass}
          value={scope}
          onChange={(event) => go({ source, scope: event.target.value })}
        >
          {groups.map((group) => (
            <optgroup key={group.label} label={group.label}>
              {group.scopes.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </label>
    </div>
  );
}
