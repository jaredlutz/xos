import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { slippages, activityLog } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const bodySchema = z.object({
  commitmentId: z.string().uuid(),
  reason: z.string().min(1),
});

export async function POST(request: NextRequest) {
  let user;
  try {
    user = await requireRole(["CEO", "EXEC", "OWNER"]);
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body", details: parsed.error.flatten() }, { status: 400 });
  }

  const { commitmentId, reason } = parsed.data;
  const [slippage] = await db
    .select()
    .from(slippages)
    .where(eq(slippages.commitmentId, commitmentId))
    .limit(1);

  if (!slippage) {
    return NextResponse.json({ error: "Slippage not found" }, { status: 404 });
  }

  await db
    .update(slippages)
    .set({ reason, updatedAt: new Date() })
    .where(eq(slippages.id, slippage.id));

  await db.insert(activityLog).values({
    actorUserId: user.id,
    entityType: "SLIPPAGE",
    entityId: slippage.id,
    action: "slippage.reason_added",
    meta: { commitmentId },
  });

  return NextResponse.json({ ok: true });
}
