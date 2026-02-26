import { describe, it, expect, vi, beforeEach } from "vitest";

class RedirectError extends Error {
  url: string;
  constructor(url: string) {
    super(`NEXT_REDIRECT: ${url}`);
    this.url = url;
  }
}

const { mockAuth, mockRedirect } = vi.hoisted(() => ({
  mockAuth: vi.fn(),
  mockRedirect: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  auth: mockAuth,
  authConfig: {},
}));

vi.mock("next/navigation", () => ({
  redirect: mockRedirect,
}));

vi.mock("@/db", () => ({
  db: {},
}));

vi.mock("next-auth", () => ({
  default: vi.fn(() => ({
    handlers: { GET: vi.fn(), POST: vi.fn() },
    auth: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn(),
  })),
}));

vi.mock("@auth/drizzle-adapter", () => ({
  DrizzleAdapter: vi.fn(),
}));

import { requireAdmin } from "@/lib/require-admin";

describe("requireAdmin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRedirect.mockImplementation((url: string) => {
      throw new RedirectError(url);
    });
  });

  it("redirects to /login when no session", async () => {
    mockAuth.mockResolvedValue(null);

    await expect(requireAdmin()).rejects.toThrow("NEXT_REDIRECT: /login");

    expect(mockRedirect).toHaveBeenCalledWith("/login");
  });

  it("redirects to /login when session has no user id", async () => {
    mockAuth.mockResolvedValue({
      user: { email: "a@b.com" },
      expires: "2026-03-01T00:00:00.000Z",
    });

    await expect(requireAdmin()).rejects.toThrow("NEXT_REDIRECT: /login");

    expect(mockRedirect).toHaveBeenCalledWith("/login");
  });

  it("redirects to / when user role is not admin", async () => {
    mockAuth.mockResolvedValue({
      user: { id: "user-1", email: "a@b.com", role: "user" },
      expires: "2026-03-01T00:00:00.000Z",
    });

    await expect(requireAdmin()).rejects.toThrow("NEXT_REDIRECT: /");

    expect(mockRedirect).toHaveBeenCalledWith("/");
  });

  it("returns session when user role is admin", async () => {
    const adminSession = {
      user: { id: "user-1", email: "admin@test.com", name: "Admin", role: "admin" },
      expires: "2026-03-01T00:00:00.000Z",
    };
    mockAuth.mockResolvedValue(adminSession);

    const result = await requireAdmin();

    expect(mockRedirect).not.toHaveBeenCalled();
    expect(result).toEqual(adminSession);
  });
});
