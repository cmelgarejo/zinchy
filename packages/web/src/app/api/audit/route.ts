import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { db } from "@/db";
import { auditLog } from "@/db/schema";
import { desc, eq, and, gte, lte, count } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const sessionOrError = await requireAdmin();
  if (sessionOrError instanceof NextResponse) return sessionOrError;

  const url = new URL(request.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") || "50")));
  const eventType = url.searchParams.get("eventType");
  const actorId = url.searchParams.get("actorId");
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");

  const conditions = [];
  if (eventType) conditions.push(eq(auditLog.eventType, eventType));
  if (actorId) conditions.push(eq(auditLog.actorId, actorId));
  if (from) conditions.push(gte(auditLog.timestamp, new Date(from)));
  if (to) conditions.push(lte(auditLog.timestamp, new Date(to)));

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [entries, totalResult] = await Promise.all([
    db
      .select()
      .from(auditLog)
      .where(where)
      .orderBy(desc(auditLog.timestamp))
      .limit(limit)
      .offset((page - 1) * limit),
    db.select({ count: count() }).from(auditLog).where(where),
  ]);

  return NextResponse.json({
    entries,
    total: totalResult[0]?.count ?? 0,
    page,
    limit,
  });
}
