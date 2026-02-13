import Link from "next/link";
import { db } from "@/lib/db";
import { decisions, commitments, systems } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

function ageString(createdAt: Date): string {
  const ms = Date.now() - new Date(createdAt).getTime();
  const d = Math.floor(ms / (24 * 60 * 60 * 1000));
  const h = Math.floor((ms % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  if (d > 0) return `${d} day${d !== 1 ? "s" : ""}`;
  if (h > 0) return `${h} hour${h !== 1 ? "s" : ""}`;
  return "Just now";
}

export default async function DecisionsPage() {
  const all = await db.select().from(decisions).orderBy(desc(decisions.createdAt));
  const withMeta = await Promise.all(
    all.map(async (d) => {
      let commitmentTitle: string | null = null;
      let systemName: string | null = null;
      if (d.commitmentId) {
        const [c] = await db.select().from(commitments).where(eq(commitments.id, d.commitmentId)).limit(1);
        if (c) {
          commitmentTitle = c.title;
          const [s] = await db.select().from(systems).where(eq(systems.id, c.systemId)).limit(1);
          systemName = s?.name ?? null;
        }
      }
      return { decision: d, commitmentTitle, systemName };
    })
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Decisions</h1>
      <div className="grid gap-4">
        {withMeta.map(({ decision: d, commitmentTitle, systemName }) => (
          <Card key={d.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center justify-between">
                <Link href={`/decisions/${d.id}`} className="hover:underline">
                  {d.title}
                </Link>
                <Badge variant={d.status === "QUEUED" ? "default" : "secondary"}>
                  {d.status}
                </Badge>
              </CardTitle>
              {(commitmentTitle || systemName) && (
                <p className="text-xs text-muted-foreground">
                  {commitmentTitle && <>Commitment: {commitmentTitle}</>}
                  {commitmentTitle && systemName && " · "}
                  {systemName && <>System: {systemName}</>}
                </p>
              )}
              <p className="text-xs text-muted-foreground">Age: {ageString(d.createdAt)}</p>
              <p className="text-sm text-muted-foreground line-clamp-2">{d.context}</p>
              <p className="text-xs text-muted-foreground">
                Consequence if no decision: {d.consequenceIfNoDecision}
              </p>
            </CardHeader>
            <CardContent>
              <Button size="sm" asChild disabled={d.status !== "QUEUED"}>
                <Link href={`/decisions/${d.id}`}>
                  {d.status === "QUEUED" ? "Decide" : "View"}
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      {withMeta.length === 0 && <p className="text-muted-foreground">No decisions yet.</p>}
    </div>
  );
}
