import Link from "next/link";
import { Container, DataUnavailable, PageHeader } from "@/components/ui";
import { getRelatorios } from "@/lib/api/queries";
import { formatData, formatMesLongo } from "@/lib/format";
import { pageMetadata } from "@/lib/metadata";

export const revalidate = 3600;

export const metadata = pageMetadata({
  title: "Relatórios mensais de curtailment",
  description:
    "Análises mensais sobre os cortes de geração eólica e solar no Brasil, com base nos dados do ONS.",
  path: "/relatorios",
});

export default async function RelatoriosPage() {
  const result = await getRelatorios();
  const itens = result.ok ? [...result.data.itens].sort((a, b) => b.mes.localeCompare(a.mes)) : [];

  return (
    <Container>
      <PageHeader title="Relatórios mensais">
        <p>O que mudou no mês, onde os cortes se concentraram e por quê.</p>
      </PageHeader>

      {!result.ok ? (
        <DataUnavailable />
      ) : itens.length === 0 ? (
        <DataUnavailable title="Nenhum relatório publicado ainda">
          Assine a newsletter na página inicial para saber quando o primeiro sair.
        </DataUnavailable>
      ) : (
        <ul className="space-y-4">
          {itens.map((r) => (
            <li key={r.slug}>
              <article className="rounded-lg border border-[var(--color-grid)] bg-[var(--color-surface)] p-4">
                <p className="text-sm text-[var(--color-ink-2)]">
                  Referência: {formatMesLongo(r.mes)}
                  {r.publicado_em ? ` · publicado em ${formatData(r.publicado_em)}` : null}
                </p>
                <h2 className="mt-1 text-lg font-semibold">
                  <Link
                    href={`/relatorios/${r.slug}`}
                    className="text-[var(--color-accent)] underline"
                  >
                    {r.titulo}
                  </Link>
                </h2>
                {r.resumo ? <p className="mt-1 text-[var(--color-ink-2)]">{r.resumo}</p> : null}
              </article>
            </li>
          ))}
        </ul>
      )}
    </Container>
  );
}
