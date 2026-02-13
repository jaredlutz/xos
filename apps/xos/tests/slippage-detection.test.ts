import { describe, it, expect, beforeAll } from "vitest";
import { eq } from "drizzle-orm";

const testSystemId = "00000000-0000-0000-0000-000000000001";
const testOwnerId = "00000000-0000-0000-0000-000000000002";

const hasDb = !!process.env.DATABASE_URL;

describe("detectSlippage", () => {
  beforeAll(async () => {
    if (!hasDb) return;
    const { db } = await import("../src/lib/db");
    const { systems, owners } = await import("../src/lib/db/schema");
    try {
      await db.insert(systems).values({
        id: testSystemId,
        key: "test-slippage",
        name: "Test",
      }).onConflictDoNothing();
      await db.insert(owners).values({
        id: testOwnerId,
        displayName: "Test Owner",
      }).onConflictDoNothing();
    } catch (e) {
      console.warn("Seed for test failed (may already exist):", e);
    }
  });

  it("creates slippage row for past-due active commitment", async () => {
    if (!hasDb) return;
    const { db } = await import("../src/lib/db");
    const { commitments, slippages } = await import("../src/lib/db/schema");
    const pastDue = new Date(Date.now() - 86400 * 1000);
    const [c] = await db
      .insert(commitments)
      .values({
        systemId: testSystemId,
        title: "Test commitment",
        outcome: "Test outcome",
        ownerId: testOwnerId,
        dueDate: pastDue,
        status: "ACTIVE",
      })
      .returning();
    if (!c) throw new Error("Insert failed");

    const { detectSlippage } = await import("../src/lib/slippage/detect");
    await detectSlippage();

    const [s] = await db.select().from(slippages).where(eq(slippages.commitmentId, c.id)).limit(1);
    expect(s).toBeDefined();
    const [updated] = await db.select().from(commitments).where(eq(commitments.id, c.id)).limit(1);
    expect(updated?.slipCount).toBe(1);

    await db.delete(slippages).where(eq(slippages.commitmentId, c.id));
    await db.delete(commitments).where(eq(commitments.id, c.id));
  });

  it("escalates on second slip and creates decision", async () => {
    if (!hasDb) return;
    const { db } = await import("../src/lib/db");
    const {
      commitments,
      slippages,
      decisions,
      decisionOptions,
    } = await import("../src/lib/db/schema");
    const pastDue = new Date(Date.now() - 86400 * 1000);
    const [c] = await db
      .insert(commitments)
      .values({
        systemId: testSystemId,
        title: "Test commitment 2",
        outcome: "Test outcome 2",
        ownerId: testOwnerId,
        dueDate: pastDue,
        status: "ACTIVE",
        slipCount: 1,
      })
      .returning();
    if (!c) throw new Error("Insert failed");
    await db.insert(slippages).values({
      commitmentId: c.id,
    });

    const { detectSlippage } = await import("../src/lib/slippage/detect");
    await detectSlippage();

    const [s] = await db.select().from(slippages).where(eq(slippages.commitmentId, c.id)).limit(1);
    expect(s?.escalated).toBe(true);
    const [d] = await db.select().from(decisions).where(eq(decisions.commitmentId, c.id)).limit(1);
    expect(d).toBeDefined();
    expect(d?.status).toBe("QUEUED");

    await db.delete(decisionOptions).where(eq(decisionOptions.decisionId, d!.id));
    await db.delete(decisions).where(eq(decisions.id, d!.id));
    await db.delete(slippages).where(eq(slippages.commitmentId, c.id));
    await db.delete(commitments).where(eq(commitments.id, c.id));
  });
});
