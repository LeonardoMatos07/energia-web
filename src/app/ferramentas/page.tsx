import Link from "next/link";
import { Container, PageHeader } from "@/components/ui";
import { pageMetadata } from "@/lib/metadata";
import { TOOLS } from "@/lib/tools";

export const metadata = pageMetadata({
  title: "Ferramentas gratuitas",
  description:
    "Ferramentas gratuitas para estudantes e profissionais de engenharia elétrica, direto no navegador.",
  path: "/ferramentas",
});

export default function ToolsPage() {
  return (
    <Container>
      <PageHeader eyebrow="Ferramentas" title="Ferramentas gratuitas">
        <p>Tudo roda no seu navegador: sem conta e sem enviar seus dados.</p>
      </PageHeader>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TOOLS.map((tool) => (
          <li key={tool.href}>
            <Link
              href={tool.href}
              className="border-grid bg-surface shadow-card hover:border-accent focus-visible:outline-accent group flex h-full flex-col gap-3 rounded-2xl border p-5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              <span className="bg-accent-soft text-accent-strong flex size-10 items-center justify-center rounded-xl">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="size-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d={tool.icon} />
                </svg>
              </span>
              <span className="text-lg font-semibold group-hover:underline">{tool.title}</span>
              <span className="text-ink-2 text-sm leading-6">{tool.description}</span>
              {tool.model ? (
                <span className="border-accent bg-accent-soft text-accent-strong mt-auto rounded-xl border px-3 py-2 text-sm">
                  <span className="block text-xs font-semibold tracking-wide uppercase">
                    Modelo
                  </span>
                  <span className="font-semibold">{tool.model}</span>
                </span>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>
    </Container>
  );
}
