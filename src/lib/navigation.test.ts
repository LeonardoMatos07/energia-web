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
      "Explorar",
      "Mercado",
      "Relatórios",
      "Notícias",
      "Ferramentas",
    ]);
  });

  it("keeps Mercado lit on prices and quality of supply", () => {
    for (const path of ["/mercado/pld", "/qualidade", "/qualidade/123"]) {
      expect(active(path), path).toEqual(["Mercado"]);
    }
  });

  it("keeps Explorar lit on states, plants and the comparison", () => {
    for (const path of ["/estados", "/estados/ba", "/usinas", "/usinas/cumaru-i", "/comparar"]) {
      expect(active(path), path).toEqual(["Explorar"]);
    }
  });

  it("lights Notícias on the list, the acts and a single item", () => {
    for (const path of ["/noticias", "/noticias/atos", "/noticias/12"]) {
      expect(active(path), path).toEqual(["Notícias"]);
    }
  });

  it("lights exactly one section elsewhere", () => {
    expect(active("/painel")).toEqual(["Painel"]);
    expect(active("/analises")).toEqual(["Ferramentas"]);
    expect(active("/previsao")).toEqual(["Ferramentas"]);
    expect(active("/relatorios/curtailment-2026-09")).toEqual(["Relatórios"]);
    expect(active("/metodologia")).toEqual([]);
    expect(active("/comparar-usinas")).toEqual([]);
  });

  it("links members-area routes the middleware protects, except the open news section and the free tools", () => {
    for (const item of NAV) {
      expect(isProtected(item.href), item.href).toBe(
        item.href !== "/noticias" && item.href !== "/ferramentas",
      );
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
