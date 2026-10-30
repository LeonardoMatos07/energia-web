// @vitest-environment node
import { NextRequest, type NextFetchEvent } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { middleware } from "./middleware";

const fetchMock = vi.fn(
  async (_url: string, _init?: RequestInit) => new Response(null, { status: 202 }),
);

function run(path: string, init: { cookie?: string; headers?: Record<string, string> } = {}) {
  const headers = new Headers(init.headers);
  if (init.cookie) headers.set("cookie", init.cookie);
  const request = new NextRequest(`http://localhost:3000${path}`, { headers });
  const waitUntil = vi.fn();
  const response = middleware(request, { waitUntil } as unknown as NextFetchEvent);
  return { response, waitUntil };
}

async function sentActions(waitUntil: ReturnType<typeof vi.fn>) {
  await Promise.all(waitUntil.mock.calls.map(([promise]) => promise));
  return fetchMock.mock.calls.flatMap(([, init]) => {
    const body = JSON.parse(String(init?.body)) as {
      events: { action: string }[];
    };
    return body.events.map((event) => event.action);
  });
}

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  fetchMock.mockClear();
  vi.unstubAllGlobals();
});

describe("middleware: public pages", () => {
  it.each(["/", "/painel", "/sistema", "/agua", "/metodologia", "/privacidade", "/cadastro"])(
    "serves %s without a session",
    (path) => {
      const { response } = run(path);
      expect(response.status).toBe(200);
      expect(response.headers.get("location")).toBeNull();
    },
  );

  it("records a page view, not a gated one", async () => {
    const { waitUntil } = run("/metodologia");
    expect(await sentActions(waitUntil)).toEqual(["page.view"]);
  });
});

const GATED = [
  "/curtailment",
  "/estados",
  "/estados/ba",
  "/usinas",
  "/usinas/sao-fernando-4-rnesf4",
  "/relatorios",
  "/relatorios/curtailment-em-setembro-de-2026",
  "/comparar",
  "/analises",
  "/previsao",
  "/conta",
];

describe("middleware: pages that need an account", () => {
  it.each(GATED)("sends %s to the login", (path) => {
    const { response } = run(`${path}?x=1`);
    expect(response.status).toBe(307);
    const location = new URL(response.headers.get("location") ?? "");
    expect(location.pathname).toBe("/entrar");
    expect(location.searchParams.get("proximo")).toBe(`${path}?x=1`);
  });

  it("records the blocked visit as page.gated", async () => {
    const { waitUntil } = run("/estados/ba");
    expect(await sentActions(waitUntil)).toEqual(["page.gated"]);
  });

  it.each(GATED)("lets a member into %s", (path) => {
    const { response } = run(path, { cookie: "spillway_session=token" });
    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
  });
});

describe("middleware: custom periods", () => {
  it("sends an old /painel period link to /curtailment", () => {
    const { response } = run("/painel?de=2026-01&ate=2026-06");
    expect(response.status).toBe(308);
    const location = new URL(response.headers.get("location") ?? "");
    expect(location.pathname).toBe("/curtailment");
    expect(location.search).toBe("?de=2026-01&ate=2026-06");
  });

  it("sends an old /painel period link to /curtailment", () => {
    const { response } = run("/painel?de=2026-01&ate=2026-06");
    expect(response.status).toBe(308);
    const location = new URL(response.headers.get("location") ?? "");
    expect(location.pathname).toBe("/curtailment");
    expect(location.search).toBe("?de=2026-01&ate=2026-06");
  });

  it("rewrites a period for a member to the dynamic variant, keeping the URL", () => {
    const { response } = run("/estados/rn?de=2026-01&ate=2026-06", {
      cookie: "spillway_session=token",
    });
    const target = new URL(response.headers.get("x-middleware-rewrite") ?? "");
    expect(target.pathname).toBe("/estados/rn/periodo");
    expect(target.search).toBe("?de=2026-01&ate=2026-06");
  });

  it("does not rewrite a page without a period", () => {
    const { response } = run("/estados/rn", { cookie: "spillway_session=token" });
    expect(response.headers.get("x-middleware-rewrite")).toBeNull();
  });

  it("does not rewrite a period on a gated page for a visitor", () => {
    const { response } = run("/comparar?de=2026-01");
    expect(response.status).toBe(307);
    expect(response.headers.get("x-middleware-rewrite")).toBeNull();
  });
});

describe("middleware: measurement", () => {
  it("skips prefetches and honours Do Not Track for visitors", async () => {
    const prefetch = run("/metodologia", { headers: { "next-router-prefetch": "1" } });
    const dnt = run("/metodologia", { headers: { dnt: "1" } });
    expect(prefetch.waitUntil).not.toHaveBeenCalled();
    expect(dnt.waitUntil).not.toHaveBeenCalled();
    expect(dnt.response.headers.get("set-cookie")).toBeNull();
  });

  it("sets the first-party cookies on a normal visit", () => {
    const { response } = run("/metodologia");
    const cookies = response.headers.get("set-cookie") ?? "";
    expect(cookies).toContain("spillway_vid=");
    expect(cookies).toContain("spillway_sid=");
  });
});
