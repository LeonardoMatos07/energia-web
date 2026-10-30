import Link from "next/link";
import { pageNumbers } from "@/lib/pagination";

const ITEM = "rounded-full border px-3 py-1.5 text-sm";
const LINK = `${ITEM} border-grid text-ink-2 hover:text-ink hover:border-accent`;

/**
 * Previous / numbered / next links. `hrefFor` builds the URL of a page, so each caller keeps its
 * own other query parameters. With `pages` unknown (null) only previous and next are shown.
 */
export function Pagination({
  page,
  pages,
  hasNext,
  hrefFor,
}: {
  page: number;
  /** Total pages, or null when the source does not say how many there are. */
  pages: number | null;
  hasNext: boolean;
  hrefFor: (page: number) => string;
}) {
  if (page === 1 && !hasNext) return null;
  return (
    <nav aria-label="Paginação" className="mt-6 flex flex-wrap items-center gap-2">
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} rel="prev" className={LINK}>
          ← Anterior
        </Link>
      ) : null}
      {pages !== null ? (
        pageNumbers(page, pages).map((n, index) =>
          n === null ? (
            <span key={`gap-${index}`} className="text-muted px-1" aria-hidden="true">
              …
            </span>
          ) : n === page ? (
            <span
              key={n}
              aria-current="page"
              className={`${ITEM} bg-accent text-on-accent border-transparent`}
            >
              {n}
            </span>
          ) : (
            <Link key={n} href={hrefFor(n)} className={LINK}>
              {n}
            </Link>
          ),
        )
      ) : (
        <span className="text-ink-2 px-1 text-sm">Página {page}</span>
      )}
      {hasNext ? (
        <Link href={hrefFor(page + 1)} rel="next" className={LINK}>
          Próxima →
        </Link>
      ) : null}
    </nav>
  );
}
