import Link from "next/link";

const TABS = [
  { key: "noticias", href: "/noticias", label: "Notícias" },
  { key: "atos", href: "/noticias/atos", label: "Atos oficiais" },
  { key: "fontes", href: "/noticias/fontes", label: "Fontes e licenças" },
] as const;

export type NewsTab = (typeof TABS)[number]["key"];

export function NewsSubnav({ active }: { active: NewsTab }) {
  return (
    <nav aria-label="Seções de notícias" className="flex flex-wrap items-center gap-2 text-sm">
      {TABS.map((tab) => (
        <Link
          key={tab.key}
          href={tab.href}
          aria-current={tab.key === active ? "page" : undefined}
          className={`rounded-full px-4 py-1.5 ${
            tab.key === active ? "bg-accent-soft font-semibold" : "text-ink-2 hover:text-accent"
          }`}
        >
          {tab.label}
        </Link>
      ))}
      <a href="/noticias/rss.xml" className="text-ink-2 hover:text-accent rounded-full px-4 py-1.5">
        RSS
      </a>
    </nav>
  );
}
