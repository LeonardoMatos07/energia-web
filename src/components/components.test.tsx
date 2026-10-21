import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { RankedPlant } from "@/lib/api/types";
import { RankingTable } from "./ranking-table";
import { ReasonBreakdown } from "./reason-breakdown";
import { Tabs } from "./tabs";

describe("ReasonBreakdown", () => {
  it("shows every reason with its share and a plain-language explanation", () => {
    render(
      <ReasonBreakdown
        period={{
          curtailed_rel_mwh: 3000,
          curtailed_cnf_mwh: 1000,
          curtailed_ene_mwh: 0,
          curtailed_other_mwh: 0,
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
    const items: RankedPlant[] = [
      {
        id: "RNESF4",
        kind: "plant",
        name: "São Fernando 4",
        slug: "sao-fernando-4-rnesf4",
        source: "wind",
        state: "RN",
        subsystem: "NE",
        capacity_mw: 30,
        rank: 1,
        curtailed_mwh: 12_345.6,
        curtailment_pct: 18.25,
        estimated_loss_brl: 2_500_000,
      },
    ];
    render(<RankingTable items={items} caption="Ranking" />);
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
          { key: "total", label: "Total", content: <p>total panel</p> },
          { key: "solar", label: "Solar", content: <p>solar panel</p> },
        ]}
      />,
    );
    expect(screen.getByText("total panel")).toBeVisible();
    expect(screen.getByText("solar panel")).not.toBeVisible();
    fireEvent.click(screen.getByRole("tab", { name: "Solar" }));
    expect(screen.getByText("solar panel")).toBeVisible();
    fireEvent.keyDown(screen.getByRole("tab", { name: "Solar" }), { key: "ArrowRight" });
    expect(screen.getByRole("tab", { name: "Total" })).toHaveAttribute("aria-selected", "true");
  });
});
