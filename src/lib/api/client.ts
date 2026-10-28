import "server-only";
import type { CacheTag } from "./types";

export const DEFAULT_REVALIDATE_SECONDS = 3_600;
const DEFAULT_TIMEOUT_MS = 10_000;

export class ApiError extends Error {
  readonly status: number;
  readonly detail: string;

  constructor(status: number, detail: string) {
    super(`API ${status}: ${detail}`);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
  }

  get isNotFound(): boolean {
    return this.status === 404;
  }

  get isUnavailable(): boolean {
    return this.status === 0 || this.status >= 500;
  }
}

export interface ApiFetchOptions {
  tags?: CacheTag[];
  revalidate?: number;
  noStore?: boolean;
  method?: "GET" | "POST" | "PUT";
  body?: unknown;
  accessToken?: string;
  headers?: Record<string, string>;
  timeoutMs?: number;
}

export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: ApiError };

export function getApiBaseUrl(): string {
  const base = process.env.API_URL?.trim() || "http://127.0.0.1:8000";
  return base.replace(/\/+$/, "");
}

export function withQuery(
  path: string,
  query: Record<string, string | number | boolean | null | undefined>,
): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") continue;
    params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
}

function detailToString(detail: unknown): string {
  if (typeof detail === "string") return detail;
  if (detail === undefined || detail === null) return "";
  try {
    return JSON.stringify(detail);
  } catch {
    return String(detail);
  }
}

async function readErrorDetail(response: Response): Promise<string> {
  try {
    const body: unknown = await response.json();
    if (body && typeof body === "object" && "detail" in body) {
      return detailToString((body as { detail: unknown }).detail) || response.statusText;
    }
  } catch {}
  return response.statusText || "Unknown error";
}

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const {
    tags,
    revalidate = DEFAULT_REVALIDATE_SECONDS,
    noStore = false,
    method = "GET",
    body,
    accessToken,
    headers: extraHeaders,
    timeoutMs = DEFAULT_TIMEOUT_MS,
  } = options;

  const headers: Record<string, string> = { Accept: "application/json", ...extraHeaders };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  const init: RequestInit & { next?: { tags?: string[]; revalidate?: number } } = {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(timeoutMs),
  };
  if (noStore || method !== "GET" || accessToken) {
    init.cache = "no-store";
  } else {
    init.next = { tags, revalidate };
  }

  let response: Response;
  try {
    response = await fetch(`${getApiBaseUrl()}${path}`, init);
  } catch (cause) {
    const reason = cause instanceof Error ? cause.message : String(cause);
    throw new ApiError(0, `API unavailable (${reason})`);
  }

  if (!response.ok) {
    throw new ApiError(response.status, await readErrorDetail(response));
  }

  if (response.status === 204) return undefined as T;
  try {
    return (await response.json()) as T;
  } catch {
    throw new ApiError(502, "The API response is not valid JSON");
  }
}

export async function apiTry<T>(path: string, options?: ApiFetchOptions): Promise<ApiResult<T>> {
  try {
    return { ok: true, data: await apiFetch<T>(path, options) };
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.isUnavailable) console.warn(`[spillway-api] ${path}: ${error.detail}`);
      return { ok: false, error };
    }
    throw error;
  }
}
