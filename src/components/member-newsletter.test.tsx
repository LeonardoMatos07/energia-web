import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemberNewsletter } from "./member-newsletter";

const setMemberNewsletter = vi.hoisted(() => vi.fn());
const refresh = vi.hoisted(() => vi.fn());

vi.mock("@/app/newsletter/actions", () => ({ setMemberNewsletter }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh }) }));

afterEach(cleanup);

beforeEach(() => {
  setMemberNewsletter.mockReset();
  refresh.mockReset();
});

describe("MemberNewsletter", () => {
  it("offers to turn the e-mail on for the member's own address and does it in one click", async () => {
    setMemberNewsletter.mockResolvedValue({ ok: true, enabled: true });
    render(<MemberNewsletter enabled={false} />);

    expect(
      screen.getByText(/Uma newsletter por mês, grátis, no seu e-mail cadastrado/),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Receber a newsletter mensal/ }));

    await waitFor(() => expect(setMemberNewsletter).toHaveBeenCalledWith(true));
    expect(
      await screen.findByText(/Você recebe a newsletter mensal no seu e-mail cadastrado/),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Cancelar/ })).toBeInTheDocument();
    expect(refresh).toHaveBeenCalled();
  });

  it("lets a subscribed member cancel", async () => {
    setMemberNewsletter.mockResolvedValue({ ok: true, enabled: false });
    render(<MemberNewsletter enabled variant="card" />);

    fireEvent.click(screen.getByRole("button", { name: /Cancelar/ }));

    await waitFor(() => expect(setMemberNewsletter).toHaveBeenCalledWith(false));
    expect(await screen.findByRole("button", { name: /Receber/ })).toBeInTheDocument();
  });

  it("shows the problem and keeps the state when saving fails", async () => {
    setMemberNewsletter.mockResolvedValue({
      ok: false,
      message: "Sua sessão expirou. Entre de novo.",
    });
    render(<MemberNewsletter enabled={false} />);

    fireEvent.click(screen.getByRole("button", { name: /Receber/ }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Sua sessão expirou");
    expect(screen.getByRole("button", { name: /Receber/ })).toBeInTheDocument();
    expect(refresh).not.toHaveBeenCalled();
  });
});
