"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createSignal, updateSignal, deleteSignal } from "./actions";
import type { Signal } from "@/lib/db/schema";
import type { System } from "@/lib/db/schema";
import type { Commitment } from "@/lib/db/schema";
import type { Decision } from "@/lib/db/schema";

const SIGNAL_TYPES = ["MONEY_STUCK", "MOMENTUM_RISK", "COMPLIANCE_RISK", "SYSTEM_RISK", "PIPELINE_RISK"];
const SEVERITIES = ["LOW", "MEDIUM", "HIGH"];
const STATUSES = ["OPEN", "ACKED", "RESOLVED"];

export function SignalForm({
  systems,
  commitments,
  decisions,
  initial,
}: {
  systems: System[];
  commitments: Commitment[];
  decisions: Decision[];
  initial?: Signal;
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
        await updateSignal(initial!.id, formData);
      } else {
        await createSignal(formData);
        form.reset();
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!initial || !confirm("Delete this signal?")) return;
    setLoading(true);
    try {
      await deleteSignal(initial.id);
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
          <label className="text-sm font-medium">Title</label>
          <input
            name="title"
            defaultValue={initial?.title}
            className="w-full rounded border px-3 py-2 text-sm"
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium">Type</label>
          <select name="signal_type" defaultValue={initial?.signalType} className="w-full rounded border px-3 py-2 text-sm">
            {SIGNAL_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="text-sm font-medium">Description</label>
          <textarea
            name="description"
            defaultValue={initial?.description ?? ""}
            rows={2}
            className="w-full rounded border px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Severity</label>
          <select name="severity" defaultValue={initial?.severity} className="w-full rounded border px-3 py-2 text-sm">
            {SEVERITIES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">Status</label>
          <select name="status" defaultValue={initial?.status} className="w-full rounded border px-3 py-2 text-sm">
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">Related Commitment</label>
          <select name="related_commitment_id" defaultValue={initial?.relatedCommitmentId ?? ""} className="w-full rounded border px-3 py-2 text-sm">
            <option value="">—</option>
            {commitments.map((c) => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">Related Decision</label>
          <select name="related_decision_id" defaultValue={initial?.relatedDecisionId ?? ""} className="w-full rounded border px-3 py-2 text-sm">
            <option value="">—</option>
            {decisions.map((d) => (
              <option key={d.id} value={d.id}>{d.title}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">Related System</label>
          <select name="related_system_id" defaultValue={initial?.relatedSystemId ?? ""} className="w-full rounded border px-3 py-2 text-sm">
            <option value="">—</option>
            {systems.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={loading}>{isEdit ? "Update" : "Create"}</Button>
        {isEdit && (
          <Button type="button" variant="destructive" onClick={handleDelete} disabled={loading}>Delete</Button>
        )}
      </div>
    </form>
  );
}
