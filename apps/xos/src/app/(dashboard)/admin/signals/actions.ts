"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { signals } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const SIGNAL_TYPES = ["MONEY_STUCK", "MOMENTUM_RISK", "COMPLIANCE_RISK", "SYSTEM_RISK", "PIPELINE_RISK"] as const;
const SEVERITIES = ["LOW", "MEDIUM", "HIGH"] as const;
const STATUSES = ["OPEN", "ACKED", "RESOLVED"] as const;

export async function createSignal(formData: FormData) {
  await requireRole(["CEO", "EXEC"]);
  const title = formData.get("title") as string;
  const signalType = formData.get("signal_type") as string;
  const description = formData.get("description") as string | null;
  const severity = formData.get("severity") as string;
  const status = (formData.get("status") as string) || "OPEN";
  const relatedCommitmentId = (formData.get("related_commitment_id") as string) || null;
  const relatedDecisionId = (formData.get("related_decision_id") as string) || null;
  const relatedSystemId = (formData.get("related_system_id") as string) || null;
  if (!title?.trim()) throw new Error("title required");
  if (!SIGNAL_TYPES.includes(signalType as any)) throw new Error("invalid signal_type");
  if (!SEVERITIES.includes(severity as any)) throw new Error("invalid severity");
  await db.insert(signals).values({
    title: title.trim(),
    signalType: signalType as any,
    description: description?.trim() || null,
    severity: severity as any,
    status: (STATUSES.includes(status as any) ? status : "OPEN") as any,
    relatedCommitmentId: relatedCommitmentId?.trim() || null,
    relatedDecisionId: relatedDecisionId?.trim() || null,
    relatedSystemId: relatedSystemId?.trim() || null,
  });
  revalidatePath("/admin/signals");
  revalidatePath("/dashboard");
}

export async function updateSignal(id: string, formData: FormData) {
  await requireRole(["CEO", "EXEC"]);
  const title = formData.get("title") as string;
  const signalType = formData.get("signal_type") as string;
  const description = formData.get("description") as string | null;
  const severity = formData.get("severity") as string;
  const status = formData.get("status") as string;
  const relatedCommitmentId = (formData.get("related_commitment_id") as string) || null;
  const relatedDecisionId = (formData.get("related_decision_id") as string) || null;
  const relatedSystemId = (formData.get("related_system_id") as string) || null;
  if (!title?.trim()) throw new Error("title required");
  await db
    .update(signals)
    .set({
      title: title.trim(),
      signalType: SIGNAL_TYPES.includes(signalType as any) ? (signalType as any) : undefined,
      description: description?.trim() || null,
      severity: SEVERITIES.includes(severity as any) ? (severity as any) : undefined,
      status: STATUSES.includes(status as any) ? (status as any) : undefined,
      relatedCommitmentId: relatedCommitmentId?.trim() || null,
      relatedDecisionId: relatedDecisionId?.trim() || null,
      relatedSystemId: relatedSystemId?.trim() || null,
      updatedAt: new Date(),
    })
    .where(eq(signals.id, id));
  revalidatePath("/admin/signals");
  revalidatePath("/dashboard");
}

export async function deleteSignal(id: string) {
  await requireRole(["CEO", "EXEC"]);
  await db.delete(signals).where(eq(signals.id, id));
  revalidatePath("/admin/signals");
  revalidatePath("/dashboard");
}
