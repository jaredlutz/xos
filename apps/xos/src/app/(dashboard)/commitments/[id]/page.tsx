import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import {
  commitments,
  owners,
  systems,
  proofs,
  slippages,
  decisions,
  activityLog,
} from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MarkDoneButton } from "./mark-done-button";
import { AiSummaryButton } from "./ai-summary-button";
import { SlippageReasonForm } from "./slippage-reason-form";

export default async function CommitmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [commitment] = await db.select().from(commitments).where(eq(commitments.id, id)).limit(1);
  if (!commitment) notFound();

  const [owner] = await db.select().from(owners).where(eq(owners.id, commitment.ownerId)).limit(1);
  const [system] = await db.select().from(systems).where(eq(systems.id, commitment.systemId)).limit(1);
  const commitmentProofs = await db.select().from(proofs).where(eq(proofs.commitmentId, id));
  const [slippage] = await db.select().from(slippages).where(eq(slippages.commitmentId, id)).limit(1);
  const [linkedDecision] = commitment.id
    ? await db.select().from(decisions).where(eq(decisions.commitmentId, commitment.id)).limit(1)
    : [null];
  const activity = await db
    .select()
    .from(activityLog)
    .where(eq(activityLog.entityId, id))
    .orderBy(desc(activityLog.createdAt))
    .limit(20);

  const hasVerifiedProof = commitmentProofs.some((p) => p.status === "VERIFIED");
  const canMarkDone = commitment.status === "ACTIVE" && hasVerifiedProof;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{commitment.title}</h1>
        <div className="flex gap-2">
          <AiSummaryButton commitmentId={id} />
          {canMarkDone && <MarkDoneButton commitmentId={id} />}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Outcome</CardTitle>
          <p className="text-sm text-muted-foreground">{commitment.outcome}</p>
          <div className="flex flex-wrap gap-2">
            <Badge>{commitment.status}</Badge>
            <Badge variant="secondary">{commitment.blastRadius}</Badge>
            <Badge variant="outline">{commitment.priority}</Badge>
            <span className="text-xs">Owner: {owner?.displayName ?? "—"} · System: {system?.name ?? "—"} · Due: {commitment.dueDate.toISOString().slice(0, 10)}</span>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Proofs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {commitmentProofs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No proofs yet.</p>
          ) : (
            commitmentProofs.map((p) => (
              <div key={p.id} className="rounded border p-3 text-sm flex justify-between items-center">
                <span>{p.label} ({p.type}) — {p.status}</span>
                {p.url && (
                  <a href={p.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    Open
                  </a>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {slippage && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Slippage</CardTitle>
            <p className="text-sm text-muted-foreground">
              First slipped: {slippage.firstSlippedAt.toISOString().slice(0, 16)} · Escalated: {slippage.escalated ? "Yes" : "No"}
            </p>
            {slippage.reason && <p className="text-sm">{slippage.reason}</p>}
          </CardHeader>
          <CardContent>
            {!slippage.reason && <SlippageReasonForm commitmentId={id} />}
          </CardContent>
        </Card>
      )}

      {linkedDecision && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Linked decision</CardTitle>
            <Button size="sm" asChild>
              <Link href={`/decisions/${linkedDecision.id}`}>View decision</Link>
            </Button>
          </CardHeader>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          {activity.length === 0 ? (
            <p className="text-muted-foreground">No activity yet.</p>
          ) : (
            activity.map((a) => (
              <div key={a.id}>
                {a.action} — {a.createdAt.toISOString().slice(0, 16)}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
