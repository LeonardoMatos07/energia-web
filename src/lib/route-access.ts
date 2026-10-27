export const PROTECTED_PREFIXES = ["/comparar", "/analises", "/conta"] as const;

const PERIOD_SEGMENT = "periodo";
const PERIOD_PARAMS = ["de", "ate"] as const;
const PERIOD_PATHS = [/^\/painel$/, /^\/estados\/[^/]+$/, /^\/usinas\/[^/]+$/] as const;

export function isProtected(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function periodRewrite(pathname: string, searchParams: URLSearchParams): string | null {
  if (!PERIOD_PARAMS.some((name) => searchParams.has(name))) return null;
  if (!PERIOD_PATHS.some((pattern) => pattern.test(pathname))) return null;
  return `${pathname}/${PERIOD_SEGMENT}`;
}
