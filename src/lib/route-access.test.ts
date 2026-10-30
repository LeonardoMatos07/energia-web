import { describe, expect, it } from "vitest";
import { isProtected, legacyPanelRedirect, periodRewrite } from "./route-access";

describe("isProtected", () => {
  it.each([
    "/curtailment",
    "/curtailment/periodo",
    "/estados",
    "/estados/ba",
    "/usinas",
    "/usinas/sao-fernando-4-rnesf4",
    "/relatorios",
    "/relatorios/curtailment-em-setembro-de-2026",
    "/comparar",
    "/comparar/x",
    "/analises",
    "/analises/horario",
    "/previsao",
    "/previsao/x",
    "/conta",
    "/conta/dados",
  ])("requires an account for %s", (path) => {
    expect(isProtected(path)).toBe(true);
  });

  it.each([
    "/",
    "/painel",
    "/sistema",
    "/agua",
    "/noticias",
    "/metodologia",
    "/privacidade",
    "/cadastro",
    "/entrar",
    "/comparar-usinas",
  ])("keeps %s public", (path) => {
    expect(isProtected(path)).toBe(false);
  });
});

describe("periodRewrite", () => {
  const params = (query: string) => new URLSearchParams(query);

  it("sends a custom period on the pages that have one to the dynamic variant", () => {
    expect(periodRewrite("/curtailment", params("de=2026-01&ate=2026-06"))).toBe(
      "/curtailment/periodo",
    );
    expect(periodRewrite("/estados/rn", params("de=2026-01&ate=2026-06"))).toBe(
      "/estados/rn/periodo",
    );
    expect(periodRewrite("/usinas/cumaru", params("ate=2026-06"))).toBe("/usinas/cumaru/periodo");
  });

  it("leaves the static pages alone when there is no period", () => {
    expect(periodRewrite("/curtailment", params(""))).toBeNull();
    expect(periodRewrite("/estados/rn", params("utm_source=x"))).toBeNull();
  });

  it("only rewrites the pages that have a period", () => {
    expect(periodRewrite("/relatorios", params("de=2026-01"))).toBeNull();
    expect(periodRewrite("/usinas", params("de=2026-01"))).toBeNull();
    expect(periodRewrite("/estados", params("de=2026-01"))).toBeNull();
    expect(periodRewrite("/estados/rn/periodo", params("de=2026-01"))).toBeNull();
    expect(periodRewrite("/comparar", params("de=2026-01"))).toBeNull();
  });
});

describe("legacyPanelRedirect", () => {
  it("sends old /painel period links to the curtailment area", () => {
    expect(legacyPanelRedirect("/painel", new URLSearchParams("de=2026-01&ate=2026-06"))).toBe(
      "/curtailment",
    );
  });

  it("leaves the general panel alone", () => {
    expect(legacyPanelRedirect("/painel", new URLSearchParams(""))).toBeNull();
    expect(legacyPanelRedirect("/sistema", new URLSearchParams("de=2026-01"))).toBeNull();
  });
});
