import { after, NextResponse, type NextRequest } from "next/server";
import {
  clientIp,
  sendEvents,
  SESSION_COOKIE,
  VISIT_COOKIE,
  VISITOR_COOKIE,
  validAction,
  type TrackedEvent,
} from "@/lib/track-core";

export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 8_000;
const MAX_EVENTS = 20;
const MAX_PATH = 512;
const MAX_PROPERTIES_BYTES = 3_000;

function clean(raw: unknown): TrackedEvent | null {
  if (!raw || typeof raw !== "object") return null;
  const item = raw as Record<string, unknown>;
  if (!validAction(item.action)) return null;
  const properties =
    item.properties && typeof item.properties === "object" && !Array.isArray(item.properties)
      ? (item.properties as Record<string, unknown>)
      : {};
  if (JSON.stringify(properties).length > MAX_PROPERTIES_BYTES) return null;
  return {
    category: "interaction",
    action: item.action,
    path: typeof item.path === "string" ? item.path.slice(0, MAX_PATH) : undefined,
    properties,
  };
}

export async function POST(request: NextRequest) {
  const optedOut = request.headers.get("dnt") === "1" || request.headers.get("sec-gpc") === "1";
  const sessionToken = request.cookies.get(SESSION_COOKIE)?.value ?? null;
  if (optedOut && !sessionToken) return new NextResponse(null, { status: 204 });

  const text = await request.text();
  if (!text || text.length > MAX_BODY_BYTES) return new NextResponse(null, { status: 204 });
  let body: { events?: unknown };
  try {
    body = JSON.parse(text) as { events?: unknown };
  } catch {
    return new NextResponse(null, { status: 204 });
  }
  const events = (Array.isArray(body.events) ? body.events : [])
    .slice(0, MAX_EVENTS)
    .map(clean)
    .filter((event): event is TrackedEvent => event !== null);
  if (events.length === 0) return new NextResponse(null, { status: 204 });

  after(() =>
    sendEvents(
      {
        events,
        visitor_id: request.cookies.get(VISITOR_COOKIE)?.value ?? null,
        session_key: request.cookies.get(VISIT_COOKIE)?.value ?? null,
        user_agent: request.headers.get("user-agent"),
        referrer: request.headers.get("referer"),
        request_id: crypto.randomUUID(),
      },
      {
        apiUrl: process.env.API_URL?.trim() || "http://127.0.0.1:8000",
        secret: process.env.WEB_API_SECRET,
        ip: clientIp(request.headers),
        sessionToken,
      },
    ),
  );
  return new NextResponse(null, { status: 204 });
}
