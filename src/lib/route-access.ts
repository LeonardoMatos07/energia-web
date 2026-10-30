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

/** Public pages whose period and subsystem filters (?de=&ate=&sub=) are rendered per request. */
const FILTER_PATHS = [/^\/sistema$/, /^\/agua$/] as const;
const FILTER_PARAMS = [...PERIOD_PARAMS, "sub"] as const;

export function periodRewrite(pathname: string, searchParams: URLSearchParams): string | null {
  const filtered = FILTER_PATHS.some((pattern) => pattern.test(pathname));
  const params = filtered ? FILTER_PARAMS : PERIOD_PARAMS;
  if (!params.some((name) => searchParams.has(name))) return null;
  if (!filtered && !PERIOD_PATHS.some((pattern) => pattern.test(pathname))) return null;
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
