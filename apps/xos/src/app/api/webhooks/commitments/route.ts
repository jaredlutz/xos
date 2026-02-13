import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  systems,
  owners,
  commitments,
  activityLog,
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { verifyXosSignature } from "@/lib/webhooks/verify-signature";
import { z } from "zod";

const payloadSchema = z.object({
  systemKey: z.string().min(1),
  externalRef: z.string().optional(),
  title: z.string().min(1),
  outcome: z.string().min(1),
  owner: z.object({
    email: z.string().optional(),
    displayName: z.string().min(1),
  }),
  dueDate: z.string(),
  blastRadius: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
  priority: z.enum(["P0", "P1", "P2", "P3"]).default("P2"),
});

function getSecretForSystem(systemKey: string): string | null {
  try {
    const raw = process.env.SYSTEM_WEBHOOK_SECRETS_JSON;
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Record<string, string>;
    return parsed[systemKey] ?? null;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  const signature = request.headers.get("x-xos-signature");
  const rawBody = await request.text();
  if (!signature) {
    return NextResponse.json({ error: "Missing x-xos-signature" }, { status: 401 });
  }

  const parsed = payloadSchema.safeParse(JSON.parse(rawBody));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }

  const { systemKey, externalRef, title, outcome, owner, dueDate, blastRadius, priority } =
    parsed.data;

  const secret = getSecretForSystem(systemKey);
  if (!secret || !verifyXosSignature(rawBody, signature, secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const [system] = await db.select().from(systems).where(eq(systems.key, systemKey)).limit(1);
  if (!system) {
    return NextResponse.json({ error: "Unknown system" }, { status: 400 });
  }

  let ownerRow = null;
  if (owner.email) {
    const [byEmail] = await db
      .select()
      .from(owners)
      .where(eq(owners.email, owner.email))
      .limit(1);
    ownerRow = byEmail ?? null;
  }
  if (!ownerRow) {
    const [inserted] = await db
      .insert(owners)
      .values({
        displayName: owner.displayName,
        email: owner.email ?? undefined,
      })
      .returning();
    ownerRow = inserted!;
  }

  const dueDateObj = new Date(dueDate);

  let commitmentId: string;
  const withRef =
    externalRef != null
      ? await db.query.commitments.findFirst({
          where: (c, { and, eq }) =>
            and(eq(c.systemId, system.id), eq(c.externalRef, externalRef)),
        })
      : null;

  if (withRef) {
    const [updated] = await db
      .update(commitments)
      .set({
        title,
        outcome,
        ownerId: ownerRow.id,
        dueDate: dueDateObj,
        blastRadius,
        priority,
        updatedAt: new Date(),
      })
      .where(eq(commitments.id, withRef.id))
      .returning();
    commitmentId = updated!.id;
  } else {
    const [inserted] = await db
      .insert(commitments)
      .values({
        systemId: system.id,
        externalRef: externalRef ?? null,
        title,
        outcome,
        ownerId: ownerRow.id,
        dueDate: dueDateObj,
        blastRadius,
        priority,
      })
      .returning();
    commitmentId = inserted!.id;
  }

  await db.insert(activityLog).values({
    entityType: "COMMITMENT",
    entityId: commitmentId,
    action: withRef ? "commitment.updated" : "commitment.created",
    meta: { systemKey, externalRef: externalRef ?? null },
  });

  return NextResponse.json({ ok: true, commitmentId });
}
