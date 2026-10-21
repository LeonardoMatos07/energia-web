"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/", label: "Painel" },
  { href: "/estados", label: "Estados" },
  { href: "/usinas", label: "Usinas" },
  { href: "/comparar", label: "Comparar" },
  { href: "/relatorios", label: "Relatórios" },
  { href: "/metodologia", label: "Metodologia" },
];

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

export function NavLinks() {
  const pathname = usePathname() ?? "/";
  return (
    <nav aria-label="Principal" className="-mx-1 [scrollbar-width:none] overflow-x-auto">
      <ul className="flex gap-1 px-1 text-sm font-medium whitespace-nowrap">
        {NAV.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`block rounded-full px-3 py-1.5 ${
                  active
                    ? "bg-accent-soft text-accent-strong"
                    : "text-ink-2 hover:bg-surface-2 hover:text-ink"
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
