import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { DataSourceInfo } from "@/lib/api/types";
import { DataAttribution } from "./data-attribution";

const source: DataSourceInfo = {
  slug: "ccee-pld",
  publisher_name: "Câmara de Comercialização de Energia Elétrica (CCEE)",
  dataset_name: "PLD",
  dataset_url: "https://dadosabertos.ccee.org.br/dataset/pld_horario",
  license_code: "CC-BY-4.0",
  license_url: "https://creativecommons.org/licenses/by/4.0/deed.pt-br",
  license_verified_at: "2026-10-30",
  attribution_text: "Fonte: CCEE, Preço de Liquidação das Diferenças (PLD), licença CC BY 4.0.",
  update_frequency: "Mensal",
};

describe("DataAttribution", () => {
  it("shows the publisher, the license and the link to the original dataset", () => {
    render(<DataAttribution source={source} />);

    expect(screen.getByTestId("data-attribution")).toHaveTextContent("Fonte: CCEE");
    const license = screen.getByRole("link", { name: /Licença CC-BY-4.0/ });
    expect(license).toHaveAttribute("href", source.license_url);
    expect(license).toHaveAttribute("rel", expect.stringContaining("noopener"));
    expect(screen.getByRole("link", { name: /Conjunto de dados de/ })).toHaveAttribute(
      "href",
      source.dataset_url,
    );
    expect(screen.getByTestId("data-attribution")).toHaveTextContent("licença conferida em");
  });
});
