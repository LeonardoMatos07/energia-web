import { revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { parseTags, safeCompare } from "@/lib/revalidate";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const expected = process.env.REVALIDATE_SECRET;
  if (!expected) {
    return NextResponse.json(
      { detail: "Revalidation is not configured (REVALIDATE_SECRET is missing)." },
      { status: 503 },
    );
  }

  const provided = request.headers.get("x-revalidate-secret") ?? "";
  if (!safeCompare(provided, expected)) {
    return NextResponse.json({ detail: "Invalid secret." }, { status: 401 });
  }

  let body: unknown = null;
  const text = await request.text();
  if (text.trim()) {
    try {
      body = JSON.parse(text);
    } catch {
      return NextResponse.json({ detail: "The body is not valid JSON." }, { status: 400 });
    }
  }

  const parsed = parseTags(body);
  if (!parsed.ok) {
    return NextResponse.json({ detail: parsed.error }, { status: 400 });
  }

  for (const tag of parsed.tags) {
    revalidateTag(tag);
  }

  return NextResponse.json({ revalidated: true, tags: parsed.tags, at: new Date().toISOString() });
}
