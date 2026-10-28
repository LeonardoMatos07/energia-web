export const ANALYSIS_TABLES = [
  { key: "summary", label: "Resumo" },
  { key: "subsystems", label: "Subsistemas por mês" },
  { key: "operators", label: "Empresas" },
  { key: "connection-points", label: "Pontos de conexão" },
  { key: "hourly", label: "Perfil horário" },
] as const;

export type AnalysisTable = (typeof ANALYSIS_TABLES)[number]["key"];
export type AnalysisFormat = "pdf" | "xlsx" | "csv";

const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;
const SOURCES = ["total", "wind", "solar"] as const;
const SCOPES = ["SIN", "N", "NE", "SE", "S"] as const;
const FORMATS: readonly AnalysisFormat[] = ["pdf", "xlsx", "csv"];
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export interface AnalysisDownload {
  format: AnalysisFormat;
  table: AnalysisTable;
  scope: string;
  source: string;
  start?: string;
  end?: string;
}

/** What the browser asks for, checked: anything unexpected is dropped before it reaches the API. */
export function parseAnalysisDownload(params: URLSearchParams): AnalysisDownload | null {
  const format = params.get("formato") as AnalysisFormat | null;
  if (!format || !FORMATS.includes(format)) return null;
  const table = (params.get("tabela") ?? "summary") as AnalysisTable;
  if (format === "csv" && !ANALYSIS_TABLES.some((t) => t.key === table)) return null;
  const scope = params.get("escopo") ?? "SIN";
  const source = params.get("fonte") ?? "total";
  if (!(SCOPES as readonly string[]).includes(scope)) return null;
  if (!(SOURCES as readonly string[]).includes(source)) return null;
  const start = params.get("de") ?? undefined;
  const end = params.get("ate") ?? undefined;
  if ((start && !MONTH_PATTERN.test(start)) || (end && !MONTH_PATTERN.test(end))) return null;
  return { format, table, scope, source, start, end };
}

export function analysisApiPath(download: AnalysisDownload): string {
  const query = new URLSearchParams({ scope: download.scope, source: download.source });
  if (download.start) query.set("start", download.start);
  if (download.end) query.set("end", download.end);
  const file = download.format === "csv" ? `${download.table}.csv` : `analysis.${download.format}`;
  return `/v1/exports/${file}?${query}`;
}

export function isReportSlug(value: string): boolean {
  return value.length <= 200 && SLUG.test(value);
}

export interface DownloadFilters {
  scope?: string;
  source: string;
  start: string;
  end: string;
}

/** The links of the analyses page, for the filters the person is looking at. */
export function analysisDownloadHref(
  format: AnalysisFormat,
  filters: DownloadFilters,
  table?: AnalysisTable,
): string {
  const query = new URLSearchParams({
    formato: format,
    fonte: filters.source,
    de: filters.start,
    ate: filters.end,
  });
  if (filters.scope) query.set("escopo", filters.scope);
  if (table) query.set("tabela", table);
  return `/api/baixar/analise?${query}`;
}
