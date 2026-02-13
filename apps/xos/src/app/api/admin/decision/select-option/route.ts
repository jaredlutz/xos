import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { decisions, decisionOptions, activityLog } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const bodySchema = z.object({
  decisionId: z.string().uuid(),
  optionId: z.string().uuid(),
});

export async function POST(request: NextRequest) {
  let user;
  try {
    user = await requireRole(["CEO"]);
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body", details: parsed.error.flatten() }, { status: 400 });
  }

  const { decisionId, optionId } = parsed.data;

  const [decision] = await db.select().from(decisions).where(eq(decisions.id, decisionId)).limit(1);
  if (!decision) {
    return NextResponse.json({ error: "Decision not found" }, { status: 404 });
  }
  if (decision.status !== "QUEUED") {
    return NextResponse.json({ error: "Decision already resolved" }, { status: 400 });
  }

  const [option] = await db
    .select()
    .from(decisionOptions)
    .where(eq(decisionOptions.id, optionId))
    .limit(1);
  if (!option || option.decisionId !== decisionId) {
    return NextResponse.json({ error: "Option not found" }, { status: 404 });
  }

  await db
    .update(decisionOptions)
    .set({ selected: false })
    .where(eq(decisionOptions.decisionId, decisionId));
  await db
    .update(decisionOptions)
    .set({ selected: true })
    .where(eq(decisionOptions.id, optionId));

  await db
    .update(decisions)
    .set({ status: "DECIDED", updatedAt: new Date() })
    .where(eq(decisions.id, decisionId));

  await db.insert(activityLog).values({
    actorUserId: user.id,
    entityType: "DECISION",
    entityId: decisionId,
    action: "decision.decided",
    meta: { optionId, optionLabel: option.label },
  });

  return NextResponse.json({ ok: true });
}
