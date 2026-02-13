"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

type Option = { id: string; label: string; description: string | null };

export function SelectOptionForm({
  decisionId,
  options,
}: {
  decisionId: string;
  options: Option[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function select(optionId: string) {
    setLoading(optionId);
    try {
      const res = await fetch("/api/admin/decision/select-option", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decisionId, optionId }),
      });
      if (res.ok) router.refresh();
      else alert("Failed to record decision.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <ul className="space-y-2">
      {options.map((o) => (
        <li key={o.id} className="rounded border p-3 flex items-center justify-between gap-4">
          <div>
            <p className="font-medium">{o.label}</p>
            {o.description && (
              <p className="text-sm text-muted-foreground mt-1">{o.description}</p>
            )}
          </div>
          <Button
            size="sm"
            onClick={() => select(o.id)}
            disabled={loading !== null}
          >
            {loading === o.id ? "Saving…" : "Select"}
          </Button>
        </li>
      ))}
    </ul>
  );
}
