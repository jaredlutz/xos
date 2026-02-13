import { db } from "@/lib/db";
import { proofs, commitments } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export async function ProofInboxCard() {
  const submitted = await db
    .select()
    .from(proofs)
    .where(eq(proofs.status, "SUBMITTED"))
    .orderBy(desc(proofs.createdAt))
    .limit(10);

  const withCommitment = await Promise.all(
    submitted.map(async (p) => {
      const [c] = await db
        .select({ id: commitments.id, title: commitments.title })
        .from(commitments)
        .where(eq(commitments.id, p.commitmentId))
        .limit(1);
      return { proof: p, commitment: c };
    })
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Proof Inbox</CardTitle>
        <p className="text-sm text-muted-foreground">Submitted proofs needing verification.</p>
      </CardHeader>
      <CardContent className="space-y-2">
        {withCommitment.length === 0 ? (
          <p className="text-sm text-muted-foreground">No proofs awaiting verification.</p>
        ) : (
          withCommitment.map(({ proof, commitment }) => (
            <div
              key={proof.id}
              className="flex items-center justify-between rounded border p-2 text-sm"
            >
              <span>
                {proof.label} ({proof.type}) — {commitment?.title ?? "—"}
              </span>
              <Link
                href={`/commitments/${proof.commitmentId}`}
                className="text-primary hover:underline"
              >
                Verify
              </Link>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
