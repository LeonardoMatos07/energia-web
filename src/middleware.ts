import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";
import {
  clientIp,
  sendEvents,
  SESSION_COOKIE,
  VISIT_COOKIE,
  VISIT_MAX_AGE_SECONDS,
  VISITOR_COOKIE,
  VISITOR_MAX_AGE_SECONDS,
  type TrackedEvent,
} from "@/lib/track-core";
import { isProtected, periodRewrite } from "@/lib/route-access";

function isPrefetch(request: NextRequest) {
  const headers = request.headers;
  return (
    headers.has("next-router-prefetch") ||
    headers.get("purpose") === "prefetch" ||
    headers.get("sec-purpose")?.includes("prefetch") === true
  );
}

function optedOut(request: NextRequest) {
  return request.headers.get("dnt") === "1" || request.headers.get("sec-gpc") === "1";
}

export function middleware(request: NextRequest, event: NextFetchEvent) {
  const { pathname, search, searchParams } = request.nextUrl;
  const sessionToken = request.cookies.get(SESSION_COOKIE)?.value ?? null;
  const gated = isProtected(pathname) && !sessionToken;

  let response: NextResponse;
  if (gated) {
    const url = request.nextUrl.clone();
    url.pathname = "/entrar";
    url.search = `?proximo=${encodeURIComponent(`${pathname}${search}`)}`;
    response = NextResponse.redirect(url);
  } else {
    const rewritten = periodRewrite(pathname, searchParams);
    if (rewritten) {
      const url = request.nextUrl.clone();
      url.pathname = rewritten;
      response = NextResponse.rewrite(url);
    } else {
      response = NextResponse.next();
    }
  }

  if (request.method !== "GET" || isPrefetch(request)) return response;
  if (!sessionToken && optedOut(request)) return response;

  const visitorId = request.cookies.get(VISITOR_COOKIE)?.value ?? crypto.randomUUID();
  const visitKey = request.cookies.get(VISIT_COOKIE)?.value ?? crypto.randomUUID();
  const secure = request.nextUrl.protocol === "https:";
  response.cookies.set(VISITOR_COOKIE, visitorId, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: VISITOR_MAX_AGE_SECONDS,
  });
  response.cookies.set(VISIT_COOKIE, visitKey, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: VISIT_MAX_AGE_SECONDS,
  });

  const tracked: TrackedEvent = {
    category: "page",
    action: gated ? "page.gated" : "page.view",
    path: pathname,
    query: Object.fromEntries(searchParams.entries()),
    properties: { rsc: request.headers.has("rsc") },
  };
  event.waitUntil(
    sendEvents(
      {
        events: [tracked],
        visitor_id: visitorId,
        session_key: visitKey,
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
  return response;
}

export const config = {
  matcher: ["/((?!api/|_next/|.*\\.[a-zA-Z0-9]+$).*)"],
};
