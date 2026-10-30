export const NEWS_PAGE_SIZE = 10;
export const RANKING_PAGE_SIZE = 20;

/** `?pagina=` as a page number (1-based); anything invalid is the first page. */
export function parsePage(value: string | string[] | undefined): number {
  const text = Array.isArray(value) ? value[0] : value;
  const page = Number.parseInt(text ?? "", 10);
  return Number.isInteger(page) && page >= 1 && page <= 10_000 ? page : 1;
}

export function pageCount(total: number, size: number): number {
  return Math.max(1, Math.ceil(total / size));
}

/** Items of one page; a page past the end is clamped to the last one. */
export function paginate<T>(items: readonly T[], page: number, size: number) {
  const pages = pageCount(items.length, size);
  const current = Math.min(page, pages);
  const start = (current - 1) * size;
  return { items: items.slice(start, start + size), page: current, pages, start };
}

/** Page numbers to show (first, last and the neighbours of the current one); null is a gap. */
export function pageNumbers(current: number, pages: number): (number | null)[] {
  const wanted = new Set([1, pages, current - 1, current, current + 1]);
  const sorted = [...wanted].filter((n) => n >= 1 && n <= pages).sort((a, b) => a - b);
  const result: (number | null)[] = [];
  for (const [index, n] of sorted.entries()) {
    if (index > 0 && n - sorted[index - 1]! > 1) result.push(null);
    result.push(n);
  }
  return result;
}
