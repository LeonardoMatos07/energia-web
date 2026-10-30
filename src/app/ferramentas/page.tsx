import Link from "next/link";
import { Card, Container, PageHeader } from "@/components/ui";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Ferramentas gratuitas",
  description:
    "Ferramentas gratuitas para estudantes e profissionais de engenharia elétrica, direto no navegador.",
  path: "/ferramentas",
});

const TOOLS = [
  {
    href: "/ferramentas/plotador",
    title: "Plotador de gráficos de laboratório",
    description:
      "Cole os dados do experimento e gere o gráfico com unidades, barras de erro e ajuste de curva.",
  },
] as const;

export default function ToolsPage() {
  return (
    <Container>
      <PageHeader eyebrow="Ferramentas" title="Ferramentas gratuitas">
        <p>Tudo roda no seu navegador: sem conta e sem enviar seus dados.</p>
      </PageHeader>
      <ul className="grid gap-4 sm:grid-cols-2">
        {TOOLS.map((tool) => (
          <li key={tool.href}>
            <Card className="h-full p-5">
              <Link
                href={tool.href}
                className="text-lg font-semibold underline-offset-4 hover:underline"
              >
                {tool.title}
              </Link>
              <p className="text-ink-2 mt-2 text-sm leading-6">{tool.description}</p>
            </Card>
          </li>
        ))}
      </ul>
    </Container>
  );
}
