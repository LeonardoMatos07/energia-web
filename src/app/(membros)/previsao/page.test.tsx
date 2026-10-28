import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/api/client";

const queries = vi.hoisted(() => ({
  getForecast: vi.fn(),
  getForecastModel: vi.fn(),
  getForecastScopes: vi.fn(),
}));

vi.mock("@/lib/api/queries", () => queries);
vi.mock("next/navigation", () => ({
  usePathname: () => "/previsao",
  useRouter: () => ({ replace: vi.fn() }),
}));
vi.mock("@/components/forecast/forecast-chart", () => ({ ForecastChart: () => null }));
vi.mock("@/components/forecast/reliability-chart", () => ({
  RELIABILITY_COLORS: { model: "#f00", baseline: "#00f" },
  ReliabilityChart: () => null,
}));

import ForecastPage from "./page";

const down = { ok: false, error: new ApiError(0, "API unavailable") };
const missing = { ok: false, error: new ApiError(404, "none") };

async function renderPage(search: Record<string, string> = {}) {
  render(await ForecastPage({ searchParams: Promise.resolve(search) }));
}

describe("ForecastPage", () => {
  beforeEach(() => vi.clearAllMocks());

  it("shows a graceful message when the API is down, without breaking the page", async () => {
    queries.getForecastScopes.mockResolvedValue(down);
    queries.getForecastModel.mockResolvedValue(down);
    queries.getForecast.mockResolvedValue(down);
    await renderPage();
    expect(screen.getByText("Previsão indisponível no momento")).toBeInTheDocument();
    expect(screen.getByText("Resultados do treino indisponíveis no momento")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
  });

  it("explains the empty state when nothing was published yet", async () => {
    queries.getForecastScopes.mockResolvedValue({ ok: true, data: [] });
    queries.getForecastModel.mockResolvedValue(missing);
    queries.getForecast.mockResolvedValue(missing);
    await renderPage({ fonte: "solar", escopo: "ba" });
    expect(screen.getByText("Ainda não há previsão para esta escolha")).toBeInTheDocument();
    expect(screen.getByText("Resultados do treino ainda não publicados")).toBeInTheDocument();
    expect(queries.getForecast).toHaveBeenCalledWith("BA", "solar");
  });

  it("falls back to a published scope when the URL asks for an unknown one", async () => {
    queries.getForecastScopes.mockResolvedValue({
      ok: true,
      data: [{ scope: "SE", source: "wind" }],
    });
    queries.getForecastModel.mockResolvedValue(down);
    queries.getForecast.mockResolvedValue(down);
    await renderPage({ escopo: "zz" });
    expect(queries.getForecast).toHaveBeenCalledWith("SE", "wind");
  });
});
