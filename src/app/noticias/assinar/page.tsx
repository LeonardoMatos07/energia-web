import { headers } from "next/headers";
import { NewsSubnav } from "@/components/news/news-subnav";
import { Card, Container, PageHeader } from "@/components/ui";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Assinar as notícias por RSS",
  description: "Receba as notícias do setor elétrico no seu leitor de notícias.",
  path: "/noticias/assinar",
});

export default async function SubscribePage() {
  const host = (await headers()).get("host");
  const protocol = host?.startsWith("localhost") ? "http" : "https";
  const feedUrl = `${host ? `${protocol}://${host}` : ""}/noticias/rss.xml`;

  return (
    <Container>
      <PageHeader eyebrow="Notícias" title="Assinar por RSS">
        <p>
          O RSS entrega as notícias novas direto no seu leitor (Feedly, Inoreader, Thunderbird e
          outros), sem precisar abrir o site.
        </p>
      </PageHeader>
      <NewsSubnav active="noticias" />
      <Card className="mt-6 p-6">
        <ol className="text-ink-2 list-decimal space-y-3 pl-5 text-base leading-7">
          <li>Copie o endereço do feed abaixo.</li>
          <li>No seu leitor de notícias, escolha “Adicionar fonte” ou “Assinar”.</li>
          <li>Cole o endereço. As notícias aparecem com fonte, data, licença e link original.</li>
        </ol>
        <p className="mt-5">
          <code className="bg-surface-2 rounded-md px-3 py-2 text-sm break-all">{feedUrl}</code>
        </p>
        <p className="text-muted mt-5 text-xs leading-5">
          O endereço do feed é um arquivo XML, feito para programas lerem, e por isso parece código
          se aberto no navegador.
        </p>
      </Card>
    </Container>
  );
}
