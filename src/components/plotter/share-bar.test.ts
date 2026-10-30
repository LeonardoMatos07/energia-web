import { describe, expect, it } from "vitest";
import { fileBaseName } from "./share-bar";

describe("fileBaseName", () => {
  it("uses the title the user gave", () => {
    expect(fileBaseName("Lei de Ohm")).toBe("Lei de Ohm");
  });

  it("drops characters filenames cannot hold", () => {
    expect(fileBaseName('V/I: "curva" <1>?')).toBe("V I curva 1");
  });

  it("falls back when the title is empty", () => {
    expect(fileBaseName("   ")).toBe("grafico");
    expect(fileBaseName("///")).toBe("grafico");
  });

  it("limits the length", () => {
    expect(fileBaseName("a".repeat(200)).length).toBe(80);
  });
});
