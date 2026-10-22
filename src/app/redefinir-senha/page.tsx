import Link from "next/link";
import { ResetPasswordForm } from "@/components/auth-forms";
import { Container, PageHeader } from "@/components/ui";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Criar nova senha",
  description: "Crie uma nova senha para a sua conta do Spillway.",
  path: "/redefinir-senha",
  noIndex: true,
});

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = (await searchParams).token;
  const token = (Array.isArray(raw) ? raw[0] : raw)?.trim();

  return (
    <Container>
      <PageHeader title="Criar nova senha" />
      <div className="max-w-md pb-12">
        {token ? (
          <ResetPasswordForm token={token} />
        ) : (
          <p className="text-ink-2">
            Link incompleto. Peça um novo em{" "}
            <Link href="/esqueci-a-senha" className="text-accent underline">
              Esqueci a senha
            </Link>
            .
          </p>
        )}
      </div>
    </Container>
  );
}
