import { describe, expect, it } from "vitest";
import { compareHref, parseEntities } from "./compare";
import { isNavActive, NAV } from "./navigation";
import { isProtected } from "./route-access";

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
      "/comparar",
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
    expect(active("/analises")).toEqual(["Ferramentas"]);
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
