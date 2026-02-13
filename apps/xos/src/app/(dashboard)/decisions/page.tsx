import Link from "next/link";
import { db } from "@/lib/db";
import { decisions } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function DecisionsPage() {
  const all = await db.select().from(decisions).orderBy(desc(decisions.createdAt));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Decisions</h1>
      <div className="grid gap-4">
        {all.map((d) => (
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
      {all.length === 0 && <p className="text-muted-foreground">No decisions yet.</p>}
    </div>
  );
}
