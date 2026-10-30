import Link from "next/link";
import { DataAttribution } from "@/components/data-attribution";
import { Pagination } from "@/components/pagination";
import { Card, Container, DataUnavailable, Notice, PageHeader, Section } from "@/components/ui";
import { getReliability } from "@/lib/api/queries";
import { formatNumber } from "@/lib/format";
import { LIMIT_LABEL, limitStatus } from "@/lib/market";
import { pageMetadata } from "@/lib/metadata";
import { paginate, parsePage, RANKING_PAGE_SIZE } from "@/lib/pagination";

export const metadata = pageMetadata({
  title: "Qualidade do fornecimento (DEC e FEC)",
  description:
    "Quanto tempo e quantas vezes a luz faltou em cada distribuidora, com os limites regulatórios da ANEEL.",
  path: "/qualidade",
  noIndex: true,
});

type SearchParams = Record<string, string | string[] | undefined>;
const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

export default async function QualityPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const requested = Number(first(params.ano));
  const result = await getReliability(Number.isInteger(requested) ? requested : undefined);
  const ranking = result.ok
    ? paginate(result.data.items, parsePage(first(params.pagina)), RANKING_PAGE_SIZE)
    : null;

  return (
    <Container>
      <PageHeader
        eyebrow="Qualidade"
        title="Quanto tempo a luz faltou, distribuidora por distribuidora"
      >
        <p>
          O DEC é as horas, no ano, em que um consumidor típico ficou sem energia. O FEC é quantas
          vezes. A ANEEL fixa limites por conjunto elétrico; aqui os números de cada conjunto são
          somados pela distribuidora, ponderados pelo número de consumidores.
        </p>
      </PageHeader>

      {!result.ok ? (
        <DataUnavailable />
      ) : (
        <Section id="ranking" title={`Ranking de ${result.data.year}, do maior DEC ao menor`}>
          <nav aria-label="Ano" className="mb-4 flex flex-wrap gap-2">
            {[...result.data.years].reverse().map((year) => (
              <Link
                key={year}
                href={`/qualidade?ano=${year}`}
                aria-current={year === result.data.year ? "page" : undefined}
                className={`rounded-full border px-3 py-1.5 text-sm ${
                  year === result.data.year
                    ? "bg-accent text-on-accent border-transparent"
                    : "border-grid text-ink-2 hover:text-ink"
                }`}
              >
                {year}
              </Link>
            ))}
          </nav>
          {result.data.months_with_data < 12 ? (
            <div className="mb-4">
              <Notice>
                {result.data.year} está em andamento: os valores somam os{" "}
                {result.data.months_with_data} primeiros meses publicados pela ANEEL, então ainda
                não dá para comparar com o limite anual.
              </Notice>
            </div>
          ) : null}
          <Card className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <caption className="sr-only">
                DEC e FEC por distribuidora em {result.data.year}
              </caption>
              <thead className="bg-surface-2 text-ink-2 text-left">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">
                    #
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Distribuidora
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">
                    Consumidores
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">
                    DEC (horas)
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">
                    FEC (vezes)
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Limite anual
                  </th>
                </tr>
              </thead>
              <tbody className="tabular">
                {ranking?.items.map((item, index) => {
                  const dec = limitStatus(item, "dec");
                  const fec = limitStatus(item, "fec");
                  const worst = dec === "above" || fec === "above" ? "above" : dec;
                  return (
                    <tr key={item.cnpj} className="border-grid border-t">
                      <td className="text-muted px-4 py-2.5">{ranking.start + index + 1}</td>
                      <th scope="row" className="px-4 py-2.5 text-left font-medium">
                        <Link
                          className="underline-offset-2 hover:underline"
                          href={`/qualidade/${item.cnpj}?ano=${result.data.year}`}
                        >
                          {item.acronym}
                        </Link>
                      </th>
                      <td className="px-4 py-2.5 text-right">{formatNumber(item.consumers, 0)}</td>
                      <td className="px-4 py-2.5 text-right">
                        {formatNumber(item.dec_hours, 2, 2)}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        {formatNumber(item.fec_count, 2, 2)}
                      </td>
                      <td className="px-4 py-2.5">{LIMIT_LABEL[worst]}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
          {ranking ? (
            <Pagination
              page={ranking.page}
              pages={ranking.pages}
              hasNext={ranking.page < ranking.pages}
              hrefFor={(n) => `/qualidade?ano=${result.data.year}${n === 1 ? "" : `&pagina=${n}`}`}
            />
          ) : null}
          <p className="text-muted mt-3 max-w-3xl text-xs leading-5">
            Não incluímos mapa: a ANEEL publica os conjuntos elétricos por código e nome, sem
            geometria. Compare distribuidoras de portes diferentes com cuidado: as maiores misturam
            áreas urbanas e rurais.
          </p>
          <DataAttribution source={result.data.source} />
        </Section>
      )}
    </Container>
  );
}
