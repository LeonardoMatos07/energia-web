import Link from "next/link";
import { Badge, Container, DataUnavailable, PageHeader } from "@/components/ui";
import { getUsinas, type UsinasFiltro } from "@/lib/api/queries";
import type { Fonte } from "@/lib/api/types";
import { formatFonte, formatNumber } from "@/lib/format";
import { ESTADOS, findEstado, nomeSubsistema } from "@/lib/geo";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Buscar usinas eólicas e solares",
  description:
    "Encontre uma usina ou conjunto eólico ou solar e veja quanta energia foi cortada pelo ONS, mês a mês.",
  path: "/usinas",
});

const TAMANHO = 20;

type SearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function parseFiltro(sp: SearchParams): Required<Pick<UsinasFiltro, "pagina">> & UsinasFiltro {
  const busca = first(sp.busca)?.trim().slice(0, 100) || undefined;
  const uf = findEstado(first(sp.uf))?.uf;
  const fonteRaw = first(sp.fonte);
  const fonte: Fonte | undefined =
    fonteRaw === "eolica" || fonteRaw === "solar" ? fonteRaw : undefined;
  const pagina = Math.max(1, Math.min(10_000, Number.parseInt(first(sp.pagina) ?? "1", 10) || 1));
  return { busca, uf, fonte, pagina };
}

function pageHref(filtro: UsinasFiltro, pagina: number) {
  const params = new URLSearchParams();
  if (filtro.busca) params.set("busca", filtro.busca);
  if (filtro.uf) params.set("uf", filtro.uf);
  if (filtro.fonte) params.set("fonte", filtro.fonte);
  if (pagina > 1) params.set("pagina", String(pagina));
  const qs = params.toString();
  return qs ? `/usinas?${qs}` : "/usinas";
}

export default async function UsinasPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const filtro = parseFiltro(await searchParams);
  const result = await getUsinas({ ...filtro, tamanho: TAMANHO });

  const inputClass = "w-full rounded-md border border-line bg-surface px-3 py-2 text-base";

  return (
    <Container>
      <PageHeader title="Usinas e conjuntos">
        <p>
          Busque pelo nome. Conjuntos reúnem várias usinas ligadas ao mesmo ponto da rede — o ONS
          publica o corte por conjunto, e nós o distribuímos entre as usinas.
        </p>
      </PageHeader>

      <form
        method="get"
        action="/usinas"
        role="search"
        className="grid grid-cols-1 gap-3 rounded-lg border border-[var(--color-grid)] bg-[var(--color-surface)] p-4 sm:grid-cols-[1fr_auto_auto_auto] sm:items-end"
      >
        <div>
          <label htmlFor="busca" className="mb-1 block text-sm font-medium">
            Nome da usina
          </label>
          <input
            id="busca"
            name="busca"
            type="search"
            defaultValue={filtro.busca}
            placeholder="Ex.: São Fernando"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="uf" className="mb-1 block text-sm font-medium">
            Estado
          </label>
          <select id="uf" name="uf" defaultValue={filtro.uf ?? ""} className={inputClass}>
            <option value="">Todos</option>
            {ESTADOS.map((e) => (
              <option key={e.uf} value={e.uf}>
                {e.uf} — {e.nome}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="fonte" className="mb-1 block text-sm font-medium">
            Fonte
          </label>
          <select id="fonte" name="fonte" defaultValue={filtro.fonte ?? ""} className={inputClass}>
            <option value="">Todas</option>
            <option value="eolica">Eólica</option>
            <option value="solar">Solar</option>
          </select>
        </div>
        <button
          type="submit"
          className="bg-accent text-on-accent hover:bg-accent-strong rounded-md px-4 py-2 font-semibold"
        >
          Buscar
        </button>
      </form>

      <div className="mt-6">
        {!result.ok ? (
          <DataUnavailable />
        ) : result.data.itens.length === 0 ? (
          <DataUnavailable title="Nenhuma usina encontrada">
            Tente outro nome ou remova os filtros.
          </DataUnavailable>
        ) : (
          <>
            <p className="mb-3 text-sm text-[var(--color-ink-2)]" aria-live="polite">
              {formatNumber(result.data.total, 0)}{" "}
              {result.data.total === 1 ? "resultado" : "resultados"}
            </p>
            <ul className="divide-y divide-[var(--color-grid)] rounded-lg border border-[var(--color-grid)] bg-[var(--color-surface)]">
              {result.data.itens.map((u) => (
                <li key={u.id} className="px-4 py-3">
                  <Link
                    href={`/usinas/${u.slug}`}
                    className="font-medium text-[var(--color-accent)] underline"
                  >
                    {u.nome}
                  </Link>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-[var(--color-ink-2)]">
                    <Badge>{u.tipo === "conjunto" ? "Conjunto" : "Usina"}</Badge>
                    <span>{formatFonte(u.fonte)}</span>
                    <span aria-hidden>·</span>
                    <span>{u.uf}</span>
                    <span aria-hidden>·</span>
                    <span>{nomeSubsistema(u.subsistema)}</span>
                    {u.potencia_mw !== null ? (
                      <>
                        <span aria-hidden>·</span>
                        <span>{formatNumber(u.potencia_mw, 1)} MW</span>
                      </>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
            <Pagination
              filtro={filtro}
              pagina={result.data.pagina}
              totalPaginas={Math.max(
                1,
                Math.ceil(result.data.total / (result.data.tamanho || TAMANHO)),
              )}
            />
          </>
        )}
      </div>
    </Container>
  );
}

function Pagination({
  filtro,
  pagina,
  totalPaginas,
}: {
  filtro: UsinasFiltro;
  pagina: number;
  totalPaginas: number;
}) {
  if (totalPaginas <= 1) return null;
  const linkClass =
    "rounded-md border border-line bg-surface px-3 py-1.5 text-sm hover:border-[var(--color-accent)]";
  return (
    <nav aria-label="Paginação" className="mt-4 flex items-center justify-between gap-3">
      {pagina > 1 ? (
        <Link href={pageHref(filtro, pagina - 1)} className={linkClass} rel="prev">
          ← Anterior
        </Link>
      ) : (
        <span />
      )}
      <span className="text-sm text-[var(--color-ink-2)]">
        Página {formatNumber(pagina, 0)} de {formatNumber(totalPaginas, 0)}
      </span>
      {pagina < totalPaginas ? (
        <Link href={pageHref(filtro, pagina + 1)} className={linkClass} rel="next">
          Próxima →
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
