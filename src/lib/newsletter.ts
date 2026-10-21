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

/**
 * Headers that tell energia-api who the visitor is, so its per-IP rate limit does not
 * lump every visitor under this server's IP. The API only trusts `X-Cliente-IP` when
 * `X-Web-Api-Secret` matches its WEB_API_SECRET; without the secret we fall back to
 * forwarding X-Forwarded-For.
 */
export function visitorIpHeaders(
  incoming: HeaderReader,
  secret: string | undefined,
): Record<string, string> {
  const forwardedFor = incoming.get("x-forwarded-for") ?? "";
  // On Vercel x-real-ip is the visitor; elsewhere the left-most X-Forwarded-For entry is.
  const ip = (incoming.get("x-real-ip") ?? forwardedFor.split(",")[0] ?? "").trim();
  if (secret && ip) return { "X-Web-Api-Secret": secret, "X-Cliente-IP": ip };
  return forwardedFor ? { "X-Forwarded-For": forwardedFor } : {};
}
