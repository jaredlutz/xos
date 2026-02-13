import Link from "next/link";
import { db } from "@/lib/db";
import { slippages, commitments, owners } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export async function SlippageCard() {
  const allSlippages = await db.select().from(slippages);
  const items = await Promise.all(
    allSlippages.map(async (s) => {
      const [c] = await db
        .select()
        .from(commitments)
        .where(eq(commitments.id, s.commitmentId))
        .limit(1);
      const [o] = c
        ? await db.select().from(owners).where(eq(owners.id, c.ownerId)).limit(1)
        : [null];
      return { slippage: s, commitment: c!, owner: o };
    })
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Slippage</CardTitle>
        <p className="text-sm text-muted-foreground">Late commitments — reason required.</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No slippage.</p>
        ) : (
          items.map(({ slippage, commitment, owner }) => (
            <div
              key={slippage.id}
              className="rounded-lg border p-3 flex flex-wrap items-center justify-between gap-2"
            >
              <div>
                <p className="font-medium">{commitment?.title ?? "—"}</p>
                <p className="text-xs text-muted-foreground">
                  Owner: {owner?.displayName ?? "—"} · Due: {commitment?.dueDate?.toISOString().slice(0, 10)} · Slips: {commitment?.slipCount ?? 0}
                </p>
                {!slippage.reason && (
                  <Badge variant="destructive" className="mt-1">Reason required</Badge>
                )}
              </div>
              <Button size="sm" variant="outline" asChild>
                <Link href={`/commitments/${commitment?.id}`}>
                  {slippage.reason ? "View" : "Add reason"}
                </Link>
              </Button>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
