import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemberUnsubscribe } from "./member-unsubscribe";

const setMemberNewsletter = vi.hoisted(() => vi.fn());
const refresh = vi.hoisted(() => vi.fn());

vi.mock("@/app/newsletter/actions", () => ({ setMemberNewsletter }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh }) }));

afterEach(cleanup);
beforeEach(() => {
  setMemberNewsletter.mockReset();
  refresh.mockReset();
});

describe("MemberUnsubscribe", () => {
  it("cancels the monthly e-mail in one click and confirms", async () => {
    setMemberNewsletter.mockResolvedValue({ ok: true, enabled: false });
    render(<MemberUnsubscribe enabled />);

    fireEvent.click(screen.getByRole("button", { name: /Cancelar a newsletter mensal/ }));

    await waitFor(() => expect(setMemberNewsletter).toHaveBeenCalledWith(false));
    expect(await screen.findByText(/a newsletter mensal foi cancelada/)).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("tells a member who was not subscribed that it is already off", () => {
    render(<MemberUnsubscribe enabled={false} />);
    expect(screen.getByText(/a newsletter mensal foi cancelada/)).toBeInTheDocument();
  });

  it("shows the problem when cancelling fails", async () => {
    setMemberNewsletter.mockResolvedValue({ ok: false, message: "Falhou." });
    render(<MemberUnsubscribe enabled />);

    fireEvent.click(screen.getByRole("button", { name: /Cancelar/ }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Falhou.");
    expect(screen.getByRole("button", { name: /Cancelar/ })).toBeInTheDocument();
  });
});
