import type { NewsletterConfirmarResposta } from "@/lib/api/types";
import { pageMetadata } from "@/lib/metadata";
import { callTokenEndpoint, first, TokenResultPage } from "../token-result";

export const dynamic = "force-dynamic";

export const metadata = pageMetadata({
  title: "Confirmar inscrição na newsletter",
  description: "Confirmação de inscrição na newsletter do Monitor de Curtailment.",
  path: "/newsletter/confirmar",
  noIndex: true,
});

export default async function ConfirmarPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const token = first((await searchParams).token);
  const outcome = await callTokenEndpoint<NewsletterConfirmarResposta>(
    "/v1/newsletter/confirmar",
    token,
    (d) => d.confirmado === true,
  );

  return (
    <TokenResultPage
      title="Confirmação de inscrição"
      outcome={outcome}
      messages={{
        success:
          "Inscrição confirmada! Você vai receber o resumo mensal quando novos dados forem publicados.",
        invalid:
          "Este link de confirmação é inválido ou expirou. Inscreva-se novamente na página inicial para receber um novo link.",
        missing:
          "Link incompleto. Abra o link de confirmação exatamente como ele chegou no seu e-mail.",
        unavailable:
          "Não conseguimos confirmar agora por uma falha temporária. Tente abrir o link de novo em alguns minutos.",
      }}
    />
  );
}
