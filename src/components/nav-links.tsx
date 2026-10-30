"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { isNavActive, NAV, type NavItem } from "@/lib/navigation";

const LINK_BASE = "block rounded-full px-3 py-1.5";
const ACTIVE = "bg-accent-soft text-accent-strong";
const IDLE = "text-ink-2 hover:bg-surface-2 hover:text-ink";

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 12 12"
      className={`size-3 transition-transform ${open ? "rotate-180" : ""}`}
    >
      <path
        d="M2 4l4 4 4-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function DesktopItem({
  item,
  active,
  open,
  onToggle,
  onClose,
}: {
  item: NavItem;
  active: boolean;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
}) {
  const children = item.children;
  if (!children) {
    return (
      <Link
        href={item.href}
        aria-current={active ? "page" : undefined}
        className={`${LINK_BASE} ${active ? ACTIVE : IDLE}`}
      >
        {item.label}
      </Link>
    );
  }
  const menuId = `menu-${item.label.toLowerCase()}`;
  return (
    <div className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={menuId}
        aria-haspopup="true"
        onClick={onToggle}
        className={`${LINK_BASE} flex items-center gap-1 ${active ? ACTIVE : IDLE}`}
      >
        {item.label}
        <Chevron open={open} />
      </button>
      {open ? (
        <ul
          id={menuId}
          className="border-grid bg-surface shadow-card absolute top-full left-0 z-40 mt-2 w-64 rounded-2xl border p-2"
        >
          {children.map((child) => (
            <li key={child.href}>
              <Link
                href={child.href}
                onClick={onClose}
                className="hover:bg-surface-2 block rounded-xl px-3 py-2"
              >
                <span className="text-ink block text-sm font-semibold">{child.label}</span>
                <span className="text-muted block text-xs">{child.description}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

/** Desktop menu (md and up): plain links and dropdowns. Esc and outside clicks close a dropdown. */
export function NavLinks() {
  const pathname = usePathname() ?? "/";
  const [openLabel, setOpenLabel] = useState<string | null>(null);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    setOpenLabel(null);
  }, [pathname]);

  useEffect(() => {
    if (!openLabel) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenLabel(null);
    };
    const onPointer = (event: PointerEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpenLabel(null);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [openLabel]);

  return (
    <nav ref={ref} aria-label="Principal" className="hidden md:block">
      <ul className="flex gap-1 text-sm font-medium whitespace-nowrap">
        {NAV.map((item) => (
          <li key={item.href}>
            <DesktopItem
              item={item}
              active={isNavActive(pathname, item.matches)}
              open={openLabel === item.label}
              onToggle={() => setOpenLabel(openLabel === item.label ? null : item.label)}
              onClose={() => setOpenLabel(null)}
            />
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** Mobile menu (below md): a button that opens a drawer with every area and its pages. */
export function MobileMenu() {
  const pathname = usePathname() ?? "/";
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="menu-mobile"
        onClick={() => setOpen(!open)}
        className="border-line text-ink-2 hover:bg-surface-2 inline-flex h-11 items-center gap-2 rounded-full border px-4 text-sm font-semibold"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4">
          <path
            d={open ? "M6 6l12 12M18 6L6 18" : "M4 7h16M4 12h16M4 17h16"}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        Menu
      </button>
      {open ? (
        <nav
          id="menu-mobile"
          aria-label="Principal"
          className="border-grid bg-surface absolute inset-x-0 top-full z-40 max-h-[calc(100dvh-4rem)] overflow-y-auto border-b px-4 py-4 shadow-lg"
        >
          <ul className="space-y-4">
            {NAV.map((item) => {
              const active = isNavActive(pathname, item.matches);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`block py-1 text-base font-bold ${active ? "text-accent-strong" : "text-ink"}`}
                  >
                    {item.label}
                  </Link>
                  {item.children ? (
                    <ul className="border-grid mt-1 ml-1 space-y-1 border-l pl-3">
                      {item.children.map((child) => (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            className="text-ink-2 hover:text-ink block min-h-11 py-2.5 text-sm"
                          >
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </nav>
      ) : null}
    </div>
  );
}
