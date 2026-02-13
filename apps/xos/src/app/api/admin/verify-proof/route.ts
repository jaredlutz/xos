import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { proofs, commitments, activityLog } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const bodySchema = z.object({
  proofId: z.string().uuid(),
  status: z.enum(["VERIFIED", "REJECTED"]),
});

export async function POST(request: NextRequest) {
  let user;
  try {
    user = await requireRole(["CEO", "EXEC"]);
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body", details: parsed.error.flatten() }, { status: 400 });
  }

  const { proofId, status } = parsed.data;
  const [proof] = await db.select().from(proofs).where(eq(proofs.id, proofId)).limit(1);
  if (!proof) {
    return NextResponse.json({ error: "Proof not found" }, { status: 404 });
  }

  const now = new Date();

  await db
    .update(proofs)
    .set({
      status,
      verifiedBy: user.id,
      verifiedAt: now,
    })
    .where(eq(proofs.id, proofId));

  await db.insert(activityLog).values({
    actorUserId: user.id,
    entityType: "PROOF",
    entityId: proofId,
    action: `proof.${status.toLowerCase()}`,
    meta: { commitmentId: proof.commitmentId },
  });

  return NextResponse.json({ ok: true });
}
