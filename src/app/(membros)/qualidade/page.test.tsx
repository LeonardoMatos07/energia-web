import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/api/client";

const queries = vi.hoisted(() => ({ getReliability: vi.fn() }));
vi.mock("@/lib/api/queries", () => queries);

import QualityPage from "./page";

const source = {
  slug: "aneel-reliability",
  publisher_name: "Agência Nacional de Energia Elétrica (ANEEL)",
  dataset_name: "DEC e FEC",
  dataset_url: "https://dadosabertos.aneel.gov.br/dataset/x",
  license_code: "ODbL-1.0",
  license_url: "https://opendatacommons.org/licenses/odbl/1-0/",
  license_verified_at: "2026-10-30",
  attribution_text: "Fonte: ANEEL, DEC e FEC, licença ODbL 1.0.",
  update_frequency: "Mensal",
};

const item = (cnpj: string, acronym: string, dec: number, months = 12) => ({
  cnpj,
  acronym,
  consumers: 1000,
  dec_hours: dec,
  fec_count: 3,
  dec_limit_hours: 10,
  fec_limit_count: 6,
  months_with_data: months,
  sets: 2,
});

async function renderPage(search: Record<string, string> = {}) {
  render(await QualityPage({ searchParams: Promise.resolve(search) }));
}

describe("quality page", () => {
  beforeEach(() => queries.getReliability.mockReset());

  it("ranks the distributors and always credits ANEEL with the license", async () => {
    queries.getReliability.mockResolvedValue({
      ok: true,
      data: {
        year: 2025,
        years: [2024, 2025],
        months_with_data: 12,
        source,
        items: [item("1", "EDP ES", 12), item("2", "CPFL", 4)],
      },
    });

    await renderPage({ ano: "2025" });

    expect(screen.getByRole("link", { name: "EDP ES" })).toHaveAttribute(
      "href",
      "/qualidade/1?ano=2025",
    );
    expect(screen.getByText("Acima do limite")).toBeInTheDocument();
    expect(screen.getByText("Dentro do limite")).toBeInTheDocument();
    expect(screen.getByTestId("data-attribution")).toHaveTextContent("ODbL 1.0");
    expect(queries.getReliability).toHaveBeenCalledWith(2025);
  });

  it("warns that a year in progress cannot be compared with the annual limit", async () => {
    queries.getReliability.mockResolvedValue({
      ok: true,
      data: {
        year: 2026,
        years: [2026],
        months_with_data: 8,
        source,
        items: [item("1", "EDP ES", 12, 8)],
      },
    });

    await renderPage();

    expect(screen.getByText(/está em andamento/)).toBeInTheDocument();
    expect(screen.getByText("Ano em andamento")).toBeInTheDocument();
  });

  it("says so when the data cannot be loaded", async () => {
    queries.getReliability.mockResolvedValue({ ok: false, error: new ApiError(0, "down") });

    await renderPage();

    expect(screen.getByRole("status")).toHaveTextContent("Dados indisponíveis");
  });
});
