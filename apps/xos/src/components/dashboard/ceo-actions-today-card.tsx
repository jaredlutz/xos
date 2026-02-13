import Link from "next/link";
import { db } from "@/lib/db";
import { ceoActions, owners, signals } from "@/lib/db/schema";
import { eq, asc, desc } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const severityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };

export async function CeoActionsTodayCard() {
  const open = await db
    .select()
    .from(ceoActions)
    .where(eq(ceoActions.status, "OPEN"))
    .orderBy(asc(ceoActions.dueBy))
    .limit(10);

  const withMeta = await Promise.all(
    open.map(async (a) => {
      const [owner] = a.ownerId
        ? await db.select().from(owners).where(eq(owners.id, a.ownerId)).limit(1)
        : [null];
      let signalSeverity: number | null = null;
      if (a.relatedDecisionId) {
        const [sig] = await db
          .select({ severity: signals.severity })
          .from(signals)
          .where(eq(signals.relatedDecisionId, a.relatedDecisionId))
          .limit(1);
        if (sig) signalSeverity = severityOrder[sig.severity as keyof typeof severityOrder] ?? 2;
      }
      return { action: a, owner, signalSeverity: signalSeverity ?? 99 };
    })
  );

  const sorted = withMeta.sort((a, b) => (a.signalSeverity ?? 99) - (b.signalSeverity ?? 99));
  const top3 = sorted.slice(0, 3);

  type ActionButton = { label?: string; actionType?: string; payload?: string };
  function renderButtons(buttons: unknown) {
    const arr = Array.isArray(buttons) ? (buttons as ActionButton[]) : [];
    return arr.slice(0, 3).map((btn, i) => {
      if (btn.actionType === "openDecision" && btn.payload) {
        return (
          <Button key={i} size="sm" asChild>
            <Link href={`/decisions/${btn.payload}`}>{btn.label ?? "View"}</Link>
          </Button>
        );
      }
      if (btn.actionType === "openCommitment" && btn.payload) {
        return (
          <Button key={i} size="sm" variant="outline" asChild>
            <Link href={`/commitments/${btn.payload}`}>{btn.label ?? "View"}</Link>
          </Button>
        );
      }
      if (btn.actionType === "openUrl" && typeof btn.payload === "string") {
        return (
          <Button key={i} size="sm" variant="outline" asChild>
            <a href={btn.payload} target="_blank" rel="noopener noreferrer">
              {btn.label ?? "Open"}
            </a>
          </Button>
        );
      }
      return null;
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">CEO Actions Today</CardTitle>
        <p className="text-sm text-muted-foreground">Top 3 — decide and unblock.</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {top3.length === 0 ? (
          <p className="text-sm text-muted-foreground">No actions yet. Create CEO Actions to drive today&apos;s execution.</p>
        ) : (
          top3.map(({ action, owner }) => (
            <div
              key={action.id}
              className="rounded-lg border p-4 space-y-2"
            >
              <p className="font-semibold text-base">{action.title}</p>
              {action.whyItMatters && (
                <p className="text-sm text-muted-foreground">{action.whyItMatters}</p>
              )}
              {action.impactLabel && (
                <p className="text-xs text-primary font-medium">{action.impactLabel}</p>
              )}
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                {action.dueBy && (
                  <span>Due: {new Date(action.dueBy).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" })}</span>
                )}
                {owner && <span>Owner: {owner.displayName}</span>}
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {renderButtons(action.actionButtons)}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
