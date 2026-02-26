import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { db } from "@/db";
import { invites } from "@/db/schema";

export async function GET() {
  const sessionOrError = await requireAdmin();
  if (sessionOrError instanceof NextResponse) return sessionOrError;

  const allInvites = await db
    .select({
      id: invites.id,
      email: invites.email,
      role: invites.role,
      type: invites.type,
      createdAt: invites.createdAt,
      expiresAt: invites.expiresAt,
      claimedAt: invites.claimedAt,
    })
    .from(invites);

  return NextResponse.json({ invites: allInvites });
}
