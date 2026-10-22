export const SESSION_COOKIE = "spillway_session";
export const VISITOR_COOKIE = "spillway_vid";
export const VISIT_COOKIE = "spillway_sid";
export const VISITOR_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;
export const VISIT_MAX_AGE_SECONDS = 60 * 30;

const SEND_TIMEOUT_MS = 2500;
const MAX_ACTION_LENGTH = 80;
const ACTION_PATTERN = /^[a-z0-9_.:-]+$/;

export interface TrackedEvent {
  category: "page" | "interaction";
  action: string;
  path?: string;
  query?: Record<string, string>;
  section?: string;
  entity_type?: string;
  entity_id?: string;
  properties?: Record<string, unknown>;
}

export interface EventEnvelope {
  events: TrackedEvent[];
  visitor_id?: string | null;
  session_key?: string | null;
  user_agent?: string | null;
  referrer?: string | null;
  request_id?: string;
}

export interface SendOptions {
  apiUrl: string;
  secret?: string;
  ip?: string;
  sessionToken?: string | null;
}

export function validAction(action: unknown): action is string {
  return (
    typeof action === "string" &&
    action.length > 0 &&
    action.length <= MAX_ACTION_LENGTH &&
    ACTION_PATTERN.test(action)
  );
}

export function clientIp(headers: { get(name: string): string | null }): string {
  const forwarded = headers.get("x-forwarded-for") ?? "";
  return (headers.get("x-real-ip") ?? forwarded.split(",")[0] ?? "").trim();
}

export async function sendEvents(envelope: EventEnvelope, options: SendOptions): Promise<void> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (options.secret) headers["X-Web-Api-Secret"] = options.secret;
  if (options.secret && options.ip) headers["X-Client-IP"] = options.ip;
  if (options.sessionToken) headers.Authorization = `Bearer ${options.sessionToken}`;
  try {
    await fetch(`${options.apiUrl.replace(/\/+$/, "")}/v1/events`, {
      method: "POST",
      headers,
      body: JSON.stringify(envelope),
      signal: AbortSignal.timeout(SEND_TIMEOUT_MS),
      cache: "no-store",
    });
  } catch {}
}
