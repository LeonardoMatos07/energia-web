import Link from "next/link";
import { compareHref, type EntityRef } from "@/lib/compare";

/** Comparing starts from the thing being looked at, so it is an action here, not a menu item. */
export function CompareAction({ entity, label }: { entity: EntityRef; label?: string }) {
  return (
    <Link
      href={compareHref(entity)}
      className="border-line bg-surface text-ink hover:bg-surface-2 inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-semibold"
    >
      {label ?? "Comparar com outros"}
      <span aria-hidden="true">→</span>
    </Link>
  );
}
