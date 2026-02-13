import { db } from "@/lib/db";
import { signals, systems, commitments, decisions } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SignalForm } from "./signal-form";

export default async function AdminSignalsPage() {
  const all = await db.select().from(signals).orderBy(desc(signals.createdAt));
  const systemsList = await db.select().from(systems);
  const commitmentsList = await db.select().from(commitments);
  const decisionsList = await db.select().from(decisions);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Signals</h1>
      <p className="text-sm text-muted-foreground">
        Create and resolve momentum/risk signals shown on the Command Center.
      </p>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add Signal</CardTitle>
        </CardHeader>
        <CardContent>
          <SignalForm
            systems={systemsList}
            commitments={commitmentsList}
            decisions={decisionsList}
          />
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="font-semibold">Existing Signals</h2>
        {all.length === 0 ? (
          <p className="text-muted-foreground">No signals yet.</p>
        ) : (
          <div className="grid gap-4">
            {all.map((s) => (
              <Card key={s.id}>
                <CardContent className="pt-4">
                  <SignalForm
                    systems={systemsList}
                    commitments={commitmentsList}
                    decisions={decisionsList}
                    initial={s}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
