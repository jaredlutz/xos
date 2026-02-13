"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function MarkDoneButton({ commitmentId }: { commitmentId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/mark-done", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commitmentId }),
      });
      if (res.ok) router.refresh();
      else alert("Failed to mark done. Ensure at least one proof is verified.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button onClick={handleClick} disabled={loading}>
      {loading ? "Saving…" : "Mark done"}
    </Button>
  );
}
