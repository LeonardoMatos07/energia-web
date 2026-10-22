import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "spillway_session";

export function middleware(request: NextRequest) {
  if (request.cookies.has(SESSION_COOKIE)) return NextResponse.next();
  const url = request.nextUrl.clone();
  const next = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  url.pathname = "/entrar";
  url.search = `?proximo=${encodeURIComponent(next)}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/painel/:path*",
    "/estados/:path*",
    "/usinas/:path*",
    "/comparar/:path*",
    "/relatorios/:path*",
    "/analises/:path*",
    "/conta/:path*",
  ],
};
