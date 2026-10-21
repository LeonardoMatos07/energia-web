import { revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { parseTags, safeCompare } from "@/lib/revalidate";

export const dynamic = "force-dynamic";

/**
 * Called by `energia-api` at the end of each pipeline load (contract, "Revalidação do portal"):
 * `POST /api/revalidar` with header `x-revalidate-secret` and body `{"tags": [...]}`.
 */
export async function POST(request: NextRequest) {
  const expected = process.env.REVALIDATE_SECRET;
  if (!expected) {
    return NextResponse.json(
      { detail: "Revalidação não configurada (REVALIDATE_SECRET ausente)." },
      { status: 503 },
    );
  }

  const provided = request.headers.get("x-revalidate-secret") ?? "";
  if (!safeCompare(provided, expected)) {
    return NextResponse.json({ detail: "Segredo inválido." }, { status: 401 });
  }

  let body: unknown = null;
  const text = await request.text();
  if (text.trim()) {
    try {
      body = JSON.parse(text);
    } catch {
      return NextResponse.json({ detail: "Corpo não é JSON válido." }, { status: 400 });
    }
  }

  const parsed = parseTags(body);
  if (!parsed.ok) {
    return NextResponse.json({ detail: parsed.error }, { status: 400 });
  }

  for (const tag of parsed.tags) {
    revalidateTag(tag);
  }

  return NextResponse.json({ revalidado: true, tags: parsed.tags, em: new Date().toISOString() });
}
