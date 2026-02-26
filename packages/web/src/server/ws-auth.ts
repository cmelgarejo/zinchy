import { decode } from "next-auth/jwt";

function parseCookies(header: string): Record<string, string> {
  const cookies: Record<string, string> = {};
  for (const pair of header.split(";")) {
    const eqIndex = pair.indexOf("=");
    if (eqIndex === -1) continue;
    const key = pair.slice(0, eqIndex).trim();
    const value = pair.slice(eqIndex + 1).trim();
    cookies[key] = value;
  }
  return cookies;
}

export async function validateWsSession(
  cookieHeader: string | undefined
): Promise<Record<string, unknown> | null> {
  if (!cookieHeader) return null;

  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  if (!secret) return null;

  const cookies = parseCookies(cookieHeader);

  const secureCookieName = "__Secure-authjs.session-token";
  const plainCookieName = "authjs.session-token";

  const cookieName = cookies[secureCookieName] ? secureCookieName : plainCookieName;
  const token = cookies[cookieName];

  if (!token) return null;

  try {
    const decoded = await decode({ token, secret, salt: cookieName });
    return decoded as Record<string, unknown> | null;
  } catch {
    return null;
  }
}
