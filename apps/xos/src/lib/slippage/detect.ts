import { db } from "@/lib/db";
import {
  commitments,
  slippages,
  decisions,
  decisionOptions,
} from "@/lib/db/schema";
import { and, eq, lt } from "drizzle-orm";

/**
 * Scan active commitments where due_date < now and apply slippage rules:
 * - No slippage row → create one, set commitment.slip_count = 1.
 * - Slippage row exists and slip_count === 1 → set slip_count = 2, escalate, create decision if none.
 * Idempotent: re-runs do not double-increment.
 */
export async function detectSlippage(): Promise<void> {
  const now = new Date();
  const pastDueActive = await db
    .select()
    .from(commitments)
    .where(
      and(eq(commitments.status, "ACTIVE"), lt(commitments.dueDate, now))
    );

  for (const commitment of pastDueActive) {
    const [existingSlippage] = await db
      .select()
      .from(slippages)
      .where(eq(slippages.commitmentId, commitment.id))
      .limit(1);

    if (!existingSlippage) {
      await db.insert(slippages).values({
        commitmentId: commitment.id,
        severity: commitment.blastRadius === "HIGH" ? "HIGH" : commitment.blastRadius === "MEDIUM" ? "MEDIUM" : "LOW",
      });
      await db
        .update(commitments)
        .set({
          slipCount: 1,
          lastStatusAt: now,
          updatedAt: now,
        })
        .where(eq(commitments.id, commitment.id));
      continue;
    }

    if (commitment.slipCount >= 2) continue;

    await db
      .update(commitments)
      .set({
        slipCount: 2,
        lastStatusAt: now,
        updatedAt: now,
      })
      .where(eq(commitments.id, commitment.id));

    await db
      .update(slippages)
      .set({
        escalated: true,
        escalatedAt: now,
        lastSlippedAt: now,
        updatedAt: now,
      })
      .where(eq(slippages.id, existingSlippage.id));

    const [existingDecision] = await db
      .select()
      .from(decisions)
      .where(
        and(
          eq(decisions.commitmentId, commitment.id),
          eq(decisions.status, "QUEUED")
        )
      )
      .limit(1);

    if (!existingDecision) {
      const [newDecision] = await db
        .insert(decisions)
        .values({
          title: `Slippage escalated: ${commitment.title}`,
          context: `Commitment slipped twice. Due: ${commitment.dueDate.toISOString()}. Blast radius: ${commitment.blastRadius}.`,
          commitmentId: commitment.id,
          status: "QUEUED",
          consequenceIfNoDecision: "No action taken; risk continues.",
          maxOptions: 3,
        })
        .returning();

      if (newDecision) {
        await db.insert(decisionOptions).values([
          { decisionId: newDecision.id, label: "Reassign", impact: "MEDIUM" },
          { decisionId: newDecision.id, label: "Extend deadline", impact: "LOW" },
          { decisionId: newDecision.id, label: "Cancel commitment", impact: "HIGH" },
        ]);
      }
    }
  }
}
