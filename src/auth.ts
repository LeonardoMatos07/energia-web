import NextAuth, { type NextAuthConfig } from "next-auth";
import Cognito from "next-auth/providers/cognito";

export function isAuthConfigured(): boolean {
  return Boolean(
    process.env.AUTH_SECRET &&
    process.env.AUTH_COGNITO_ID &&
    process.env.AUTH_COGNITO_SECRET &&
    process.env.AUTH_COGNITO_ISSUER,
  );
}

export function shouldUseSecureCookies(): boolean {
  const url = process.env.AUTH_URL || process.env.NEXT_PUBLIC_SITE_URL || "";
  return url.startsWith("https://") || process.env.VERCEL === "1";
}

declare module "next-auth" {
  interface Session {
    groups: string[];
    accessTokenExpired: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    expiresAt?: number;
    groups?: string[];
  }
}

function groupsFromProfile(profile: unknown): string[] {
  if (!profile || typeof profile !== "object") return [];
  const raw = (profile as Record<string, unknown>)["cognito:groups"];
  return Array.isArray(raw) ? raw.filter((g): g is string => typeof g === "string") : [];
}

const config = (): NextAuthConfig => ({
  trustHost: true,
  useSecureCookies: shouldUseSecureCookies(),
  providers: isAuthConfigured()
    ? [
        Cognito({
          clientId: process.env.AUTH_COGNITO_ID,
          clientSecret: process.env.AUTH_COGNITO_SECRET,
          issuer: process.env.AUTH_COGNITO_ISSUER,
          checks: ["pkce", "state", "nonce"],
          authorization: { params: { scope: "openid email profile" } },
        }),
      ]
    : [],
  session: { strategy: "jwt", maxAge: 8 * 60 * 60 },
  pages: { signIn: "/admin" },
  callbacks: {
    jwt({ token, account, profile }) {
      if (account) {
        token.accessToken = account.access_token;
        token.expiresAt = account.expires_at;
        token.groups = groupsFromProfile(profile);
      }
      return token;
    },
    session({ session, token }) {
      session.groups = token.groups ?? [];
      session.accessTokenExpired =
        !token.accessToken || (token.expiresAt ?? 0) * 1000 <= Date.now() + 30_000;
      return session;
    },
  },
});

export const { handlers, auth, signIn, signOut } = NextAuth(config);
