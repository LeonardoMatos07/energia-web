import Link from "next/link";
import { PlotterApp } from "@/components/plotter/plotter-app";
import { Container, PageHeader } from "@/components/ui";
import { pageMetadata } from "@/lib/metadata";
import { EXAMPLES } from "@/lib/plotter/examples";

export const metadata = pageMetadata({
  title: "Plotador de gráficos de laboratório",
  description:
    "Cole os dados do experimento e gere o gráfico para o relatório, com unidades, barras de erro e ajuste de curva. Grátis e no seu navegador.",
  path: "/ferramentas/plotador",
});

export default function PlotterPage() {
  return (
    <Container>
      <Link
        href="/ferramentas"
        className="text-ink-2 hover:text-accent mt-6 inline-flex items-center gap-2 text-sm font-medium"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Voltar para Ferramentas
      </Link>
      <PageHeader eyebrow="Ferramentas" title="Plotador de gráficos de laboratório">
        <p>Cole os dados, escolha o gráfico e exporte para o relatório.</p>
      </PageHeader>
      <PlotterApp />
      <section aria-label="Exemplos" className="mt-12">
        <h2 className="text-lg font-semibold">Exemplos prontos</h2>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {EXAMPLES.map((example) => (
            <li key={example.slug}>
              <Link
                href={`/ferramentas/plotador/exemplos/${example.slug}`}
                className="border-grid hover:bg-surface-2 block rounded-xl border p-3 text-sm"
              >
                <span className="font-medium">{example.title}</span>
                <span className="text-ink-2 mt-1 block">{example.summary}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </Container>
  );
}
