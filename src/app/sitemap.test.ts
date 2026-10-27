// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { STATES } from "@/lib/geo";
import sitemap from "./sitemap";

const queries = vi.hoisted(() => ({ getPlants: vi.fn(), getReports: vi.fn() }));
vi.mock("@/lib/api/queries", () => queries);

const BASE = "http://localhost:3000";
const FIXED = [
  "/",
  "/painel",
  "/estados",
  "/usinas",
  "/relatorios",
  "/metodologia",
  "/cadastro",
  "/privacidade",
].map((path) => `${BASE}${path}`);

function plantPage(count: number, offset: number, total: number) {
  return {
    ok: true,
    data: {
      total,
      items: Array.from({ length: count }, (_, index) => ({ slug: `usina-${offset + index}` })),
    },
  };
}

async function urls() {
  return (await sitemap()).map((entry) => entry.url);
}

beforeEach(() => {
  queries.getPlants.mockReset();
  queries.getReports.mockReset();
});

describe("sitemap", () => {
  it("lists the fixed pages, every state, every report and every plant", async () => {
    queries.getReports.mockResolvedValue({
      ok: true,
      data: {
        items: [
          { slug: "relatorio-2026-09", published_at: "2026-10-03T12:00:00Z" },
          { slug: "relatorio-2026-08", published_at: null },
        ],
      },
    });
    queries.getPlants
      .mockResolvedValueOnce(plantPage(100, 0, 130))
      .mockResolvedValueOnce(plantPage(30, 100, 130));

    const list = await urls();

    expect(list).toEqual(expect.arrayContaining(FIXED));
    for (const state of STATES) {
      expect(list).toContain(`${BASE}/estados/${state.state.toLowerCase()}`);
    }
    expect(list).toContain(`${BASE}/relatorios/relatorio-2026-09`);
    expect(list).toContain(`${BASE}/relatorios/relatorio-2026-08`);
    expect(list.filter((url) => url.includes("/usinas/"))).toHaveLength(130);
    expect(queries.getPlants).toHaveBeenCalledTimes(2);
    expect(new Set(list).size).toBe(list.length);
  });

  it("carries the publication date of a report", async () => {
    queries.getReports.mockResolvedValue({
      ok: true,
      data: { items: [{ slug: "r", published_at: "2026-10-03T12:00:00Z" }] },
    });
    queries.getPlants.mockResolvedValue(plantPage(0, 0, 0));
    const entry = (await sitemap()).find((item) => item.url.endsWith("/relatorios/r"));
    expect(entry?.lastModified).toBe("2026-10-03T12:00:00Z");
  });

  it("never lists the pages that need an account", async () => {
    queries.getReports.mockResolvedValue({ ok: true, data: { items: [] } });
    queries.getPlants.mockResolvedValue(plantPage(0, 0, 0));
    const list = await urls();
    for (const path of ["/comparar", "/analises", "/conta", "/entrar", "/admin"]) {
      expect(
        list.some((url) => url === `${BASE}${path}` || url.startsWith(`${BASE}${path}/`)),
      ).toBe(false);
    }
  });

  it("falls back to the pages that do not need the API when it answers with an error", async () => {
    queries.getReports.mockResolvedValue({ ok: false, error: { status: 503 } });
    queries.getPlants.mockResolvedValue({ ok: false, error: { status: 503 } });

    const list = await urls();

    expect(list).toHaveLength(FIXED.length + STATES.length);
    expect(list).toEqual(expect.arrayContaining(FIXED));
  });

  it("falls back when the API cannot be reached at all", async () => {
    queries.getReports.mockRejectedValue(new Error("connection refused"));
    queries.getPlants.mockRejectedValue(new Error("connection refused"));

    expect(await urls()).toHaveLength(FIXED.length + STATES.length);
  });

  it("drops the plants but keeps the reports when only the plants fail half way", async () => {
    queries.getReports.mockResolvedValue({
      ok: true,
      data: { items: [{ slug: "relatorio", published_at: null }] },
    });
    queries.getPlants
      .mockResolvedValueOnce(plantPage(100, 0, 250))
      .mockResolvedValueOnce({ ok: false, error: { status: 502 } });

    const list = await urls();

    expect(list).toContain(`${BASE}/relatorios/relatorio`);
    expect(list.some((url) => url.includes("/usinas/"))).toBe(false);
  });
});
