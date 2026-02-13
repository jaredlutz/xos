import Link from "next/link";
import { db } from "@/lib/db";
import { commitments } from "@/lib/db/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export async function CommitmentsSnapshotCard() {
  const all = await db.select().from(commitments);
  const byBlast = { LOW: 0, MEDIUM: 0, HIGH: 0 };
  const byStatus = { ACTIVE: 0, DONE: 0, CANCELED: 0 };
  for (const c of all) {
    byBlast[c.blastRadius]++;
    byStatus[c.status]++;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Commitments Snapshot</CardTitle>
        <p className="text-sm text-muted-foreground">Counts by blast radius and status.</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">By blast radius</p>
          <div className="flex gap-2 flex-wrap">
            <Badge variant="secondary">LOW: {byBlast.LOW}</Badge>
            <Badge variant="secondary">MEDIUM: {byBlast.MEDIUM}</Badge>
            <Badge variant="destructive">HIGH: {byBlast.HIGH}</Badge>
          </div>
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">By status</p>
          <div className="flex gap-2 flex-wrap">
            <Badge>ACTIVE: {byStatus.ACTIVE}</Badge>
            <Badge variant="outline">DONE: {byStatus.DONE}</Badge>
            <Badge variant="secondary">CANCELED: {byStatus.CANCELED}</Badge>
          </div>
        </div>
        <Link href="/commitments" className="text-sm text-primary hover:underline">
          View all commitments →
        </Link>
      </CardContent>
    </Card>
  );
}
