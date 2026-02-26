import { describe, it, expect, vi, beforeEach } from "vitest";
import { validateWsSession } from "@/server/ws-auth";

vi.mock("next-auth/jwt", () => ({
  decode: vi.fn(),
}));

import { decode } from "next-auth/jwt";

describe("validateWsSession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("NEXTAUTH_SECRET", "test-secret");
  });

  it("should reject when no cookie header is provided", async () => {
    const result = await validateWsSession(undefined);

    expect(result).toBeNull();
    expect(decode).not.toHaveBeenCalled();
  });

  it("should reject when no session token cookie is present", async () => {
    const result = await validateWsSession("other_cookie=value");

    expect(result).toBeNull();
    expect(decode).not.toHaveBeenCalled();
  });

  it("should reject when session token is invalid", async () => {
    vi.mocked(decode).mockResolvedValueOnce(null);

    const result = await validateWsSession("authjs.session-token=invalid-token");

    expect(result).toBeNull();
    expect(decode).toHaveBeenCalledWith({
      token: "invalid-token",
      secret: "test-secret",
      salt: "authjs.session-token",
    });
  });

  it("should return session when token is valid", async () => {
    vi.mocked(decode).mockResolvedValueOnce({
      sub: "user-123",
      email: "admin@test.com",
    });

    const result = await validateWsSession("authjs.session-token=valid-token");

    expect(result).toEqual({ sub: "user-123", email: "admin@test.com" });
  });

  it("should handle __Secure- prefixed cookie for HTTPS", async () => {
    vi.mocked(decode).mockResolvedValueOnce({
      sub: "user-123",
    });

    const result = await validateWsSession("__Secure-authjs.session-token=secure-token");

    expect(result).toEqual({ sub: "user-123" });
    expect(decode).toHaveBeenCalledWith({
      token: "secure-token",
      secret: "test-secret",
      salt: "__Secure-authjs.session-token",
    });
  });

  it("should reject when decode throws an error", async () => {
    vi.mocked(decode).mockRejectedValueOnce(new Error("Invalid JWT"));

    const result = await validateWsSession("authjs.session-token=corrupt-token");

    expect(result).toBeNull();
  });

  it("should reject when no secret is configured", async () => {
    vi.stubEnv("NEXTAUTH_SECRET", "");
    vi.stubEnv("AUTH_SECRET", "");

    const result = await validateWsSession("authjs.session-token=valid-token");

    expect(result).toBeNull();
    expect(decode).not.toHaveBeenCalled();
  });

  it("should prefer AUTH_SECRET over NEXTAUTH_SECRET", async () => {
    vi.stubEnv("AUTH_SECRET", "auth-secret");
    vi.stubEnv("NEXTAUTH_SECRET", "nextauth-secret");
    vi.mocked(decode).mockResolvedValueOnce({ sub: "user-1" });

    await validateWsSession("authjs.session-token=token");

    expect(decode).toHaveBeenCalledWith(expect.objectContaining({ secret: "auth-secret" }));
  });
});
