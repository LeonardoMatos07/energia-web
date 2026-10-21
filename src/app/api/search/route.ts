import { NextResponse, type NextRequest } from "next/server";
import { getPlants } from "@/lib/api/queries";
import type { Source } from "@/lib/api/types";
import { findState } from "@/lib/geo";

export const dynamic = "force-dynamic";

const MAX_QUERY_LENGTH = 60;
const PAGE_SIZE = 12;

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const query = (params.get("q") ?? "").trim().slice(0, MAX_QUERY_LENGTH);
  const state = findState(params.get("state"))?.state;
  const sourceParam = params.get("source");
  const source: Source | undefined =
    sourceParam === "wind" || sourceParam === "solar" ? sourceParam : undefined;

  if (query.length < 2 && !state) return NextResponse.json({ items: [] });

  const result = await getPlants({
    search: query.length >= 2 ? query : undefined,
    state,
    source,
    pageSize: PAGE_SIZE,
  });
  if (!result.ok) {
    return NextResponse.json({ items: [], total: 0, unavailable: true });
  }
  const items = result.data.items.map((plant) => ({
    slug: plant.slug,
    name: plant.name,
    kind: plant.kind,
    state: plant.state,
    source: plant.source,
  }));
  return NextResponse.json({ items, total: result.data.total });
}
