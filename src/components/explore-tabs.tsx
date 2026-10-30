import Link from "next/link";
import { EXPLORE_TABS, type ExploreTab } from "@/lib/navigation";

/** Estados and Usinas are two ways of looking at the same thing: where it happens. */
export function ExploreTabs({ active }: { active: ExploreTab }) {
  return (
    <nav aria-label="Explorar" className="pt-2">
      <ul className="border-grid inline-flex gap-1 rounded-full border bg-[var(--color-surface)] p-1 text-sm font-medium">
        {EXPLORE_TABS.map((tab) => (
          <li key={tab.key}>
            <Link
              href={tab.href}
              aria-current={tab.key === active ? "page" : undefined}
              className={`block rounded-full px-4 py-1.5 ${
                tab.key === active
                  ? "bg-accent text-on-accent"
                  : "text-ink-2 hover:bg-surface-2 hover:text-ink"
              }`}
            >
              {tab.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
