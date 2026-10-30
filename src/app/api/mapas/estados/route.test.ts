import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const getSessionToken = vi.fn();
const getGeoStatesCurtailment = vi.fn();
vi.mock("@/lib/members", () => ({ getSessionToken: () => getSessionToken() }));
vi.mock("@/lib/api/queries", () => ({
  getGeoStatesCurtailment: (...args: unknown[]) => getGeoStatesCurtailment(...args),
}));

import { GET } from "./route";

const request = (qs = "") =>
  ({ nextUrl: new URL(`http://localhost/api/mapas/estados${qs}`) }) as Parameters<typeof GET>[0];

describe("GET /api/mapas/estados", () => {
  beforeEach(() => vi.clearAllMocks());

  it("asks for an account, like /estados", async () => {
    getSessionToken.mockResolvedValue(null);
    const response = await GET(request());
    expect(response.status).toBe(401);
    expect(getGeoStatesCurtailment).not.toHaveBeenCalled();
  });

  it("passes the validated month and source to the API", async () => {
    getSessionToken.mockResolvedValue("token");
    getGeoStatesCurtailment.mockResolvedValue({ ok: true, data: { meta: {}, items: [] } });
    const response = await GET(request("?mes=2026-09&fonte=wind"));
    expect(response.status).toBe(200);
    expect(getGeoStatesCurtailment).toHaveBeenCalledWith("wind", "2026-09");
    await GET(request("?mes=lixo&fonte=carvao"));
    expect(getGeoStatesCurtailment).toHaveBeenLastCalledWith("total", undefined);
  });

  it("maps a missing month to 404", async () => {
    getSessionToken.mockResolvedValue("token");
    getGeoStatesCurtailment.mockResolvedValue({
      ok: false,
      error: { isNotFound: true, isUnavailable: false },
    });
    expect((await GET(request("?mes=2020-01"))).status).toBe(404);
  });
});
