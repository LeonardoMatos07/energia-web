import { NextResponse } from "next/server";
import { getCurrentMember } from "@/lib/members";

export const dynamic = "force-dynamic";

export async function GET() {
  const member = await getCurrentMember();
  return NextResponse.json(
    { member: member ? { name: member.name, email: member.email } : null },
    { headers: { "Cache-Control": "no-store" } },
  );
}
