import { describe, expect, it } from "vitest";
import {
  analysisApiPath,
  analysisDownloadHref,
  isReportSlug,
  parseAnalysisDownload,
} from "./downloads";

const parse = (query: string) => parseAnalysisDownload(new URLSearchParams(query));

describe("parseAnalysisDownload", () => {
  it("accepts a PDF of the screen the person is on", () => {
    expect(parse("formato=pdf&escopo=NE&fonte=wind&de=2026-01&ate=2026-09")).toEqual({
      format: "pdf",
      scope: "NE",
      source: "wind",
      start: "2026-01",
      end: "2026-09",
    });
  });

  it("uses the same defaults as the page", () => {
    expect(parse("formato=xlsx")).toMatchObject({ scope: "SIN", source: "total" });
  });

  it("refuses anything that is not a known format, scope, source or month", () => {
    for (const query of [
      "",
      "formato=exe",
      "formato=pdf&escopo=ZZ",
      "formato=pdf&fonte=coal",
      "formato=pdf&de=2026-13",
      "formato=pdf&ate=../../etc",
    ]) {
      expect(parse(query), query).toBeNull();
    }
  });
});

describe("analysisApiPath", () => {
  it("maps formats to the API's files", () => {
    const base = {
      scope: "SIN",
      source: "total",
      start: "2026-01",
      end: "2026-09",
    } as const;
    expect(analysisApiPath({ ...base, format: "pdf" })).toBe(
      "/v1/exports/analysis.pdf?scope=SIN&source=total&start=2026-01&end=2026-09",
    );
    expect(analysisApiPath({ ...base, format: "xlsx" })).toContain("/v1/exports/analysis.xlsx?");
    expect(analysisApiPath({ ...base, format: "csv" })).toContain("/v1/exports/analysis-csv.zip?");
  });

  it("leaves out an open-ended period", () => {
    const path = analysisApiPath({ format: "pdf", scope: "S", source: "solar" });
    expect(path).toBe("/v1/exports/analysis.pdf?scope=S&source=solar");
  });
});

describe("analysisDownloadHref", () => {
  it("carries the filters of the page", () => {
    const href = analysisDownloadHref("csv", {
      scope: "NE",
      source: "wind",
      start: "2026-01",
      end: "2026-02",
    });
    expect(href).toBe(
      "/api/baixar/analise?formato=csv&fonte=wind&de=2026-01&ate=2026-02&escopo=NE",
    );
  });
});

describe("isReportSlug", () => {
  it("allows slugs and refuses paths", () => {
    expect(isReportSlug("corte-recorde-2026")).toBe(true);
    expect(isReportSlug("../admin")).toBe(false);
    expect(isReportSlug("A B")).toBe(false);
    expect(isReportSlug("a".repeat(201))).toBe(false);
  });
});
