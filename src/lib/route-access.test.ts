import { describe, expect, it } from "vitest";
import { isProtected, periodRewrite } from "./route-access";

describe("isProtected", () => {
  it.each(["/comparar", "/comparar/x", "/analises", "/analises/horario", "/conta", "/conta/dados"])(
    "requires an account for %s",
    (path) => {
      expect(isProtected(path)).toBe(true);
    },
  );

  it.each([
    "/",
    "/painel",
    "/estados",
    "/estados/ba",
    "/usinas",
    "/usinas/sao-fernando-4-rnesf4",
    "/relatorios",
    "/relatorios/curtailment-em-setembro-de-2026",
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

  it("sends a custom period on the public pages to the dynamic variant", () => {
    expect(periodRewrite("/painel", params("de=2026-01&ate=2026-06"))).toBe("/painel/periodo");
    expect(periodRewrite("/estados/rn", params("de=2026-01&ate=2026-06"))).toBe(
      "/estados/rn/periodo",
    );
    expect(periodRewrite("/usinas/cumaru", params("ate=2026-06"))).toBe("/usinas/cumaru/periodo");
  });

  it("leaves the static pages alone when there is no period", () => {
    expect(periodRewrite("/painel", params(""))).toBeNull();
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
