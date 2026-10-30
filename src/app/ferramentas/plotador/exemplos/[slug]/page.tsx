import Link from "next/link";
import { notFound } from "next/navigation";
import { StateChart } from "@/components/plotter/state-chart";
import { Container, PageHeader } from "@/components/ui";
import { resolveTable } from "@/lib/plotter/data";
import { EXAMPLES, getExample } from "@/lib/plotter/examples";
import { equationText, fitCurve } from "@/lib/plotter/fit";
import { encodeHash } from "@/lib/plotter/share";
import { pageMetadata } from "@/lib/metadata";

export const dynamicParams = false;

export function generateStaticParams() {
  return EXAMPLES.map((example) => ({ slug: example.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const example = getExample((await params).slug);
  if (!example) return {};
  return pageMetadata({
    title: `${example.title}: exemplo de gráfico`,
    description: example.summary,
    path: `/ferramentas/plotador/exemplos/${example.slug}`,
  });
}

export default async function ExamplePage({ params }: { params: Promise<{ slug: string }> }) {
  const example = getExample((await params).slug);
  if (!example) notFound();

  let equation: string | null = null;
  if (example.fit) {
    const { chart } = example.state;
    const resolved = resolveTable(example.state);
    const x = resolved.find((item) => item.column.id === chart.xColumn)?.values;
    const y = resolved.find((item) => item.column.id === chart.yColumns[0])?.values;
    if (x && y) {
      const result = fitCurve(example.fit, x, y);
      equation = `${equationText(result)} (R² = ${result.r2.toFixed(4).replace(".", ",")})`;
    }
  }
  const { hash } = encodeHash(example.state);

  return (
    <Container>
      <PageHeader eyebrow="Exemplo do plotador" title={example.title}>
        <p>{example.summary}</p>
      </PageHeader>
      <div className="border-grid bg-surface shadow-card rounded-2xl border p-3 sm:p-5">
        <StateChart state={example.state} model={example.fit} />
      </div>
      <div className="prose prose-site mt-6 max-w-3xl">
        {example.body.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
        {equation ? (
          <p>
            Ajuste: <strong>{equation}</strong>
          </p>
        ) : null}
      </div>
      <p className="mt-6">
        <Link
          href={`/ferramentas/plotador#${hash}`}
          className="bg-accent-strong inline-block rounded-full px-5 py-2.5 text-sm font-semibold text-white"
        >
          Abrir estes dados no plotador
        </Link>
      </p>
      <section aria-label="Outros exemplos" className="mt-10">
        <h2 className="text-lg font-semibold">Outros exemplos</h2>
        <ul className="mt-3 flex flex-wrap gap-2 text-sm">
          {EXAMPLES.filter((item) => item.slug !== example.slug).map((item) => (
            <li key={item.slug}>
              <Link
                href={`/ferramentas/plotador/exemplos/${item.slug}`}
                className="border-grid hover:bg-surface-2 rounded-full border px-3 py-1.5"
              >
                {item.title}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </Container>
  );
}
