import { NewsSubnav } from "@/components/news/news-subnav";
import { Card, Container, DataUnavailable, PageHeader } from "@/components/ui";
import { getNewsSources } from "@/lib/api/queries";
import { formatDate } from "@/lib/format";
import { pageMetadata } from "@/lib/metadata";
import { licenseLabel } from "@/lib/news";

export const metadata = pageMetadata({
  title: "Fontes e licenças das notícias",
  description:
    "De onde vêm as notícias do Spillway, sob qual licença cada fonte publica, como coletamos e como pedir correção ou remoção.",
  path: "/noticias/fontes",
});

const CONTACT = "leonardomatos.bcet@gmail.com";

export default async function SourcesPage() {
  const sources = await getNewsSources();

  return (
    <Container>
      <PageHeader eyebrow="Notícias" title="Fontes e licenças">
        <p>
          Só entram fontes públicas oficiais que declaram a licença no próprio site. Mostramos o
          texto como foi publicado, sem alterações, sempre com a referência completa.
        </p>
      </PageHeader>
      <NewsSubnav active="fontes" />

      <div className="mt-8 space-y-4">
        {!sources.ok ? (
          <DataUnavailable title="Não foi possível carregar as fontes">
            {sources.error.detail}
          </DataUnavailable>
        ) : (
          sources.data.items.map((source) => (
            <Card key={source.slug} as="section" className="p-5">
              <h2 className="text-lg font-semibold">{source.publisher_name}</h2>
              <dl className="mt-2 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-[10rem_1fr]">
                <dt className="text-muted">Site</dt>
                <dd>
                  <a
                    href={source.homepage_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    {source.homepage_url}
                  </a>
                </dd>
                <dt className="text-muted">Licença</dt>
                <dd>
                  <a
                    href={source.license_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    {licenseLabel(source.license_code)}
                  </a>
                </dd>
                <dt className="text-muted">Conferida em</dt>
                <dd>
                  {source.license_verified_at ? (
                    <>
                      {formatDate(source.license_verified_at)}
                      {source.license_evidence_url ? (
                        <>
                          {" "}
                          (
                          <a
                            href={source.license_evidence_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline"
                          >
                            onde aparece
                          </a>
                          )
                        </>
                      ) : null}
                    </>
                  ) : (
                    "ainda não registrada"
                  )}
                </dd>
                <dt className="text-muted">Situação</dt>
                <dd>{source.active ? "Coletada de hora em hora" : "Ainda não coletada"}</dd>
              </dl>
            </Card>
          ))
        )}
      </div>

      <section className="prose prose-site mt-10 max-w-3xl">
        <h2>Como coletamos</h2>
        <p>
          Lemos só a página de listagem de cada fonte (título, data, link e resumo), no máximo uma
          vez por hora, respeitando o <code>robots.txt</code>, com uma requisição por segundo por
          domínio e um <em>User-Agent</em> que nos identifica. Não copiamos imagens nem o corpo das
          matérias.
        </p>
        <h2>Correção ou remoção</h2>
        <p>
          Se você representa um órgão e quer corrigir ou retirar um item, escreva para{" "}
          <a href={`mailto:${CONTACT}`}>{CONTACT}</a>. O item é escondido assim que o pedido chega.
        </p>
        <p className="text-muted text-sm">
          Esta página descreve uma leitura prática das licenças, não é um parecer jurídico.
        </p>
      </section>
    </Container>
  );
}
