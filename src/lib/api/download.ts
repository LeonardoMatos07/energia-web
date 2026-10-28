import "server-only";
import { headers } from "next/headers";
import { visitorIpHeaders } from "@/lib/newsletter";
import { getApiBaseUrl } from "./client";

const TIMEOUT_MS = 30_000;
const PASSED_HEADERS = ["content-type", "content-disposition"] as const;

/**
 * Fetches a file from the API and hands it back as it came, so the browser downloads it from this
 * site. The visitor's address goes along, as everywhere else, so the API's limit is per person.
 */
export async function proxyDownload(path: string): Promise<Response> {
  let upstream: Response;
  try {
    upstream = await fetch(`${getApiBaseUrl()}${path}`, {
      headers: visitorIpHeaders(await headers(), process.env.WEB_API_SECRET),
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch {
    return Response.json({ detail: "Download indisponível no momento." }, { status: 503 });
  }
  if (!upstream.ok) {
    const status = upstream.status === 404 || upstream.status === 429 ? upstream.status : 502;
    const message =
      status === 429
        ? "Muitos downloads seguidos. Tente novamente em um minuto."
        : status === 404
          ? "Arquivo não encontrado."
          : "Download indisponível no momento.";
    return Response.json({ detail: message }, { status });
  }
  const out = new Headers({ "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" });
  for (const name of PASSED_HEADERS) {
    const value = upstream.headers.get(name);
    if (value) out.set(name, value);
  }
  return new Response(upstream.body, { status: 200, headers: out });
}
