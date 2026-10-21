import type { NewsletterDescadastrarResposta } from "@/lib/api/types";
import { pageMetadata } from "@/lib/metadata";
import { callTokenEndpoint, first, TokenResultPage } from "../token-result";

export const dynamic = "force-dynamic";

export const metadata = pageMetadata({
  title: "Cancelar newsletter",
  description: "Cancelamento da inscrição na newsletter do Monitor de Curtailment.",
  path: "/newsletter/descadastrar",
  noIndex: true,
});

export default async function DescadastrarPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const token = first((await searchParams).token);
  const outcome = await callTokenEndpoint<NewsletterDescadastrarResposta>(
    "/v1/newsletter/descadastrar",
    token,
    (d) => d.descadastrado === true,
  );

  return (
    <TokenResultPage
      title="Cancelar newsletter"
      outcome={outcome}
      messages={{
        success:
          "Pronto, sua inscrição foi cancelada. Você não vai receber mais e-mails. Se mudar de ideia, é só se inscrever de novo.",
        invalid:
          "Este link de cancelamento é inválido. Use o link “cancelar inscrição” que aparece no fim de qualquer e-mail da newsletter.",
        missing:
          "Para cancelar, use o link “cancelar inscrição” no fim de qualquer e-mail da newsletter — ele cancela em um clique.",
        unavailable:
          "Não conseguimos cancelar agora por uma falha temporária. Tente abrir o link de novo em alguns minutos.",
      }}
    />
  );
}
