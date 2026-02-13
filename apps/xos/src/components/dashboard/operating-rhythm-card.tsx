import Link from "next/link";
import { db } from "@/lib/db";
import { commitments } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const priorityOrder = ["P0", "P1", "P2", "P3"];
const blastOrder = ["HIGH", "MEDIUM", "LOW"];

export async function OperatingRhythmCard() {
  const all = await db
    .select()
    .from(commitments)
    .where(eq(commitments.status, "ACTIVE"))
    .orderBy(desc(commitments.dueDate));

  const sorted = [...all].sort((a, b) => {
    const p = priorityOrder.indexOf(a.priority) - priorityOrder.indexOf(b.priority);
    if (p !== 0) return p;
    return blastOrder.indexOf(b.blastRadius) - blastOrder.indexOf(a.blastRadius);
  });
  const top3 = sorted.slice(0, 3);

  const nextL10 = process.env.NEXT_L10_DATE ?? process.env.NEXT_L10_DATETIME ?? null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Operating Rhythm</CardTitle>
        <p className="text-sm text-muted-foreground">Today and this week.</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <span className="font-medium">
            Today: {new Date().toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
          </span>
          {nextL10 ? (
            <span className="text-muted-foreground">
              Next L10: {new Date(nextL10).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" })}
            </span>
          ) : (
            <span className="text-muted-foreground">Next L10: —</span>
          )}
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">This week&apos;s top outcomes</p>
          {top3.length === 0 ? (
            <p className="text-sm text-muted-foreground">No active commitments.</p>
          ) : (
            <ul className="space-y-2">
              {top3.map((c) => (
                <li key={c.id} className="flex items-center gap-2">
                  <Link href={`/commitments/${c.id}`} className="text-sm font-medium hover:underline">
                    {c.title}
                  </Link>
                  <Badge variant="outline" className="text-xs">{c.priority}</Badge>
                  <Badge variant="secondary" className="text-xs">{c.blastRadius}</Badge>
                </li>
              ))}
            </ul>
          )}
          <Link href="/commitments" className="text-xs text-primary hover:underline mt-2 inline-block">
            View all →
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
