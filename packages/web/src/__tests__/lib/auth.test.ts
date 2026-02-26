import { describe, it, expect, vi } from "vitest";

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

import { authConfig } from "@/lib/auth";

describe("auth configuration", () => {
  it("should export auth config", () => {
    expect(authConfig).toBeDefined();
  });

  it("should have credentials provider", () => {
    expect(authConfig.providers).toBeDefined();
    expect(authConfig.providers.length).toBeGreaterThan(0);
  });

  it("should use jwt session strategy", () => {
    expect(authConfig.session?.strategy).toBe("jwt");
  });

  it("should configure custom sign-in page", () => {
    expect(authConfig.pages?.signIn).toBe("/login");
  });

  it("should have callbacks defined", () => {
    expect(authConfig.callbacks).toBeDefined();
  });

  it("should have jwt callback", () => {
    expect(authConfig.callbacks?.jwt).toBeDefined();
    expect(typeof authConfig.callbacks?.jwt).toBe("function");
  });

  it("should have session callback", () => {
    expect(authConfig.callbacks?.session).toBeDefined();
    expect(typeof authConfig.callbacks?.session).toBe("function");
  });

  describe("jwt callback", () => {
    it("should copy role from user to token when user is present", () => {
      const token = { sub: "user-1" };
      const user = { id: "user-1", email: "a@b.com", role: "admin" };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = (authConfig.callbacks?.jwt as any)({ token, user });

      expect(result.role).toBe("admin");
    });

    it("should preserve existing token when no user is present", () => {
      const token = { sub: "user-1", role: "admin" };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = (authConfig.callbacks?.jwt as any)({ token, user: undefined });

      expect(result.role).toBe("admin");
    });
  });

  describe("session callback", () => {
    it("should add role and id to session user", () => {
      const session = { user: { email: "a@b.com" }, expires: "" };
      const token = { sub: "user-1", role: "admin" };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = (authConfig.callbacks?.session as any)({ session, token });

      expect(result.user.role).toBe("admin");
      expect(result.user.id).toBe("user-1");
    });

    it("should default role to 'user' when token has no role", () => {
      const session = { user: { email: "a@b.com" }, expires: "" };
      const token = { sub: "user-1" };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = (authConfig.callbacks?.session as any)({ session, token });

      expect(result.user.role).toBe("user");
    });
  });
});
