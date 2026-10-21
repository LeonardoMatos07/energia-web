import Link from "next/link";
import { SITE_NAME } from "@/lib/site";
import { NavLinks } from "./nav-links";
import { ThemeToggle } from "./theme-toggle";
import { Container } from "./ui";

function BrandMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 32 32" className="size-8 shrink-0">
      <rect width="32" height="32" rx="9" className="fill-accent" />
      <circle cx="21.5" cy="11" r="4" className="fill-[#f6c453]" />
      <path
        d="M10 26V15m0 0-5.5-4M10 15l6.5-1.5M10 15l-.8-7"
        className="stroke-on-accent"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

const FOOTER_LINKS = [
  { href: "/estados", label: "Estados" },
  { href: "/usinas", label: "Usinas" },
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
        <Link href="/" className="text-ink flex items-center gap-2.5 font-bold tracking-tight">
          <BrandMark />
          <span>{SITE_NAME}</span>
        </Link>
        <div className="order-3 w-full sm:order-none sm:w-auto sm:flex-1">
          <NavLinks />
        </div>
        <div className="ml-auto sm:ml-0">
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
          <p className="text-ink flex items-center gap-2 font-semibold">
            <BrandMark />
            {SITE_NAME}
          </p>
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
