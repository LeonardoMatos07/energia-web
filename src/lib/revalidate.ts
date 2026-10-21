import { createHash, timingSafeEqual } from "node:crypto";
import { CACHE_TAGS, type CacheTag } from "./api/types";

/**
 * Constant-time comparison. Both sides are hashed first so inputs of different
 * lengths take the same time and `timingSafeEqual` never throws.
 */
export function safeCompare(provided: string, expected: string): boolean {
  const a = createHash("sha256").update(provided, "utf8").digest();
  const b = createHash("sha256").update(expected, "utf8").digest();
  return timingSafeEqual(a, b) && provided.length === expected.length;
}

export function isCacheTag(value: unknown): value is CacheTag {
  return typeof value === "string" && (CACHE_TAGS as readonly string[]).includes(value);
}

export type ParsedTags = { ok: true; tags: CacheTag[] } | { ok: false; error: string };

/** Body `{"tags": [...]}`; a missing body or missing/empty `tags` means all tags. */
export function parseTags(body: unknown): ParsedTags {
  if (body === null || body === undefined) return { ok: true, tags: [...CACHE_TAGS] };
  if (typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, error: "Corpo deve ser um objeto JSON." };
  }
  const tags = (body as { tags?: unknown }).tags;
  if (tags === undefined || tags === null) return { ok: true, tags: [...CACHE_TAGS] };
  if (!Array.isArray(tags)) return { ok: false, error: "`tags` deve ser uma lista." };
  if (tags.length === 0) return { ok: true, tags: [...CACHE_TAGS] };
  const invalid = tags.filter((t) => !isCacheTag(t));
  if (invalid.length > 0) {
    return {
      ok: false,
      error: `Tags desconhecidas: ${invalid.map(String).join(", ")}. Válidas: ${CACHE_TAGS.join(", ")}.`,
    };
  }
  return { ok: true, tags: [...new Set(tags as CacheTag[])] };
}
