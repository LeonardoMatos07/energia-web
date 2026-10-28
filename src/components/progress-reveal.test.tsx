import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ProgressReveal, stageLabel } from "./progress-reveal";

const KEY = "test-progress";

function matchMedia(reduced: boolean) {
  window.matchMedia = ((query: string) => ({
    matches: reduced && query.includes("reduce"),
    media: query,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    dispatchEvent: () => false,
    onchange: null,
  })) as typeof window.matchMedia;
}

beforeEach(() => {
  vi.useFakeTimers();
  window.sessionStorage.clear();
  matchMedia(false);
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

const content = () => screen.getByText("Os dados").closest("[data-progress-content]");

describe("ProgressReveal", () => {
  it("fills from 0 to 100% in the given time, then shows the content", () => {
    render(
      <ProgressReveal seconds={10} storageKey={KEY}>
        <p>Os dados</p>
      </ProgressReveal>,
    );

    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuenow", "0");
    expect(content()).toHaveAttribute("hidden");

    act(() => void vi.advanceTimersByTime(5_000));
    expect(Number(bar.getAttribute("aria-valuenow"))).toBeGreaterThanOrEqual(49);
    expect(Number(bar.getAttribute("aria-valuenow"))).toBeLessThanOrEqual(51);
    expect(content()).toHaveAttribute("hidden");

    act(() => void vi.advanceTimersByTime(5_000));
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "100");
    act(() => void vi.advanceTimersByTime(300));

    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    expect(content()).not.toHaveAttribute("hidden");
  });

  it("can be skipped", () => {
    render(
      <ProgressReveal storageKey={KEY}>
        <p>Os dados</p>
      </ProgressReveal>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Mostrar agora" }));

    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    expect(content()).not.toHaveAttribute("hidden");
  });

  it("only runs the first time in a session", () => {
    const first = render(
      <ProgressReveal storageKey={KEY} seconds={1}>
        <p>Os dados</p>
      </ProgressReveal>,
    );
    act(() => void vi.advanceTimersByTime(1_500));
    first.unmount();

    render(
      <ProgressReveal storageKey={KEY}>
        <p>Os dados</p>
      </ProgressReveal>,
    );
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    expect(content()).not.toHaveAttribute("hidden");
  });

  it("is skipped for people who ask for less motion", () => {
    matchMedia(true);
    render(
      <ProgressReveal storageKey={KEY}>
        <p>Os dados</p>
      </ProgressReveal>,
    );
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    expect(content()).not.toHaveAttribute("hidden");
  });
});

describe("stageLabel", () => {
  it("narrates the four stages", () => {
    expect(stageLabel(0)).toMatch(/modelo treinado/);
    expect(stageLabel(45)).toMatch(/resultados dos testes/);
    expect(stageLabel(75)).toMatch(/próximos 7 dias/);
    expect(stageLabel(95)).toMatch(/gráficos/);
    expect(stageLabel(100)).toMatch(/gráficos/);
  });
});
