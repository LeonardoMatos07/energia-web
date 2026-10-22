import Link from "next/link";
import { Container, PageHeader } from "@/components/ui";
import { apiFetch, ApiError } from "@/lib/api/client";
import { pageMetadata } from "@/lib/metadata";

export const dynamic = "force-dynamic";

export const metadata = pageMetadata({
  title: "Confirmar e-mail",
  description: "Confirmação de e-mail do cadastro no Spillway.",
  path: "/verificar-email",
  noIndex: true,
});

type Outcome = "success" | "invalid" | "missing" | "unavailable";

async function verify(token: string | undefined): Promise<Outcome> {
  const clean = token?.trim();
  if (!clean) return "missing";
  if (clean.length > 200) return "invalid";
  try {
    const result = await apiFetch<{ verified: boolean }>("/v1/auth/verify-email", {
      method: "POST",
      body: { token: clean },
    });
    return result.verified ? "success" : "invalid";
  } catch (error) {
    if (error instanceof ApiError && error.isUnavailable) return "unavailable";
    return "invalid";
  }
}

const MESSAGES: Record<Outcome, string> = {
  success: "E-mail confirmado! Seu acesso gratuito está liberado. Agora é só entrar.",
  invalid:
    "Este link é inválido ou venceu. Entre com seu e-mail e senha para pedir um novo link de confirmação.",
  missing: "Link incompleto. Abra o link exatamente como ele chegou no seu e-mail.",
  unavailable:
    "Não conseguimos confirmar agora por uma falha temporária. Tente de novo em instantes.",
};

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = (await searchParams).token;
  const outcome = await verify(Array.isArray(raw) ? raw[0] : raw);

  return (
    <Container>
      <PageHeader title="Confirmação de e-mail" />
      <div
        role="status"
        className={`max-w-2xl rounded-lg border p-6 ${
          outcome === "success"
            ? "border-success bg-success-soft"
            : "border-[var(--color-line)] bg-[var(--color-surface)]"
        }`}
      >
        <p>{MESSAGES[outcome]}</p>
      </div>
      <p className="mt-6">
        <Link
          href="/entrar"
          className="bg-accent text-on-accent inline-block rounded-full px-5 py-2.5 text-sm font-semibold hover:opacity-90"
        >
          Entrar
        </Link>
      </p>
    </Container>
  );
}
