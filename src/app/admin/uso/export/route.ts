import { NextResponse, type NextRequest } from "next/server";
import { getAdminState } from "@/lib/admin-session";
import { getApiBaseUrl } from "@/lib/api/client";

export const dynamic = "force-dynamic";

const DAY_OPTIONS = [7, 30, 90, 365];

export async function GET(request: NextRequest) {
  const state = await getAdminState();
  if (state.kind !== "admin") return new NextResponse("Forbidden", { status: 403 });

  const requested = Number(request.nextUrl.searchParams.get("dias"));
  const days = DAY_OPTIONS.includes(requested) ? requested : 30;
  const response = await fetch(`${getApiBaseUrl()}/v1/admin/usage/events.csv?days=${days}`, {
    headers: { Authorization: `Bearer ${state.accessToken}` },
    cache: "no-store",
  });
  if (!response.ok) return new NextResponse("Could not export", { status: 502 });
  return new NextResponse(await response.text(), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="spillway-eventos-${days}d.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
