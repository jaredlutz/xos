import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { commitments, proofs, activityLog } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const bodySchema = z.object({
  commitmentId: z.string().uuid(),
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

  const { commitmentId } = parsed.data;
  const [commitment] = await db.select().from(commitments).where(eq(commitments.id, commitmentId)).limit(1);
  if (!commitment) {
    return NextResponse.json({ error: "Commitment not found" }, { status: 404 });
  }
  if (commitment.status !== "ACTIVE") {
    return NextResponse.json({ error: "Commitment is not active" }, { status: 400 });
  }

  const commitmentProofs = await db.select().from(proofs).where(eq(proofs.commitmentId, commitmentId));
  const hasVerified = commitmentProofs.some((p) => p.status === "VERIFIED");
  if (!hasVerified) {
    return NextResponse.json(
      { error: "At least one proof must be verified before marking done" },
      { status: 400 }
    );
  }

  await db
    .update(commitments)
    .set({ status: "DONE", lastStatusAt: new Date(), updatedAt: new Date() })
    .where(eq(commitments.id, commitmentId));

  await db.insert(activityLog).values({
    actorUserId: user.id,
    entityType: "COMMITMENT",
    entityId: commitmentId,
    action: "commitment.done",
    meta: {},
  });

  return NextResponse.json({ ok: true });
}
