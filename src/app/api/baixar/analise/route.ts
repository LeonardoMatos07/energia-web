import { type NextRequest } from "next/server";
import { proxyDownload } from "@/lib/api/download";
import { analysisApiPath, parseAnalysisDownload } from "@/lib/downloads";
import { getCurrentMember } from "@/lib/members";

export const dynamic = "force-dynamic";

/** Analyses are for members, like the page they come from. */
export async function GET(request: NextRequest) {
  if (!(await getCurrentMember())) {
    return Response.json({ detail: "Entre para baixar as análises." }, { status: 401 });
  }
  const download = parseAnalysisDownload(request.nextUrl.searchParams);
  if (!download) return Response.json({ detail: "Pedido inválido." }, { status: 400 });
  return proxyDownload(analysisApiPath(download));
}
