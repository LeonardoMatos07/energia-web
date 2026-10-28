import { type NextRequest } from "next/server";
import { proxyDownload } from "@/lib/api/download";
import { isReportSlug } from "@/lib/downloads";

export const dynamic = "force-dynamic";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!isReportSlug(slug)) return Response.json({ detail: "Pedido inválido." }, { status: 400 });
  return proxyDownload(`/v1/reports/${slug}/pdf`);
}
