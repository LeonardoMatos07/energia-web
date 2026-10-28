import Link from "next/link";
import { MemberUnsubscribe } from "@/components/member-unsubscribe";
import { Container, PageHeader } from "@/components/ui";
import type { UnsubscribedResponse } from "@/lib/api/types";
import { getCurrentMember } from "@/lib/members";
import { pageMetadata } from "@/lib/metadata";
import { callTokenEndpoint, first, TokenResultPage } from "../token-result";

export const dynamic = "force-dynamic";

export const metadata = pageMetadata({
  title: "Cancelar newsletter",
  description: "Cancelamento da inscrição na newsletter do Spillway.",
  path: "/newsletter/descadastrar",
  noIndex: true,
});

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const token = first((await searchParams).token);
  const member = token ? null : await getCurrentMember();
  if (member) {
    return (
      <Container>
        <PageHeader title="Cancelar newsletter" />
        <MemberUnsubscribe enabled={member.marketing_opt_in} />
        <p className="mt-6">
          <Link href="/" className="text-[var(--color-accent)] underline">
            Voltar ao início
          </Link>
        </p>
      </Container>
    );
  }
  const outcome = await callTokenEndpoint<UnsubscribedResponse>(
    "/v1/newsletter/unsubscribe",
    token,
    (d) => d.unsubscribed === true,
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
