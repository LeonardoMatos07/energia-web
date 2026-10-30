export const PROTECTED_PREFIXES = [
  "/curtailment",
  "/estados",
  "/usinas",
  "/relatorios",
  "/comparar",
  "/analises",
  "/previsao",
  "/mercado",
  "/qualidade",
  "/tarifas",
  "/conta",
] as const;

const PERIOD_SEGMENT = "periodo";
const PERIOD_PARAMS = ["de", "ate"] as const;
const PERIOD_PATHS = [/^\/curtailment$/, /^\/estados\/[^/]+$/, /^\/usinas\/[^/]+$/] as const;

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

/** The old curtailment panel lived at /painel (now the general panel): a custom period sent there goes to its new home. */
export function legacyPanelRedirect(
  pathname: string,
  searchParams: URLSearchParams,
): string | null {
  if (pathname !== "/painel") return null;
  return PERIOD_PARAMS.some((name) => searchParams.has(name)) ? "/curtailment" : null;
}
