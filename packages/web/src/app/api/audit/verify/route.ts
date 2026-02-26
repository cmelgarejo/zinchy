import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { verifyIntegrity } from "@/lib/audit";

export async function GET(request: NextRequest) {
  const sessionOrError = await requireAdmin();
  if (sessionOrError instanceof NextResponse) return sessionOrError;

  const url = new URL(request.url);
  const fromId = url.searchParams.get("fromId");
  const toId = url.searchParams.get("toId");

  const result = await verifyIntegrity(
    fromId ? parseInt(fromId) : undefined,
    toId ? parseInt(toId) : undefined
  );

  return NextResponse.json(result);
}
