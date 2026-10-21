import Link from "next/link";
import { Container, PageHeader, Section } from "@/components/ui";
import { ESTADOS, REGIOES } from "@/lib/geo";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Curtailment por estado",
  description:
    "Escolha um estado para ver a série mensal de energia eólica e solar cortada e as usinas mais afetadas.",
  path: "/estados",
});

export default function EstadosPage() {
  return (
    <Container>
      <PageHeader title="Curtailment por estado">
        <p>
          A maior parte dos parques eólicos e solares fica no Nordeste, mas há usinas em quase todo
          o país. Estados sem usinas eólicas ou solares despachadas pelo ONS aparecem sem dados.
        </p>
      </PageHeader>
      {REGIOES.map((regiao) => (
        <Section key={regiao} title={regiao}>
          <ul className="grid grid-cols-1 gap-3 min-[400px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
            {ESTADOS.filter((e) => e.regiao === regiao).map((e) => (
              <li key={e.uf}>
                <Link
                  href={`/estados/${e.uf.toLowerCase()}`}
                  className="group flex items-center justify-between rounded-xl border border-[var(--color-grid)] bg-[var(--color-surface)] px-4 py-3 shadow-[0_1px_3px_rgba(25,55,43,0.03)] hover:-translate-y-0.5 hover:border-[var(--color-accent)] hover:shadow-md"
                >
                  <span><span className="mr-2 inline-flex h-8 w-9 items-center justify-center rounded-lg bg-[#edf5f0] text-sm font-bold text-[var(--color-accent-strong)] group-hover:bg-[var(--color-accent)] group-hover:text-white">{e.uf}</span><span className="text-sm font-medium text-[var(--color-ink-2)]">{e.nome}</span></span>
                  <span aria-hidden="true" className="text-lg text-[var(--color-muted)] transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--color-accent)]">›</span>
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      ))}
    </Container>
  );
}
