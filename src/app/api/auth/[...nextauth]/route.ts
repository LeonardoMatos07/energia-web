import { NextResponse, type NextRequest } from "next/server";
import { handlers, isAuthConfigured } from "@/auth";

function notConfigured() {
  return NextResponse.json(
    { detail: "Autenticação não configurada neste ambiente." },
    { status: 503 },
  );
}

export async function GET(request: NextRequest) {
  return isAuthConfigured() ? handlers.GET(request) : notConfigured();
}

export async function POST(request: NextRequest) {
  return isAuthConfigured() ? handlers.POST(request) : notConfigured();
}
