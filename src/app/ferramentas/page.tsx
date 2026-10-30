import { ToolCard } from "@/components/tool-card";
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
        <p>
          O plotador roda no seu navegador, sem conta e sem enviar seus dados. As ferramentas
          marcadas pedem uma conta gratuita.
        </p>
      </PageHeader>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TOOLS.map((tool) => (
          <li key={tool.href}>
            <ToolCard tool={tool} />
          </li>
        ))}
      </ul>
    </Container>
  );
}
