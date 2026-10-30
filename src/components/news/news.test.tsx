import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { NewsItem, RegulatoryAct } from "@/lib/api/types";
import {
  buildRss,
  douReference,
  formatPublished,
  licenseLabel,
  parseRelatedLinks,
  wasUpdated,
} from "@/lib/news";
import { ActAttribution, NewsAttribution } from "./news-attribution";

const item: NewsItem = {
  id: 1,
  source: "aneel",
  publisher_name: "Agência Nacional de Energia Elétrica (ANEEL)",
  license_code: "CC-BY-ND-3.0",
  license_url: "https://creativecommons.org/licenses/by-nd/3.0/deed.pt_BR",
  url: "https://www.gov.br/aneel/pt-br/assuntos/noticias/2026/a",
  title: "ANEEL aprova <leilão> & mais",
  summary: "Resumo exato",
  published_at: "2026-10-29T17:30:00Z",
  source_updated_at: null,
  topics: ["leiloes"],
  has_editor_note: false,
};

describe("NewsAttribution", () => {
  it("shows the publisher, date, link to the original and license of every item", () => {
    render(<NewsAttribution item={item} />);
    const block = screen.getByTestId("news-attribution");

    expect(block.textContent).toContain("Agência Nacional de Energia Elétrica (ANEEL)");
    expect(block.textContent).toContain("publicado em 29/10/2026 às 14:30");
    expect(block.textContent).toContain("Conteúdo reproduzido sem alterações");
    expect(screen.getByRole("link", { name: "ver original" })).toHaveAttribute("href", item.url);
    expect(screen.getByRole("link", { name: "ver original" })).toHaveAttribute(
      "rel",
      "noopener noreferrer",
    );
    expect(screen.getByRole("link", { name: "CC BY-ND 3.0" })).toHaveAttribute(
      "href",
      item.license_url,
    );
  });

  it("uses the license each source declares", () => {
    render(<NewsAttribution item={{ ...item, license_code: "CC-BY-4.0" }} />);

    expect(screen.getByRole("link", { name: "CC BY 4.0" })).toBeInTheDocument();
  });

  it("says when the source updated the item after collecting it", () => {
    render(<NewsAttribution item={{ ...item, source_updated_at: "2026-10-30T12:00:00Z" }} />);

    expect(screen.getByTestId("news-attribution").textContent).toContain(
      "atualizado em 30/10/2026",
    );
  });
});

describe("ActAttribution", () => {
  const act: RegulatoryAct = {
    id: 1,
    organ: "ANEEL",
    act_type: "Resolução Normativa",
    act_number: "1.000",
    act_date: "2026-10-28",
    title: "T",
    summary: null,
    dou_date: "2026-10-29",
    dou_section: 1,
    dou_edition: "207",
    dou_page: "45",
    dou_url: "https://www.in.gov.br/web/dou/-/x",
    topics: [],
  };

  it("carries the full DOU reference and the legal basis", () => {
    render(<ActAttribution act={act} />);
    const text = screen.getByTestId("act-attribution").textContent;

    expect(douReference(act)).toBe(
      "Diário Oficial da União, Seção 1, edição nº 207, p. 45, 29/10/2026",
    );
    expect(text).toContain("Seção 1, edição nº 207, p. 45, 29/10/2026");
    expect(text).toContain("Lei 9.610/1998, art. 8º, IV");
    expect(screen.getByRole("link", { name: "ver no DOU" })).toHaveAttribute("href", act.dou_url);
  });
});

describe("news helpers", () => {
  it("leaves out the time for sources that publish only a date", () => {
    expect(formatPublished("2026-10-29T03:00:00Z")).toBe("29/10/2026");
  });

  it("knows the license labels and the update rule", () => {
    expect(licenseLabel("CC-BY-ND-3.0")).toBe("CC BY-ND 3.0");
    expect(licenseLabel("other")).toBe("other");
    expect(wasUpdated(item)).toBe(false);
    expect(wasUpdated({ ...item, source_updated_at: "2026-10-29T17:30:30Z" })).toBe(false);
  });

  it("writes an RSS feed with the attribution in each item and escaped markup", () => {
    const xml = buildRss([item], "https://spillway.example");

    expect(xml).toContain("<title>ANEEL aprova &lt;leilão&gt; &amp; mais</title>");
    expect(xml).toContain(`<link>${item.url}</link>`);
    expect(xml).toContain("Fonte: Agência Nacional de Energia Elétrica (ANEEL)");
    expect(xml).toContain("licença CC BY-ND 3.0");
    expect(xml).toContain(item.license_url);
    expect(xml).toContain("Resumo exato");
  });

  it("parses editor links and refuses unsafe ones", () => {
    expect(parseRelatedLinks("Painel | /painel\n\nDados | https://x.org/a")).toEqual([
      { label: "Painel", href: "/painel" },
      { label: "Dados", href: "https://x.org/a" },
    ]);
    expect(parseRelatedLinks("Mau | javascript:alert(1)")).toBeNull();
    expect(parseRelatedLinks("sem separador")).toBeNull();
    expect(parseRelatedLinks("")).toEqual([]);
  });
});
