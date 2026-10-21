import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const revalidateTag = vi.fn();
vi.mock("next/cache", () => ({ revalidateTag: (tag: string) => revalidateTag(tag) }));

const { POST } = await import("./route");

function request(body?: string, secret?: string) {
  const headers = new Headers({ "Content-Type": "application/json" });
  if (secret !== undefined) headers.set("x-revalidate-secret", secret);
  return new NextRequest("http://localhost:3000/api/revalidar", { method: "POST", headers, body });
}

beforeEach(() => {
  vi.stubEnv("REVALIDATE_SECRET", "s3gredo-de-teste");
});

afterEach(() => {
  vi.unstubAllEnvs();
  revalidateTag.mockReset();
});

describe("POST /api/revalidar", () => {
  it("rejects a missing secret", async () => {
    const res = await POST(request('{"tags":["curtailment"]}'));
    expect(res.status).toBe(401);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it("rejects a wrong secret, including a prefix of the right one", async () => {
    expect((await POST(request("{}", "errado"))).status).toBe(401);
    expect((await POST(request("{}", "s3gredo"))).status).toBe(401);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it("refuses everything when REVALIDATE_SECRET is not set", async () => {
    vi.stubEnv("REVALIDATE_SECRET", "");
    const res = await POST(request("{}", ""));
    expect(res.status).toBe(503);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it("revalidates the requested tags", async () => {
    const res = await POST(request('{"tags":["curtailment","usinas"]}', "s3gredo-de-teste"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.tags).toEqual(["curtailment", "usinas"]);
    expect(revalidateTag.mock.calls.map((c) => c[0])).toEqual(["curtailment", "usinas"]);
  });

  it("defaults to all tags when the body is empty", async () => {
    const res = await POST(request(undefined, "s3gredo-de-teste"));
    expect(res.status).toBe(200);
    expect(revalidateTag.mock.calls.map((c) => c[0])).toEqual([
      "curtailment",
      "usinas",
      "relatorios",
    ]);
  });

  it("rejects unknown tags and invalid JSON", async () => {
    expect((await POST(request('{"tags":["tudo"]}', "s3gredo-de-teste"))).status).toBe(400);
    expect((await POST(request("{nope", "s3gredo-de-teste"))).status).toBe(400);
    expect(revalidateTag).not.toHaveBeenCalled();
  });
});
