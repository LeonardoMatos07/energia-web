import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { UsinaRanking } from "@/lib/api/types";
import { RankingTable } from "./ranking-table";
import { ReasonBreakdown } from "./reason-breakdown";
import { Tabs } from "./tabs";

describe("ReasonBreakdown", () => {
  it("shows every reason with its share and a plain-language explanation", () => {
    render(
      <ReasonBreakdown
        periodo={{
          corte_rel_mwh: 3000,
          corte_cnf_mwh: 1000,
          corte_ene_mwh: 0,
          corte_outros_mwh: 0,
        }}
      />,
    );
    expect(screen.getAllByText(/Confiabilidade elétrica/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Razão energética/).length).toBeGreaterThan(0);
    expect(screen.getByText(/75% do corte/)).toBeInTheDocument();
    expect(screen.getByText(/25% do corte/)).toBeInTheDocument();
    expect(screen.getByText(/mais oferta de energia do que consumo/)).toBeInTheDocument();
    expect(screen.getAllByText("3 GWh").length).toBeGreaterThan(0);
  });
});

describe("RankingTable", () => {
  it("links each plant to its page with formatted values", () => {
    const itens: UsinaRanking[] = [
      {
        id: "RNESF4",
        tipo: "usina",
        nome: "São Fernando 4",
        slug: "sao-fernando-4-rnesf4",
        fonte: "eolica",
        uf: "RN",
        subsistema: "NE",
        potencia_mw: 30,
        posicao: 1,
        energia_cortada_mwh: 12_345.6,
        percentual_corte: 18.25,
        perda_estimada_brl: 2_500_000,
      },
    ];
    render(<RankingTable itens={itens} caption="Ranking" />);
    const link = screen.getByRole("link", { name: "São Fernando 4" });
    expect(link).toHaveAttribute("href", "/usinas/sao-fernando-4-rnesf4");
    expect(screen.getByText("12,3 GWh")).toBeInTheDocument();
    expect(screen.getByText("18,3%")).toBeInTheDocument();
    expect(screen.getByText("R$ 2,5 milhões")).toBeInTheDocument();
  });
});

describe("Tabs", () => {
  it("switches panels by click and arrow keys", () => {
    render(
      <Tabs
        label="Fonte"
        panels={[
          { key: "total", label: "Total", content: <p>painel total</p> },
          { key: "solar", label: "Solar", content: <p>painel solar</p> },
        ]}
      />,
    );
    expect(screen.getByText("painel total")).toBeVisible();
    expect(screen.getByText("painel solar")).not.toBeVisible();
    fireEvent.click(screen.getByRole("tab", { name: "Solar" }));
    expect(screen.getByText("painel solar")).toBeVisible();
    fireEvent.keyDown(screen.getByRole("tab", { name: "Solar" }), { key: "ArrowRight" });
    expect(screen.getByRole("tab", { name: "Total" })).toHaveAttribute("aria-selected", "true");
  });
});
