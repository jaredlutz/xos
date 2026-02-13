"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function SlippageReasonForm({ commitmentId }: { commitmentId: string }) {
  const router = useRouter();
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!reason.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/mark-slippage-reason", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commitmentId, reason: reason.trim() }),
      });
      if (res.ok) router.refresh();
      else alert("Failed to save reason.");
    } catch {
      alert("Failed to save reason.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 space-y-2">
      <label className="text-sm font-medium">Add reason (required)</label>
      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Why did this slip?"
        rows={2}
        className="w-full rounded border px-3 py-2 text-sm"
        required
      />
      <Button type="submit" size="sm" disabled={loading}>
        {loading ? "Saving…" : "Submit reason"}
      </Button>
    </form>
  );
}
