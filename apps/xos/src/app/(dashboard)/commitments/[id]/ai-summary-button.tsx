"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AiSummaryButton({ commitmentId }: { commitmentId: string }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    summary: string;
    risks: string[];
    nextAction: string;
  } | null>(null);

  async function handleClick() {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/ai/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commitmentId }),
      });
      const data = await res.json();
      if (res.ok) setResult(data);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Button variant="outline" onClick={handleClick} disabled={loading}>
        {loading ? "Generating…" : "AI Summary"}
      </Button>
      {result && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-base">AI Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>{result.summary}</p>
            {result.risks?.length > 0 && (
              <div>
                <p className="font-medium">Risks</p>
                <ul className="list-disc pl-4">
                  {result.risks.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            )}
            <p className="font-medium">Next action: {result.nextAction}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
