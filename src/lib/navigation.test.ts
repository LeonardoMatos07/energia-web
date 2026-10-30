import { describe, expect, it } from "vitest";
import { compareHref, parseEntities } from "./compare";
import { isNavActive, NAV } from "./navigation";
import { isProtected } from "./route-access";
import { TOOLS } from "./tools";

const active = (pathname: string) =>
  NAV.filter((i) => isNavActive(pathname, i.matches)).map((i) => i.label);

describe("main menu", () => {
  it("has the main sections and nothing else", () => {
    expect(NAV.map((item) => item.label)).toEqual([
      "Painel",
      "Sistema",
      "Água",
      "Mercado",
      "Curtailment",
      "Notícias",
      "Ferramentas",
    ]);
  });

  it("keeps Mercado lit on prices and quality of supply", () => {
    for (const path of ["/mercado/pld", "/qualidade", "/qualidade/123"]) {
      expect(active(path), path).toEqual(["Mercado"]);
    }
  });

  it("keeps Curtailment lit on its hub, states, plants, the comparison and the reports", () => {
    for (const path of [
      "/curtailment",
      "/estados",
      "/estados/ba",
      "/usinas",
      "/usinas/cumaru-i",
      "/relatorios/x",
    ]) {
      expect(active(path), path).toEqual(["Curtailment"]);
    }
  });

  it("lights Notícias on the list, the acts and a single item", () => {
    for (const path of ["/noticias", "/noticias/atos", "/noticias/12"]) {
      expect(active(path), path).toEqual(["Notícias"]);
    }
  });

  it("lights exactly one section elsewhere", () => {
    expect(active("/painel")).toEqual(["Painel"]);
    expect(active("/sistema")).toEqual(["Sistema"]);
    expect(active("/agua")).toEqual(["Água"]);
    expect(active("/analises")).toEqual(["Curtailment"]);
    expect(active("/comparar")).toEqual(["Ferramentas"]);
    expect(active("/previsao")).toEqual(["Ferramentas"]);
    expect(active("/relatorios/curtailment-2026-09")).toEqual(["Curtailment"]);
    expect(active("/metodologia")).toEqual([]);
    expect(active("/comparar-usinas")).toEqual([]);
  });

  it("links members-area routes the middleware protects, except the open pages and the free tools", () => {
    const open = ["/painel", "/sistema", "/agua", "/noticias", "/ferramentas"];
    for (const item of NAV) {
      expect(isProtected(item.href), item.href).toBe(!open.includes(item.href));
    }
  });

  it("lights the area of every page listed in its dropdown", () => {
    for (const item of NAV) {
      for (const child of item.children ?? []) {
        expect(isNavActive(child.href, item.matches), child.href).toBe(true);
      }
    }
  });
});

describe("compareHref", () => {
  it("starts a comparison that the compare page can read back", () => {
    const refs = [
      { kind: "state", id: "BA" },
      { kind: "plant", id: "cumaru-i-x" },
      { kind: "subsystem", id: "NE" },
    ] as const;
    for (const ref of refs) {
      const query = new URL(compareHref(ref), "http://x").searchParams.get("itens");
      expect(parseEntities(query)).toEqual([ref]);
    }
  });
});

describe("areas and tools", () => {
  it("lists the same tools in the Ferramentas menu and on the tools page", () => {
    const menu = NAV.find((item) => item.label === "Ferramentas")?.children?.map((c) => c.href);
    expect(menu).toEqual(["/ferramentas/plotador", "/comparar", "/previsao"]);
    expect(TOOLS.map((tool) => tool.href)).toEqual(menu);
  });

  it("keeps Análises inside the Curtailment area, not in the tools", () => {
    const curtailment = NAV.find((item) => item.label === "Curtailment");
    expect(curtailment?.children?.map((c) => c.href)).toContain("/analises");
    expect(TOOLS.map((tool) => tool.href)).not.toContain("/analises");
  });

  it("marks the tools that need an account", () => {
    const members = TOOLS.filter((tool) => tool.members).map((tool) => tool.href);
    expect(members).toEqual(["/comparar", "/previsao"]);
    for (const href of members) expect(isProtected(href)).toBe(true);
  });
});
