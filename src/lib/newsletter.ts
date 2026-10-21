export interface NewsletterFormState {
  status: "idle" | "success" | "error";
  message: string;
}

export const initialNewsletterState: NewsletterFormState = { status: "idle", message: "" };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type NewsletterValidation = { ok: true; email: string } | { ok: false; message: string };

export function validateNewsletterInput(email: unknown, consent: unknown): NewsletterValidation {
  const value = typeof email === "string" ? email.trim().toLowerCase() : "";
  if (!value || value.length > 254 || !EMAIL_RE.test(value)) {
    return { ok: false, message: "Informe um e-mail válido." };
  }
  if (consent !== "on" && consent !== "true" && consent !== true) {
    return {
      ok: false,
      message: "Para receber a newsletter, marque a caixa de consentimento.",
    };
  }
  return { ok: true, email: value };
}

interface HeaderReader {
  get(name: string): string | null;
}

export function visitorIpHeaders(
  incoming: HeaderReader,
  secret: string | undefined,
): Record<string, string> {
  const forwardedFor = incoming.get("x-forwarded-for") ?? "";
  const ip = (incoming.get("x-real-ip") ?? forwardedFor.split(",")[0] ?? "").trim();
  if (secret && ip) return { "X-Web-Api-Secret": secret, "X-Client-IP": ip };
  return forwardedFor ? { "X-Forwarded-For": forwardedFor } : {};
}
