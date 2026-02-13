import Link from "next/link";
import { db } from "@/lib/db";
import { signals, commitments, decisions, systems } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const severityOrder = ["HIGH", "MEDIUM", "LOW"] as const;

export async function MomentumRisksCard() {
  const open = await db
    .select()
    .from(signals)
    .where(eq(signals.status, "OPEN"))
    .orderBy(desc(signals.createdAt));

  const sorted = [...open].sort(
    (a, b) =>
      severityOrder.indexOf(a.severity as (typeof severityOrder)[number]) -
      severityOrder.indexOf(b.severity as (typeof severityOrder)[number])
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Momentum Risks</CardTitle>
        <p className="text-sm text-muted-foreground">Open signals — view and act.</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {sorted.length === 0 ? (
          <p className="text-sm text-muted-foreground">No open signals.</p>
        ) : (
          sorted.map((s) => {
            let viewHref = "#";
            let viewLabel = "View";
            if (s.relatedDecisionId) {
              viewHref = `/decisions/${s.relatedDecisionId}`;
              viewLabel = "View decision";
            } else if (s.relatedCommitmentId) {
              viewHref = `/commitments/${s.relatedCommitmentId}`;
              viewLabel = "View commitment";
            } else if (s.relatedSystemId) {
              viewHref = "/admin/systems";
              viewLabel = "View systems";
            }
            return (
              <div
                key={s.id}
                className="rounded-lg border p-3 flex flex-wrap items-center justify-between gap-2"
              >
                <div>
                  <p className="font-medium">{s.title}</p>
                  {s.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{s.description}</p>
                  )}
                  <Badge
                    variant={s.severity === "HIGH" ? "destructive" : "secondary"}
                    className="mt-1"
                  >
                    {s.severity}
                  </Badge>
                </div>
                <Link
                  href={viewHref}
                  className="text-sm text-primary hover:underline font-medium"
                >
                  {viewLabel}
                </Link>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
