import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { fetchProviderModels, type ProviderModels } from "@/lib/provider-models";

let cachedResult: ProviderModels[] | null = null;
let cachedAt: number = 0;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

export function resetCache() {
  cachedResult = null;
  cachedAt = 0;
}

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = Date.now();
  if (cachedResult && now - cachedAt < CACHE_TTL_MS) {
    return NextResponse.json({ providers: cachedResult });
  }

  const providers = await fetchProviderModels();

  cachedResult = providers;
  cachedAt = now;

  return NextResponse.json({ providers });
}
