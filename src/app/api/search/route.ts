import { after, NextResponse, type NextRequest } from "next/server";
import { getPlants } from "@/lib/api/queries";
import type { Source } from "@/lib/api/types";
import { findState } from "@/lib/geo";
import {
  clientIp,
  sendEvents,
  SESSION_COOKIE,
  VISIT_COOKIE,
  VISITOR_COOKIE,
} from "@/lib/track-core";

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
  const optedOut = request.headers.get("dnt") === "1" || request.headers.get("sec-gpc") === "1";
  const sessionToken = request.cookies.get(SESSION_COOKIE)?.value ?? null;
  if (!optedOut || sessionToken) {
    after(() =>
      sendEvents(
        {
          events: [
            {
              category: "interaction",
              action: "search.plants",
              path: request.headers.get("referer")
                ? new URL(request.headers.get("referer")!).pathname
                : "/api/search",
              properties: {
                q: query,
                state: state ?? null,
                source: source ?? null,
                results: result.data.total,
              },
            },
          ],
          visitor_id: request.cookies.get(VISITOR_COOKIE)?.value ?? null,
          session_key: request.cookies.get(VISIT_COOKIE)?.value ?? null,
          user_agent: request.headers.get("user-agent"),
          referrer: request.headers.get("referer"),
        },
        {
          apiUrl: process.env.API_URL?.trim() || "http://127.0.0.1:8000",
          secret: process.env.WEB_API_SECRET,
          ip: clientIp(request.headers),
          sessionToken,
        },
      ),
    );
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
