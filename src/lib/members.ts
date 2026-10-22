import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { apiTry } from "@/lib/api/client";
import type { MemberProfile } from "@/lib/api/types";
import { safeNextPath } from "@/lib/safe-path";

export const SESSION_COOKIE = "spillway_session";

export async function getSessionToken(): Promise<string | null> {
  return (await cookies()).get(SESSION_COOKIE)?.value ?? null;
}

export const getCurrentMember = cache(async (): Promise<MemberProfile | null> => {
  const token = await getSessionToken();
  if (!token) return null;
  const result = await apiTry<MemberProfile>("/v1/auth/me", { accessToken: token });
  return result.ok ? result.data : null;
});

export async function requireMember(next?: string): Promise<MemberProfile> {
  const member = await getCurrentMember();
  if (member) return member;
  const target = next ? `/entrar?proximo=${encodeURIComponent(safeNextPath(next))}` : "/entrar";
  redirect(target);
}
