import "server-only";
import { getToken } from "next-auth/jwt";
import { headers } from "next/headers";
import { auth, isAuthConfigured, shouldUseSecureCookies } from "@/auth";

export type AdminState =
  | { kind: "not-configured" }
  | { kind: "anonymous" }
  | { kind: "expired"; email: string | null }
  | { kind: "forbidden"; email: string | null }
  | { kind: "admin"; email: string | null; accessToken: string };

/** Resolves the admin state for the current request. Server-side only. */
export async function getAdminState(): Promise<AdminState> {
  if (!isAuthConfigured()) return { kind: "not-configured" };

  const session = await auth();
  if (!session?.user) return { kind: "anonymous" };
  const email = session.user.email ?? null;

  // The API enforces authorization too; this check only avoids a useless round trip.
  if (!session.groups.includes("admin")) return { kind: "forbidden", email };
  if (session.accessTokenExpired) return { kind: "expired", email };

  const token = await getToken({
    req: { headers: await headers() },
    secret: process.env.AUTH_SECRET,
    secureCookie: shouldUseSecureCookies(),
  });
  if (!token?.accessToken) return { kind: "expired", email };
  return { kind: "admin", email, accessToken: token.accessToken };
}
