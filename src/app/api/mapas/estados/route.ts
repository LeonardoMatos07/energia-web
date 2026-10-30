import { NextResponse, type NextRequest } from "next/server";
import { getGeoStatesCurtailment } from "@/lib/api/queries";
import { getSessionToken } from "@/lib/members";
import { parseStatesMapParams } from "@/lib/maps";

export const dynamic = "force-dynamic";

/** Values of the states map for one month, for the month selector and the play button. */
export async function GET(request: NextRequest) {
  // Same rule as /estados, which the middleware applies: a session cookie. The data itself is
  // public in the API; this only keeps the layer for members.
  if (!(await getSessionToken())) {
    return NextResponse.json({ detail: "Entre na sua conta para ver o mapa." }, { status: 401 });
  }
  const { mes, fonte } = parseStatesMapParams(request.nextUrl.searchParams);
  const result = await getGeoStatesCurtailment(fonte, mes ?? undefined);
  if (!result.ok) {
    const status = result.error.isNotFound ? 404 : result.error.isUnavailable ? 502 : 400;
    return NextResponse.json({ detail: "Não foi possível carregar o mapa." }, { status });
  }
  return NextResponse.json(result.data, { headers: { "Cache-Control": "private, no-store" } });
}
