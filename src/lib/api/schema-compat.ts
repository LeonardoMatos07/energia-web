/**
 * Compile-time drift check between the hand-written types (`types.ts`) and the types
 * generated from the API's OpenAPI document (`schema.d.ts`, `pnpm gen:api`).
 * `pnpm typecheck` fails if a response the API sends no longer fits what the portal
 * expects, or if a request body the portal sends no longer fits what the API accepts.
 */
import type { components } from "./schema";
import type * as T from "./types";

type S = components["schemas"];
type Assert<Cond extends true> = Cond;
/** Every value of A is a valid B (and both have the same keys). */
type Fits<A, B> = [A] extends [B]
  ? [keyof A] extends [keyof B]
    ? [keyof B] extends [keyof A]
      ? true
      : false
    : false
  : false;

export type ResponseChecks = [
  Assert<Fits<S["SinResposta"], T.CurtailmentSinResposta>>,
  Assert<Fits<S["UfResposta"], T.CurtailmentUfResposta>>,
  Assert<Fits<S["UsinasResposta"], T.UsinasResposta>>,
  Assert<Fits<S["UsinaDetalheResposta"], T.UsinaDetalheResposta>>,
  Assert<Fits<S["RankingResposta"], T.RankingResposta>>,
  Assert<Fits<S["MesesResposta"], T.MesesResposta>>,
  Assert<Fits<S["RelatoriosResposta"], T.RelatoriosResposta>>,
  Assert<Fits<S["Relatorio"], T.Relatorio>>,
  Assert<Fits<S["MensagemResposta"], T.NewsletterResposta>>,
  Assert<Fits<S["ConfirmadoResposta"], T.NewsletterConfirmarResposta>>,
  Assert<Fits<S["DescadastradoResposta"], T.NewsletterDescadastrarResposta>>,
  Assert<Fits<S["CargasResposta"], T.CargasResposta>>,
  Assert<Fits<S["RelatoriosAdminResposta"], T.AdminRelatoriosResposta>>,
  Assert<Fits<S["RevalidarResposta"], T.RevalidarResposta>>,
  Assert<Fits<S["CurtailmentUsina"], T.CurtailmentMensalUsina>>,
  Assert<Fits<S["Usina"], T.Usina>>,
  Assert<Fits<S["UsinaRanking"], T.UsinaRanking>>,
];

export type RequestChecks = [
  Assert<[T.NewsletterInscricao] extends [S["NewsletterEntrada"]] ? true : false>,
  Assert<[T.RelatorioEntrada] extends [S["RelatorioEntrada"]] ? true : false>,
  Assert<[T.RevalidarEntrada] extends [S["RevalidarEntrada"]] ? true : false>,
];
