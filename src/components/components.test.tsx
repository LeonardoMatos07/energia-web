import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { RankedPlant } from "@/lib/api/types";
import { MonthPicker } from "./charts/month-picker";
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

describe("MonthPicker", () => {
  it("jumps years with the arrows and picks a month", () => {
    const onChange = vi.fn();
    render(
      <MonthPicker label="De" value="2024-05" min="2021-10" max="2026-09" onChange={onChange} />,
    );
    fireEvent.click(screen.getByRole("button", { name: /De: mai\/2024/ }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Ano anterior" }));
    fireEvent.click(screen.getByRole("button", { name: "Ano anterior" }));
    expect(screen.getByText("2022")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "jan" }));
    expect(onChange).toHaveBeenCalledWith("2022-01");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("disables months and years outside the allowed range", () => {
    render(
      <MonthPicker label="Até" value="2021-12" min="2021-10" max="2026-09" onChange={() => {}} />,
    );
    fireEvent.click(screen.getByRole("button", { name: /Até: dez\/2021/ }));
    expect(screen.getByRole("button", { name: "Ano anterior" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "set" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "out" })).toBeEnabled();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
