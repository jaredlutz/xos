import Link from "next/link";
import { db } from "@/lib/db";
import { commitments, owners, systems } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function CommitmentsPage() {
  const all = await db.select().from(commitments).orderBy(commitments.dueDate);
  const withMeta = await Promise.all(
    all.map(async (c) => {
      const [owner] = await db.select().from(owners).where(eq(owners.id, c.ownerId)).limit(1);
      const [system] = await db.select().from(systems).where(eq(systems.id, c.systemId)).limit(1);
      return { commitment: c, owner, system };
    })
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Commitments</h1>
      <div className="grid gap-4">
        {withMeta.map(({ commitment, owner, system }) => (
          <Card key={commitment.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">
                <Link href={`/commitments/${commitment.id}`} className="hover:underline">
                  {commitment.title}
                </Link>
              </CardTitle>
              <p className="text-sm text-muted-foreground">{commitment.outcome}</p>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Badge variant="secondary">{commitment.status}</Badge>
              <Badge variant="outline">{commitment.blastRadius}</Badge>
              <Badge variant="outline">{commitment.priority}</Badge>
              <span className="text-xs text-muted-foreground">
                Owner: {owner?.displayName ?? "—"} · System: {system?.name ?? "—"} · Due: {commitment.dueDate.toISOString().slice(0, 10)}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>
      {withMeta.length === 0 && (
        <p className="text-muted-foreground">No commitments yet.</p>
      )}
    </div>
  );
}
