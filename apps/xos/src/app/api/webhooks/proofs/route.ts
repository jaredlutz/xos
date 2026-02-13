import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { systems, commitments, proofs, activityLog } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { verifyXosSignature } from "@/lib/webhooks/verify-signature";
import { z } from "zod";

const proofItemSchema = z.object({
  type: z.enum(["URL", "METRIC", "DEMO", "SCREENSHOT", "DOC"]),
  label: z.string().min(1),
  url: z.string().optional(),
  metricKey: z.string().optional(),
  metricValue: z.string().optional(),
  metricDelta: z.string().optional(),
  notes: z.string().optional(),
});

const payloadSchema = z.object({
  systemKey: z.string().min(1),
  externalRef: z.string().min(1),
  proofs: z.array(proofItemSchema).min(1),
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
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { systemKey, externalRef, proofs: proofItems } = parsed.data;

  const secret = getSecretForSystem(systemKey);
  if (!secret || !verifyXosSignature(rawBody, signature, secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const [system] = await db.select().from(systems).where(eq(systems.key, systemKey)).limit(1);
  if (!system) {
    return NextResponse.json({ error: "Unknown system" }, { status: 400 });
  }

  const commitment = await db.query.commitments.findFirst({
    where: (c, { and, eq }) =>
      and(eq(c.systemId, system.id), eq(c.externalRef, externalRef)),
  });

  if (!commitment) {
    return NextResponse.json({ error: "Commitment not found" }, { status: 404 });
  }

  const inserted = await db.insert(proofs).values(
    proofItems.map((p) => ({
      commitmentId: commitment.id,
      type: p.type,
      label: p.label,
      url: p.url ?? null,
      metricKey: p.metricKey ?? null,
      metricValue: p.metricValue ?? null,
      metricDelta: p.metricDelta ?? null,
      notes: p.notes ?? null,
      status: "SUBMITTED" as const,
    }))
  ).returning();

  for (const p of inserted) {
    await db.insert(activityLog).values({
      entityType: "PROOF",
      entityId: p.id,
      action: "proof.submitted",
      meta: { commitmentId: commitment.id, systemKey },
    });
  }

  return NextResponse.json({ ok: true, count: inserted.length });
}
