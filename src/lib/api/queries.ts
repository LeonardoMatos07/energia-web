import "server-only";
import { apiTry, withQuery } from "./client";
import type {
  CurtailmentSinResposta,
  CurtailmentUfResposta,
  FonteAgregada,
  Fonte,
  MesesResposta,
  Relatorio,
  RelatoriosResposta,
  TipoUsina,
  UsinaDetalheResposta,
  UsinasResposta,
} from "./types";

/** Public read endpoints, one function per contract route, with their cache tags. */

export function getCurtailmentSin(fonte: FonteAgregada = "total", inicio?: string, fim?: string) {
  return apiTry<CurtailmentSinResposta>(withQuery("/v1/curtailment/sin", { fonte, inicio, fim }), {
    tags: ["curtailment"],
  });
}

export function getCurtailmentUf(uf: string, fonte: FonteAgregada = "total", mes?: string) {
  return apiTry<CurtailmentUfResposta>(
    withQuery(`/v1/curtailment/uf/${encodeURIComponent(uf)}`, { fonte, mes }),
    { tags: ["curtailment", "usinas"] },
  );
}

export interface UsinasFiltro {
  busca?: string;
  uf?: string;
  fonte?: Fonte;
  tipo?: TipoUsina;
  pagina?: number;
  tamanho?: number;
}

export function getUsinas(filtro: UsinasFiltro = {}) {
  return apiTry<UsinasResposta>(withQuery("/v1/usinas", { ...filtro }), { tags: ["usinas"] });
}

export function getUsina(slug: string) {
  return apiTry<UsinaDetalheResposta>(`/v1/usinas/${encodeURIComponent(slug)}`, {
    tags: ["usinas", "curtailment"],
  });
}

export function getMeses() {
  return apiTry<MesesResposta>("/v1/meses", { tags: ["curtailment"] });
}

export function getRelatorios() {
  return apiTry<RelatoriosResposta>("/v1/relatorios", { tags: ["relatorios"] });
}

export function getRelatorio(slug: string) {
  return apiTry<Relatorio>(`/v1/relatorios/${encodeURIComponent(slug)}`, {
    tags: ["relatorios"],
  });
}
