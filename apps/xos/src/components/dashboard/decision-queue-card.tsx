import Link from "next/link";
import { db } from "@/lib/db";
import { decisions, decisionOptions, commitments } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export async function DecisionQueueCard() {
  const queued = await db
    .select({
      id: decisions.id,
      title: decisions.title,
      consequence: decisions.consequenceIfNoDecision,
      commitmentId: decisions.commitmentId,
    })
    .from(decisions)
    .where(eq(decisions.status, "QUEUED"))
    .orderBy(desc(decisions.createdAt))
    .limit(7);

  const optionsByDecision: Record<string, { id: string; label: string }[]> = {};
  for (const d of queued) {
    const opts = await db
      .select({ id: decisionOptions.id, label: decisionOptions.label })
      .from(decisionOptions)
      .where(eq(decisionOptions.decisionId, d.id))
      .limit(3);
    optionsByDecision[d.id] = opts;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Decision Queue</CardTitle>
        <p className="text-sm text-muted-foreground">Max 7 items — decide to clear.</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {queued.length === 0 ? (
          <p className="text-sm text-muted-foreground">No decisions in queue.</p>
        ) : (
          queued.map((d) => (
            <div
              key={d.id}
              className="rounded-lg border p-3 space-y-2"
            >
              <p className="font-medium">{d.title}</p>
              <p className="text-xs text-muted-foreground">{d.consequence}</p>
              <div className="flex flex-wrap gap-1">
                {(optionsByDecision[d.id] ?? []).map((o) => (
                  <Badge key={o.id} variant="secondary">
                    {o.label}
                  </Badge>
                ))}
              </div>
              <Button size="sm" asChild>
                <Link href={`/decisions/${d.id}`}>Decide</Link>
              </Button>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
