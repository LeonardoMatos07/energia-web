import Link from "next/link";
import { SITE_NAME } from "@/lib/site";
import { Container } from "./ui";
import { ThemeToggle } from "./theme-toggle";

const NAV = [
  { href: "/", label: "Painel" },
  { href: "/estados", label: "Estados" },
  { href: "/usinas", label: "Usinas" },
  { href: "/relatorios", label: "Relatórios" },
  { href: "/metodologia", label: "Metodologia" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-[var(--color-grid)]/80 bg-[var(--color-surface)]/95 shadow-[0_1px_3px_rgba(25,55,43,0.04)] backdrop-blur">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2"
      >
        Pular para o conteúdo
      </a>
      <Container className="flex flex-wrap items-center justify-between gap-x-5 gap-y-2 py-3.5">
        <Link href="/" className="text-lg font-extrabold tracking-tight text-[var(--color-ink)]">
          {SITE_NAME}
        </Link>
        <nav aria-label="Principal" className="mr-auto sm:mr-0">
          <ul className="flex flex-wrap gap-x-1 gap-y-1 text-sm font-semibold">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="rounded-full px-3 py-2 text-[var(--color-ink-2)] hover:bg-[#edf5f0] hover:text-[var(--color-accent-strong)]">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <ThemeToggle />
      </Container>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-[var(--color-grid)] bg-[var(--color-surface)] py-9 text-sm leading-6 text-[var(--color-ink-2)]">
      <Container className="space-y-2">
        <p>
          Fonte primária: dados abertos do Operador Nacional do Sistema Elétrico (ONS). Valores de
          perda em R$ são estimativas —{" "}
          <Link href="/metodologia" className="text-[var(--color-accent)] underline">
            veja a metodologia
          </Link>
          .
        </p>
        <p>
          <Link href="/newsletter/descadastrar" className="underline">
            Cancelar newsletter
          </Link>{" "}
          ·{" "}
          <Link href="/metodologia#privacidade" className="underline">
            Privacidade
          </Link>
        </p>
      </Container>
    </footer>
  );
}
