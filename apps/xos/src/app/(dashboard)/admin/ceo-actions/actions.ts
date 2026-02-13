"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { ceoActions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function createCeoAction(formData: FormData) {
  await requireRole(["CEO", "EXEC"]);
  const title = formData.get("title") as string;
  const whyItMatters = formData.get("why_it_matters") as string | null;
  const impactLabel = formData.get("impact_label") as string | null;
  const dueBy = formData.get("due_by") as string | null;
  const ownerId = (formData.get("owner_id") as string) || null;
  const relatedDecisionId = (formData.get("related_decision_id") as string) || null;
  const relatedCommitmentId = (formData.get("related_commitment_id") as string) || null;
  const actionButtonsRaw = formData.get("action_buttons") as string | null;
  const status = (formData.get("status") as string) === "DONE" ? "DONE" : "OPEN";
  if (!title?.trim()) throw new Error("title required");
  let actionButtons: unknown = null;
  if (actionButtonsRaw?.trim()) {
    try {
      actionButtons = JSON.parse(actionButtonsRaw);
    } catch {
      throw new Error("action_buttons must be valid JSON array");
    }
  }
  await db.insert(ceoActions).values({
    title: title.trim(),
    whyItMatters: whyItMatters?.trim() || null,
    impactLabel: impactLabel?.trim() || null,
    dueBy: dueBy ? new Date(dueBy) : null,
    ownerId: ownerId?.trim() || null,
    relatedDecisionId: relatedDecisionId?.trim() || null,
    relatedCommitmentId: relatedCommitmentId?.trim() || null,
    actionButtons,
    status: status as "OPEN" | "DONE",
  });
  revalidatePath("/admin/ceo-actions");
  revalidatePath("/dashboard");
}

export async function updateCeoAction(id: string, formData: FormData) {
  await requireRole(["CEO", "EXEC"]);
  const title = formData.get("title") as string;
  const whyItMatters = formData.get("why_it_matters") as string | null;
  const impactLabel = formData.get("impact_label") as string | null;
  const dueBy = formData.get("due_by") as string | null;
  const ownerId = (formData.get("owner_id") as string) || null;
  const relatedDecisionId = (formData.get("related_decision_id") as string) || null;
  const relatedCommitmentId = (formData.get("related_commitment_id") as string) || null;
  const actionButtonsRaw = formData.get("action_buttons") as string | null;
  const status = (formData.get("status") as string) === "DONE" ? "DONE" : "OPEN";
  if (!title?.trim()) throw new Error("title required");
  let actionButtons: unknown = undefined;
  if (actionButtonsRaw?.trim()) {
    try {
      actionButtons = JSON.parse(actionButtonsRaw);
    } catch {
      throw new Error("action_buttons must be valid JSON array");
    }
  }
  await db
    .update(ceoActions)
    .set({
      title: title.trim(),
      whyItMatters: whyItMatters?.trim() || null,
      impactLabel: impactLabel?.trim() || null,
      dueBy: dueBy ? new Date(dueBy) : null,
      ownerId: ownerId?.trim() || null,
      relatedDecisionId: relatedDecisionId?.trim() || null,
      relatedCommitmentId: relatedCommitmentId?.trim() || null,
      ...(actionButtons !== undefined && { actionButtons }),
      status: status as "OPEN" | "DONE",
      updatedAt: new Date(),
    })
    .where(eq(ceoActions.id, id));
  revalidatePath("/admin/ceo-actions");
  revalidatePath("/dashboard");
}

export async function deleteCeoAction(id: string) {
  await requireRole(["CEO", "EXEC"]);
  await db.delete(ceoActions).where(eq(ceoActions.id, id));
  revalidatePath("/admin/ceo-actions");
  revalidatePath("/dashboard");
}
