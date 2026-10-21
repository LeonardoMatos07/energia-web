import { describe, expect, it } from "vitest";
import { validateNewsletterInput, visitorIpHeaders } from "./newsletter";
import { parseTags, safeCompare } from "./revalidate";
import { fillMonthGaps, pickEnergyUnit, pivotByMonth } from "./series";

describe("safeCompare", () => {
  it("compares strings of any length without throwing", () => {
    expect(safeCompare("abc", "abc")).toBe(true);
    expect(safeCompare("abc", "abcd")).toBe(false);
    expect(safeCompare("", "abc")).toBe(false);
  });
});

describe("parseTags", () => {
  it("defaults to every tag", () => {
    expect(parseTags(null)).toEqual({ ok: true, tags: ["curtailment", "usinas", "relatorios"] });
    expect(parseTags({ tags: [] })).toEqual({
      ok: true,
      tags: ["curtailment", "usinas", "relatorios"],
    });
  });
  it("deduplicates and validates", () => {
    expect(parseTags({ tags: ["usinas", "usinas"] })).toEqual({ ok: true, tags: ["usinas"] });
    expect(parseTags({ tags: "usinas" }).ok).toBe(false);
    expect(parseTags([]).ok).toBe(false);
  });
});

describe("validateNewsletterInput", () => {
  it("requires a valid e-mail and explicit consent", () => {
    expect(validateNewsletterInput(" Ana@Exemplo.com.br ", "on")).toEqual({
      ok: true,
      email: "ana@exemplo.com.br",
    });
    expect(validateNewsletterInput("ana@exemplo.com.br", null).ok).toBe(false);
    expect(validateNewsletterInput("não-é-email", "on").ok).toBe(false);
  });
});

describe("series helpers", () => {
  it("fills the months missing between the first and last row", () => {
    const filled = fillMonthGaps([
      { mes: "2025-11", a: 1 },
      { mes: "2026-02", a: 2 },
    ]);
    expect(filled).toEqual([
      { mes: "2025-11", a: 1 },
      { mes: "2025-12" },
      { mes: "2026-01" },
      { mes: "2026-02", a: 2 },
    ]);
    expect(fillMonthGaps([])).toEqual([]);
  });

  it("pivots long rows into one row per month", () => {
    const rows = pivotByMonth(
      [
        { mes: "2026-02", fonte: "solar", v: 2 },
        { mes: "2026-01", fonte: "eolica", v: 1 },
        { mes: "2026-02", fonte: "eolica", v: 3 },
      ],
      (r) => r.fonte,
      (r) => r.v,
    );
    expect(rows).toEqual([
      { mes: "2026-01", eolica: 1 },
      { mes: "2026-02", solar: 2, eolica: 3 },
    ]);
  });
  it("picks GWh only for large values", () => {
    expect(pickEnergyUnit(50_000).unit).toBe("GWh");
    expect(pickEnergyUnit(500).unit).toBe("MWh");
  });
});

describe("visitorIpHeaders", () => {
  const reader = (values: Record<string, string>) => ({
    get: (name: string) => values[name] ?? null,
  });

  it("sends the visitor IP with the shared secret", () => {
    expect(visitorIpHeaders(reader({ "x-real-ip": "203.0.113.7" }), "s3cret")).toEqual({
      "X-Web-Api-Secret": "s3cret",
      "X-Cliente-IP": "203.0.113.7",
    });
  });

  it("falls back to the left-most X-Forwarded-For entry", () => {
    const h = reader({ "x-forwarded-for": "198.51.100.2, 10.0.0.1" });
    expect(visitorIpHeaders(h, "s3cret")["X-Cliente-IP"]).toBe("198.51.100.2");
  });

  it("only forwards X-Forwarded-For without a secret", () => {
    const h = reader({ "x-forwarded-for": "198.51.100.2", "x-real-ip": "198.51.100.2" });
    expect(visitorIpHeaders(h, undefined)).toEqual({ "X-Forwarded-For": "198.51.100.2" });
    expect(visitorIpHeaders(reader({}), "")).toEqual({});
  });
});
