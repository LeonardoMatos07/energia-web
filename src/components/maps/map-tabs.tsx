"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MAP_LAYERS } from "@/lib/maps";

/** One tab per map layer; each is a route, so only the open layer downloads its code and data. */
export function MapTabs() {
  const pathname = usePathname();
  return (
    <nav aria-label="Camadas do mapa" className="pt-2">
      <ul className="border-grid inline-flex max-w-full flex-wrap gap-1 rounded-full border bg-[var(--color-surface)] p-1 text-sm font-medium">
        {MAP_LAYERS.map((layer) => {
          const current = pathname === layer.href || pathname.startsWith(`${layer.href}/`);
          return (
            <li key={layer.key}>
              <Link
                href={layer.href}
                aria-current={current ? "page" : undefined}
                className={`block rounded-full px-4 py-1.5 ${
                  current
                    ? "bg-accent text-on-accent"
                    : "text-ink-2 hover:bg-surface-2 hover:text-ink"
                }`}
              >
                {layer.label}
                {layer.account ? (
                  <span className="ml-2 rounded-full border border-current px-1.5 py-0.5 text-[0.65rem] leading-none font-semibold uppercase">
                    Com conta
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
