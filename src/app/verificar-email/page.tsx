import { Container, PageHeader } from "@/components/ui";
import { VerifyStandalone } from "@/components/verify-standalone";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Confirmar e-mail",
  description: "Digite o código de 6 dígitos enviado para o seu e-mail.",
  path: "/verificar-email",
  noIndex: true,
});

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = (await searchParams).email;
  const email = (Array.isArray(raw) ? raw[0] : raw)?.trim().slice(0, 254) ?? "";
  return (
    <Container>
      <PageHeader title="Confirme seu e-mail">
        <p>Digite o código de 6 dígitos que enviamos para você.</p>
      </PageHeader>
      <div className="max-w-md pb-12">
        <VerifyStandalone initialEmail={email} />
      </div>
    </Container>
  );
}
