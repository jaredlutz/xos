"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createCeoAction, updateCeoAction, deleteCeoAction } from "./actions";
import type { CeoAction } from "@/lib/db/schema";
import type { Owner } from "@/lib/db/schema";
import type { Commitment } from "@/lib/db/schema";
import type { Decision } from "@/lib/db/schema";

export function CeoActionForm({
  owners,
  commitments,
  decisions,
  initial,
}: {
  owners: Owner[];
  commitments: Commitment[];
  decisions: Decision[];
  initial?: CeoAction;
}) {
  const [loading, setLoading] = useState(false);
  const isEdit = !!initial;
  const actionButtonsStr = initial?.actionButtons
    ? JSON.stringify(initial.actionButtons, null, 2)
    : '[{"label":"View","actionType":"openDecision","payload":"<decision-id>"}]';

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const form = e.currentTarget;
      const formData = new FormData(form);
      if (isEdit) {
        await updateCeoAction(initial!.id, formData);
      } else {
        await createCeoAction(formData);
        form.reset();
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!initial || !confirm("Delete this CEO action?")) return;
    setLoading(true);
    try {
      await deleteCeoAction(initial.id);
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
          <label className="text-sm font-medium">Status</label>
          <select name="status" defaultValue={initial?.status} className="w-full rounded border px-3 py-2 text-sm">
            <option value="OPEN">OPEN</option>
            <option value="DONE">DONE</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="text-sm font-medium">Why it matters</label>
          <textarea
            name="why_it_matters"
            defaultValue={initial?.whyItMatters ?? ""}
            rows={2}
            className="w-full rounded border px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Impact label</label>
          <input
            name="impact_label"
            defaultValue={initial?.impactLabel ?? ""}
            className="w-full rounded border px-3 py-2 text-sm"
            placeholder="e.g. +$320K pipeline"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Due by</label>
          <input
            name="due_by"
            type="datetime-local"
            defaultValue={initial?.dueBy ? new Date(initial.dueBy).toISOString().slice(0, 16) : ""}
            className="w-full rounded border px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Owner</label>
          <select name="owner_id" defaultValue={initial?.ownerId ?? ""} className="w-full rounded border px-3 py-2 text-sm">
            <option value="">—</option>
            {owners.map((o) => (
              <option key={o.id} value={o.id}>{o.displayName}</option>
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
          <label className="text-sm font-medium">Related Commitment</label>
          <select name="related_commitment_id" defaultValue={initial?.relatedCommitmentId ?? ""} className="w-full rounded border px-3 py-2 text-sm">
            <option value="">—</option>
            {commitments.map((c) => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="text-sm font-medium">Action buttons (JSON array)</label>
          <textarea
            name="action_buttons"
            defaultValue={actionButtonsStr}
            rows={4}
            className="w-full rounded border px-3 py-2 text-sm font-mono text-xs"
          />
          <p className="text-xs text-muted-foreground mt-1">
            e.g. [&#123;&quot;label&quot;:&quot;View&quot;,&quot;actionType&quot;:&quot;openDecision&quot;,&quot;payload&quot;:&quot;uuid&quot;&#125;]
          </p>
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
