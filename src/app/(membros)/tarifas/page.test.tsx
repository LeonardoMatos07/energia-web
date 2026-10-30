import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/api/client";

const queries = vi.hoisted(() => ({ getTariffFlags: vi.fn() }));
vi.mock("@/lib/api/queries", () => queries);
vi.mock("@/components/charts/monthly-chart", () => ({ MonthlyChart: () => null }));

import TariffsPage from "./page";

const source = {
  slug: "aneel-tariff-flags",
  publisher_name: "ANEEL",
  dataset_name: "Bandeiras",
  dataset_url: "https://dadosabertos.aneel.gov.br/dataset/bandeiras-tarifarias",
  license_code: "ODbL-1.0",
  license_url: "https://opendatacommons.org/licenses/odbl/1-0/",
  license_verified_at: "2026-10-30",
  attribution_text: "Fonte: ANEEL, Bandeiras tarifárias, licença ODbL 1.0.",
  update_frequency: "Mensal",
};

describe("tariff flags page", () => {
  beforeEach(() => queries.getTariffFlags.mockReset());

  it("shows the flags, the attribution and the warning that this is not the bill", async () => {
    queries.getTariffFlags.mockResolvedValue({
      ok: true,
      data: {
        source,
        items: [
          { month: "2026-09-01", flag: "Amarela", additional_brl_per_mwh: 18.85 },
          { month: "2026-10-01", flag: "Verde", additional_brl_per_mwh: 0 },
        ],
      },
    });

    render(await TariffsPage());

    expect(screen.getByText("Amarela")).toBeInTheDocument();
    expect(screen.getByText(/não são a sua conta/)).toBeInTheDocument();
    expect(screen.getByText(/sem impostos/)).toBeInTheDocument();
    expect(screen.getByTestId("data-attribution")).toHaveTextContent("ODbL 1.0");
  });

  it("says so when the data cannot be loaded", async () => {
    queries.getTariffFlags.mockResolvedValue({ ok: false, error: new ApiError(0, "down") });

    render(await TariffsPage());

    expect(screen.getByRole("status")).toHaveTextContent("Dados indisponíveis");
  });
});
