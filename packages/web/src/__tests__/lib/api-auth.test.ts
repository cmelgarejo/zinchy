import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextResponse } from "next/server";

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

import { auth } from "@/lib/auth";

describe("requireAdmin", () => {
  let requireAdmin: typeof import("@/lib/api-auth").requireAdmin;

  beforeEach(async () => {
    vi.clearAllMocks();
    const mod = await import("@/lib/api-auth");
    requireAdmin = mod.requireAdmin;
  });

  it("returns 401 response when session is null", async () => {
    vi.mocked(auth).mockResolvedValueOnce(null);

    const result = await requireAdmin();
    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(401);
  });

  it("returns 403 response when user is not admin", async () => {
    vi.mocked(auth).mockResolvedValueOnce({
      user: { id: "user-1", role: "user" },
      expires: "",
    } as any);

    const result = await requireAdmin();
    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(403);
  });

  it("returns session when user is admin", async () => {
    const session = {
      user: { id: "admin-1", role: "admin" },
      expires: "",
    };
    vi.mocked(auth).mockResolvedValueOnce(session as any);

    const result = await requireAdmin();
    expect(result).not.toBeInstanceOf(NextResponse);
    expect(result).toEqual(session);
  });
});
