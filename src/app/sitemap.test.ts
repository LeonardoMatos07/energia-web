// @vitest-environment node
import { describe, expect, it } from "vitest";
import { isProtected } from "@/lib/route-access";
import sitemap from "./sitemap";

const BASE = "http://localhost:3000";

describe("sitemap", () => {
  it("lists only the pages that are open to anyone", () => {
    expect(sitemap().map((entry) => entry.url)).toEqual(
      ["/", "/metodologia", "/cadastro", "/privacidade"].map((path) => `${BASE}${path}`),
    );
  });

  it("never lists a page that needs an account", () => {
    for (const entry of sitemap()) {
      expect(isProtected(new URL(entry.url).pathname)).toBe(false);
    }
  });
});
