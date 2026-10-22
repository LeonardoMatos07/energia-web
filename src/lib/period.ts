import { defaultPeriod } from "@/lib/series";

const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

type SearchParams = Record<string, string | string[] | undefined>;

function single(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function requestedEnd(params: SearchParams): string | undefined {
  const value = single(params.ate);
  return value && MONTH_PATTERN.test(value) ? value : undefined;
}

export function resolvePeriod(
  params: SearchParams,
  first: string,
  last: string,
): { start: string; end: string } {
  const from = single(params.de);
  const to = single(params.ate);
  const valid =
    from !== undefined &&
    to !== undefined &&
    MONTH_PATTERN.test(from) &&
    MONTH_PATTERN.test(to) &&
    from >= first &&
    to <= last &&
    from <= to;
  return valid ? { start: from, end: to } : defaultPeriod(first, last);
}

export function describePeriod(start: string, end: string, label: (month: string) => string) {
  return start === end ? label(start) : `${label(start)} a ${label(end)}`;
}
