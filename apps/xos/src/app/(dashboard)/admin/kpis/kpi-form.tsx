"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createKpi, updateKpi, deleteKpi } from "./actions";
import type { KpiMetric } from "@/lib/db/schema";
import type { System } from "@/lib/db/schema";

export function KpiForm({
  systems,
  initial,
}: {
  systems: System[];
  initial?: KpiMetric;
}) {
  const [loading, setLoading] = useState(false);
  const isEdit = !!initial;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const form = e.currentTarget;
      const formData = new FormData(form);
      if (isEdit) {
        await updateKpi(initial!.id, formData);
      } else {
        await createKpi(formData);
        form.reset();
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!initial || !confirm("Delete this KPI?")) return;
    setLoading(true);
    try {
      await deleteKpi(initial.id);
    } catch {
      alert("Failed to delete");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium">KPI Key</label>
          <input
            name="kpi_key"
            defaultValue={initial?.kpiKey}
            disabled={isEdit}
            className="w-full rounded border px-3 py-2 text-sm"
            placeholder="e.g. capital.pipeline_usd"
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium">Label</label>
          <input
            name="label"
            defaultValue={initial?.label ?? ""}
            className="w-full rounded border px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Value (number)</label>
          <input
            name="value_num"
            type="text"
            defaultValue={initial?.valueNum ?? ""}
            className="w-full rounded border px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Value (text)</label>
          <input
            name="value_text"
            defaultValue={initial?.valueText ?? ""}
            className="w-full rounded border px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Delta</label>
          <input
            name="delta_num"
            type="text"
            defaultValue={initial?.deltaNum ?? ""}
            className="w-full rounded border px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Period</label>
          <input
            name="period"
            defaultValue={initial?.period ?? ""}
            className="w-full rounded border px-3 py-2 text-sm"
            placeholder="e.g. today, 7d, 30d"
          />
        </div>
        <div>
          <label className="text-sm font-medium">System</label>
          <select
            name="system_id"
            defaultValue={initial?.systemId ?? ""}
            className="w-full rounded border px-3 py-2 text-sm"
          >
            <option value="">—</option>
            {systems.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={loading}>
          {isEdit ? "Update" : "Create"}
        </Button>
        {isEdit && (
          <Button type="button" variant="destructive" onClick={handleDelete} disabled={loading}>
            Delete
          </Button>
        )}
      </div>
    </form>
  );
}
