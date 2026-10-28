import { render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it } from "vitest";
import { Markdown } from "./markdown";

beforeAll(() => {
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

const chart = JSON.stringify({
  type: "bar",
  title: "Energia cortada por mês",
  unit: "GWh",
  labels: ["jul/26", "ago/26"],
  series: [{ name: "Energia cortada", values: [3, 4.5] }],
});

// react-markdown is async-free in v9 for sync rendering of plain content.
describe("Markdown", () => {
  it("draws a chart block with its title and a table of the values", async () => {
    render(<Markdown>{"Antes.\n\n```chart\n" + chart + "\n```\n\nDepois."}</Markdown>);

    expect(screen.getAllByText("Energia cortada por mês").length).toBeGreaterThan(0);
    expect(screen.getByRole("img", { name: /Energia cortada por mês/ })).toBeInTheDocument();
    expect(screen.getByText("jul/26")).toBeInTheDocument();
    expect(screen.getByText("4,5")).toBeInTheDocument();
    expect(screen.queryByText(/"series"/)).not.toBeInTheDocument();
    expect(screen.getByText("Antes.")).toBeInTheDocument();
  });

  it("shows an invalid chart block as code instead of dropping it", () => {
    render(<Markdown>{"```chart\n{nope\n```"}</Markdown>);
    expect(screen.getByText("{nope")).toBeInTheDocument();
  });

  it("leaves other code blocks alone", () => {
    const { container } = render(<Markdown>{"```python\nprint(1)\n```"}</Markdown>);
    expect(container.querySelector("pre code")?.textContent).toContain("print(1)");
  });
});
