import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { apiFetch, ApiError, apiTry, withQuery } from "./client";

const fetchMock = vi.fn<typeof fetch>();

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  vi.stubEnv("API_URL", "http://api.test/");
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
  fetchMock.mockReset();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("withQuery", () => {
  it("drops empty values and encodes the rest", () => {
    expect(withQuery("/v1/usinas", { busca: "são f", uf: undefined, pagina: 2, fonte: "" })).toBe(
      "/v1/usinas?busca=s%C3%A3o+f&pagina=2",
    );
    expect(withQuery("/v1/meses", {})).toBe("/v1/meses");
  });
});

describe("apiFetch", () => {
  it("calls API_URL + path with cache tags and one-day revalidation", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ meses: ["2026-09"] }));
    const data = await apiFetch<{ meses: string[] }>("/v1/meses", { tags: ["curtailment"] });
    expect(data.meses).toEqual(["2026-09"]);
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe("http://api.test/v1/meses");
    expect((init as { next?: unknown }).next).toEqual({ tags: ["curtailment"], revalidate: 3600 });
    expect(init?.cache).toBeUndefined();
  });

  it("does not cache authenticated or mutating calls", async () => {
    fetchMock.mockImplementation(async () => jsonResponse({ ok: true }));
    await apiFetch("/v1/admin/cargas", { accessToken: "tok" });
    await apiFetch("/v1/newsletter", { method: "POST", body: { email: "a@b.c" } });
    const [, getInit] = fetchMock.mock.calls[0]!;
    const [, postInit] = fetchMock.mock.calls[1]!;
    expect(getInit?.cache).toBe("no-store");
    expect((getInit?.headers as Record<string, string>).Authorization).toBe("Bearer tok");
    expect(postInit?.cache).toBe("no-store");
    expect(postInit?.body).toBe(JSON.stringify({ email: "a@b.c" }));
  });

  it("turns {detail} error bodies into ApiError", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ detail: "Usina não encontrada." }, 404));
    const error = await apiFetch("/v1/usinas/x").catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(404);
    expect((error as ApiError).detail).toBe("Usina não encontrada.");
    expect((error as ApiError).isNotFound).toBe(true);
    expect((error as ApiError).isUnavailable).toBe(false);
  });

  it("stringifies FastAPI validation details", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ detail: [{ msg: "invalid" }] }, 422));
    const error = (await apiFetch("/v1/usinas").catch((e: unknown) => e)) as ApiError;
    expect(error.detail).toContain("invalid");
  });

  it("handles non-JSON error bodies", async () => {
    fetchMock.mockResolvedValue(
      new Response("Bad gateway", { status: 502, statusText: "Bad Gateway" }),
    );
    const error = (await apiFetch("/v1/meses").catch((e: unknown) => e)) as ApiError;
    expect(error.status).toBe(502);
    expect(error.isUnavailable).toBe(true);
  });

  it("maps network failures to status 0", async () => {
    fetchMock.mockRejectedValue(new TypeError("fetch failed"));
    const error = (await apiFetch("/v1/meses").catch((e: unknown) => e)) as ApiError;
    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(0);
    expect(error.isUnavailable).toBe(true);
  });
});

describe("apiTry", () => {
  it("never throws on API errors", async () => {
    fetchMock.mockRejectedValue(new TypeError("ECONNREFUSED"));
    const result = await apiTry("/v1/meses");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.status).toBe(0);
  });

  it("returns data on success", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ itens: [] }));
    expect(await apiTry("/v1/relatorios")).toEqual({ ok: true, data: { itens: [] } });
  });
});
