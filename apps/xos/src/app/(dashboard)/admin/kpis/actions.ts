"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { kpiMetrics } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function createKpi(formData: FormData) {
  await requireRole(["CEO", "EXEC"]);
  const kpiKey = formData.get("kpi_key") as string;
  const label = formData.get("label") as string | null;
  const valueNum = formData.get("value_num") as string | null;
  const valueText = formData.get("value_text") as string | null;
  const deltaNum = formData.get("delta_num") as string | null;
  const period = formData.get("period") as string | null;
  const systemId = formData.get("system_id") as string | null;
  if (!kpiKey?.trim()) throw new Error("kpi_key required");
  await db.insert(kpiMetrics).values({
    kpiKey: kpiKey.trim(),
    label: label?.trim() || null,
    valueNum: valueNum?.trim() || null,
    valueText: valueText?.trim() || null,
    deltaNum: deltaNum?.trim() || null,
    period: period?.trim() || null,
    systemId: systemId?.trim() || null,
  });
  revalidatePath("/admin/kpis");
  revalidatePath("/dashboard");
}

export async function updateKpi(id: string, formData: FormData) {
  await requireRole(["CEO", "EXEC"]);
  const label = formData.get("label") as string | null;
  const valueNum = formData.get("value_num") as string | null;
  const valueText = formData.get("value_text") as string | null;
  const deltaNum = formData.get("delta_num") as string | null;
  const period = formData.get("period") as string | null;
  const systemId = formData.get("system_id") as string | null;
  await db
    .update(kpiMetrics)
    .set({
      label: label?.trim() || null,
      valueNum: valueNum?.trim() || null,
      valueText: valueText?.trim() || null,
      deltaNum: deltaNum?.trim() || null,
      period: period?.trim() || null,
      systemId: systemId?.trim() || null,
      updatedAt: new Date(),
    })
    .where(eq(kpiMetrics.id, id));
  revalidatePath("/admin/kpis");
  revalidatePath("/dashboard");
}

export async function deleteKpi(id: string) {
  await requireRole(["CEO", "EXEC"]);
  await db.delete(kpiMetrics).where(eq(kpiMetrics.id, id));
  revalidatePath("/admin/kpis");
  revalidatePath("/dashboard");
}
