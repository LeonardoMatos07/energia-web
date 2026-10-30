import { PlotterApp } from "@/components/plotter/plotter-app";
import { Container, PageHeader } from "@/components/ui";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Plotador de gráficos de laboratório",
  description:
    "Cole os dados do experimento e gere o gráfico para o relatório, com unidades, barras de erro e ajuste de curva. Grátis e no seu navegador.",
  path: "/ferramentas/plotador",
});

export default function PlotterPage() {
  return (
    <Container>
      <PageHeader eyebrow="Ferramentas" title="Plotador de gráficos de laboratório">
        <p>Cole os dados, escolha o gráfico e exporte para o relatório.</p>
      </PageHeader>
      <PlotterApp />
    </Container>
  );
}
