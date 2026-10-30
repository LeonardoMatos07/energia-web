// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { isProtected } from "@/lib/route-access";
import sitemap from "./sitemap";

vi.mock("@/lib/api/queries", () => ({
  getNews: vi.fn(async () => ({
    ok: true,
    data: {
      next_cursor: null,
      items: [
        {
          id: 7,
          has_editor_note: true,
          published_at: "2026-10-29T10:00:00Z",
          source_updated_at: null,
        },
        {
          id: 8,
          has_editor_note: false,
          published_at: "2026-10-29T10:00:00Z",
          source_updated_at: null,
        },
      ],
    },
  })),
}));

const BASE = "http://localhost:3000";

describe("sitemap", () => {
  it("lists only the pages that are open to anyone, and news pages that have a note", async () => {
    const urls = (await sitemap()).map((entry) => entry.url);

    expect(urls).toEqual(
      [
        "/",
        "/metodologia",
        "/cadastro",
        "/ferramentas",
        "/ferramentas/plotador",
        "/privacidade",
        "/noticias",
        "/noticias/atos",
        "/noticias/fontes",
        "/noticias/7",
      ].map((path) => `${BASE}${path}`),
    );
    expect(urls).not.toContain(`${BASE}/noticias/8`);
  });

  it("never lists a page that needs an account", async () => {
    for (const entry of await sitemap()) {
      expect(isProtected(new URL(entry.url).pathname)).toBe(false);
    }
  });
});
