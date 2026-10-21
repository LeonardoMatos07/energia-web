import Link from "next/link";
import { Container, PageHeader } from "@/components/ui";
import { apiTry, withQuery } from "@/lib/api/client";

export type TokenOutcome = "missing" | "success" | "invalid" | "unavailable";

/** Calls a newsletter token endpoint (no cache: it changes state). */
export async function callTokenEndpoint<T>(
  path: string,
  token: string | undefined,
  isSuccess: (data: T) => boolean,
): Promise<TokenOutcome> {
  const clean = token?.trim();
  if (!clean || clean.length > 512) return clean ? "invalid" : "missing";
  const result = await apiTry<T>(withQuery(path, { token: clean }), { noStore: true });
  if (result.ok) return isSuccess(result.data) ? "success" : "invalid";
  return result.error.isUnavailable ? "unavailable" : "invalid";
}

export function TokenResultPage({
  title,
  outcome,
  messages,
}: {
  title: string;
  outcome: TokenOutcome;
  messages: Record<TokenOutcome, string>;
}) {
  return (
    <Container>
      <PageHeader title={title} />
      <div
        role="status"
        className={`max-w-2xl rounded-lg border p-6 ${
          outcome === "success"
            ? "border-success bg-success-soft"
            : "border-[var(--color-line)] bg-[var(--color-surface)]"
        }`}
      >
        <p className="text-base">{messages[outcome]}</p>
      </div>
      <p className="mt-6">
        <Link href="/" className="text-[var(--color-accent)] underline">
          Voltar ao painel
        </Link>
      </p>
    </Container>
  );
}

export function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}
