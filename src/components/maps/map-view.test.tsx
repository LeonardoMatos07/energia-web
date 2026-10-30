import { act, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MapView } from "./map-view";

type Callback = (entries: { isIntersecting: boolean }[]) => void;
let trigger: Callback = () => {};

function installObserver() {
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      constructor(callback: Callback) {
        trigger = callback;
      }
      observe() {}
      disconnect() {}
    },
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("MapView", () => {
  it("does not load the engine until the frame is near the screen", async () => {
    installObserver();
    const load = vi.fn(async () => ({ default: () => <p>engine</p> }));
    render(<MapView label="teste" load={load} props={{}} />);
    expect(load).not.toHaveBeenCalled();
    expect(screen.getByRole("img", { name: /Carregando o mapa: teste/ })).toBeInTheDocument();
    act(() => trigger([{ isIntersecting: true }]));
    await waitFor(() => expect(screen.getByText("engine")).toBeInTheDocument());
    expect(load).toHaveBeenCalledTimes(1);
  });

  it("shows a message instead of the map when the engine fails to load", async () => {
    installObserver();
    const load = vi.fn(async (): Promise<{ default: () => null }> => {
      throw new Error("chunk");
    });
    render(<MapView label="teste" load={load} props={{}} fallback="Use a tabela." />);
    act(() => trigger([{ isIntersecting: true }]));
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("Use a tabela."));
  });

  it("falls back without WebGL when the engine needs it, and never imports the engine", async () => {
    installObserver();
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
    const load = vi.fn(async () => ({ default: () => <p>engine</p> }));
    render(<MapView label="teste" load={load} props={{}} requires="webgl" />);
    act(() => trigger([{ isIntersecting: true }]));
    await waitFor(() => expect(screen.getByRole("status")).toBeInTheDocument());
    expect(load).not.toHaveBeenCalled();
  });
});
