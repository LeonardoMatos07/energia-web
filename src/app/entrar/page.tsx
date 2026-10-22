import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth-forms";
import { Container, PageHeader } from "@/components/ui";
import { getCurrentMember } from "@/lib/members";
import { safeNextPath } from "@/lib/safe-path";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Entrar",
  description: "Entre na sua conta do Spillway.",
  path: "/entrar",
  noIndex: true,
});

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const raw = Array.isArray(params.proximo) ? params.proximo[0] : params.proximo;
  const next = safeNextPath(raw);
  if (await getCurrentMember()) redirect(next);

  return (
    <Container>
      <PageHeader title="Entrar">
        <p>Acesse o painel, a comparação, os relatórios e as análises.</p>
      </PageHeader>
      <div className="max-w-md pb-12">
        <LoginForm next={next} />
        <p className="text-ink-2 mt-8 text-sm">
          Ainda não tem conta?{" "}
          <Link href="/cadastro" className="text-accent font-medium underline">
            Criar conta gratuita
          </Link>
        </p>
      </div>
    </Container>
  );
}
