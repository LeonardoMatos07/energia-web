/**
 * API types written by hand from `energia-api/docs/contrato-fase1.md` (Fase 1).
 *
 * Once `energia-api` publishes its OpenAPI document, run `pnpm gen:api` to generate
 * `src/lib/api/schema.d.ts` and replace these aliases with the generated
 * `components["schemas"][...]` types. Keys mirror the database columns (contract rule).
 */

export type Fonte = "eolica" | "solar";
export type FonteAgregada = Fonte | "total";
export type Subsistema = "N" | "NE" | "S" | "SE";
export type SubsistemaOuSin = Subsistema | "SIN";
export type TipoUsina = "usina" | "conjunto";
export type BasePreco = "PLD" | "CMO" | "PLD_FILLED" | "CMO_FILLED";
export type StatusCarga = "em_andamento" | "sucesso" | "falha";

/** Month as returned by the API: `YYYY-MM`. */
export type Mes = string;
/** ISO 8601 timestamp (UTC). */
export type Timestamp = string;

/** Columns shared by `curtailment_mensal_uf` and `curtailment_mensal_sin`. */
export interface CurtailmentAgregadoBase {
  fonte: FonteAgregada;
  mes: Mes;
  geracao_verificada_mwh: number;
  energia_cortada_mwh: number;
  percentual_corte: number | null;
  corte_rel_mwh: number;
  corte_cnf_mwh: number;
  corte_ene_mwh: number;
  corte_outros_mwh: number;
  perda_estimada_brl: number | null;
  usinas_afetadas: number;
  atualizado_em: Timestamp;
}

export interface CurtailmentMensalUf extends CurtailmentAgregadoBase {
  uf: string;
}

export interface CurtailmentMensalSin extends CurtailmentAgregadoBase {
  subsistema: SubsistemaOuSin;
}

export interface CurtailmentMensalUsina {
  usina_id: string;
  mes: Mes;
  geracao_verificada_mwh: number;
  energia_cortada_mwh: number;
  percentual_corte: number | null;
  corte_rel_mwh: number;
  corte_cnf_mwh: number;
  corte_ene_mwh: number;
  corte_outros_mwh: number;
  perda_estimada_brl: number | null;
  base_preco: BasePreco | null;
  horas_restritas: number;
  percentual_corte_medio_uf: number | null;
  posicao_nacional: number | null;
  posicao_uf: number | null;
  atualizado_em: Timestamp;
}

export interface UsinaResumo {
  id: string;
  tipo: TipoUsina;
  nome: string;
  slug: string;
  fonte: Fonte;
  uf: string;
  subsistema: Subsistema;
  potencia_mw: number | null;
}

export interface Usina extends UsinaResumo {
  conjunto_id: string | null;
  ceg: string | null;
  ponto_conexao: string | null;
  agente_operador: string | null;
  atualizado_em: Timestamp;
}

export interface UsinaRanking extends UsinaResumo {
  posicao: number;
  energia_cortada_mwh: number;
  percentual_corte: number | null;
  perda_estimada_brl: number | null;
}

export interface RelatorioResumo {
  mes: Mes;
  titulo: string;
  slug: string;
  resumo: string | null;
  publicado_em: Timestamp | null;
}

export interface Relatorio extends RelatorioResumo {
  conteudo: string;
}

export interface CargaExecucao {
  id: number;
  dataset: string;
  periodo: string | null;
  arquivo: string | null;
  hash: string | null;
  linhas: number | null;
  inicio: Timestamp;
  fim: Timestamp | null;
  status: StatusCarga;
  detalhe: string | null;
}

// ---- Response envelopes ---------------------------------------------------------------

/** GET /v1/curtailment/sin */
export interface CurtailmentSinResposta {
  itens: CurtailmentMensalSin[];
}

/** GET /v1/curtailment/uf/{uf} */
export interface CurtailmentUfResposta {
  serie: CurtailmentMensalUf[];
  ranking: UsinaRanking[];
  mes_ranking: Mes | null;
}

/** GET /v1/usinas */
export interface UsinasResposta {
  itens: UsinaResumo[];
  total: number;
  pagina: number;
  tamanho: number;
}

/** GET /v1/usinas/{slug} */
export interface UsinaDetalheResposta {
  usina: Usina;
  conjunto: UsinaResumo | null;
  usinas_do_conjunto: UsinaResumo[];
  serie: CurtailmentMensalUsina[];
}

/** GET /v1/ranking */
export interface RankingResposta {
  mes: Mes;
  itens: UsinaRanking[];
}

/** GET /v1/meses */
export interface MesesResposta {
  meses: Mes[];
}

/** GET /v1/relatorios */
export interface RelatoriosResposta {
  itens: RelatorioResumo[];
}

/** POST /v1/newsletter (always 202) */
export interface NewsletterResposta {
  mensagem: string;
}

export interface NewsletterInscricao {
  email: string;
  consentimento: true;
  origem?: string;
}

/** GET /v1/newsletter/confirmar */
export interface NewsletterConfirmarResposta {
  confirmado: boolean;
}

/** GET /v1/newsletter/descadastrar */
export interface NewsletterDescadastrarResposta {
  descadastrado: boolean;
}

/** GET /v1/admin/cargas */
export interface CargasResposta {
  itens: CargaExecucao[];
}

/**
 * GET /v1/admin/relatorios — the contract says "todos, inclusive rascunhos" without an
 * envelope; assumed to follow the `{"itens": [...]}` pattern of the public listing.
 */
export interface AdminRelatoriosResposta {
  itens: Relatorio[];
}

/** POST /v1/admin/relatorios body */
export interface RelatorioEntrada {
  mes: Mes;
  titulo: string;
  resumo?: string | null;
  conteudo: string;
  publicar: boolean;
}

/** POST /v1/admin/revalidar body */
export interface RevalidarEntrada {
  tags?: CacheTag[];
}

/** Error body for every non-2xx response. */
export interface ErroApi {
  detail: string | unknown;
}

/** Cache tags shared between the API and the portal (contract, "Revalidação do portal"). */
export const CACHE_TAGS = ["curtailment", "usinas", "relatorios"] as const;
export type CacheTag = (typeof CACHE_TAGS)[number];
