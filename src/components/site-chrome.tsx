import Link from "next/link";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/site";
import { AuthNav } from "./auth-nav";
import { NavLinks } from "./nav-links";
import { ThemeToggle } from "./theme-toggle";
import { Container } from "./ui";

export function BrandMark({ className = "size-8" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 112 112" className={`${className} shrink-0`}>
      <rect width="112" height="112" rx="28" className="fill-brand-tile" />
      <path
        d="M22 34h30v16h18v16h20"
        className="stroke-brand-flow"
        strokeWidth="10"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path d="M90 68v10" className="stroke-brand-drop" strokeWidth="10" strokeLinecap="round" />
      <circle cx="90" cy="90" r="5" className="fill-brand-drop" />
    </svg>
  );
}

const FOOTER_LINKS = [
  { href: "/estados", label: "Estados" },
  { href: "/usinas", label: "Usinas" },
  { href: "/comparar", label: "Comparar" },
  { href: "/relatorios", label: "Relatórios" },
  { href: "/metodologia", label: "Metodologia" },
  { href: "/privacidade", label: "Privacidade" },
  { href: "/newsletter/descadastrar", label: "Cancelar newsletter" },
];

export function SiteHeader() {
  return (
    <header className="border-grid bg-surface/90 sticky top-0 z-30 border-b backdrop-blur-md">
      <a
        href="#conteudo"
        className="focus:bg-surface sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded focus:px-3 focus:py-2"
      >
        Pular para o conteúdo
      </a>
      <Container className="flex flex-wrap items-center gap-x-6 gap-y-2 py-3">
        <Link
          href="/"
          className="text-ink font-display flex items-center gap-2.5 text-lg font-bold tracking-tight"
        >
          <BrandMark />
          <span>{SITE_NAME}</span>
        </Link>
        <div className="order-3 w-full sm:order-none sm:w-auto sm:flex-1">
          <NavLinks />
        </div>
        <div className="ml-auto flex items-center gap-3 sm:ml-0">
          <AuthNav />
          <ThemeToggle />
        </div>
      </Container>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-grid bg-surface text-ink-2 mt-20 border-t text-sm">
      <Container className="grid gap-8 py-10 sm:grid-cols-[1.4fr_1fr]">
        <div className="space-y-3">
          <p className="text-ink font-display flex items-center gap-2 text-base font-bold">
            <BrandMark className="size-7" />
            {SITE_NAME}
          </p>
          <p className="text-ink-2">{SITE_TAGLINE}.</p>
          <p className="max-w-md leading-6">
            Dados abertos do Operador Nacional do Sistema Elétrico (ONS), processados todo mês.
            Valores em R$ são estimativas pelo PLD —{" "}
            <Link href="/metodologia" className="text-accent underline">
              veja a metodologia
            </Link>
            .
          </p>
        </div>
        <ul className="grid grid-cols-2 gap-x-6 gap-y-2 self-start">
          {FOOTER_LINKS.map(({ href, label }) => (
            <li key={href}>
              <Link href={href} className="hover:text-accent hover:underline">
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </footer>
  );
}
