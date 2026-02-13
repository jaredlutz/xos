import { db } from "@/lib/db";
import { ceoActions, owners, commitments, decisions } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { Card, CardContent } from "@/components/ui/card";
import { CeoActionForm } from "./ceo-action-form";

export default async function AdminCeoActionsPage() {
  const all = await db.select().from(ceoActions).orderBy(desc(ceoActions.createdAt));
  const ownersList = await db.select().from(owners);
  const commitmentsList = await db.select().from(commitments);
  const decisionsList = await db.select().from(decisions);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">CEO Actions</h1>
      <p className="text-sm text-muted-foreground">
        Create and manage CEO Actions shown on the Command Center. Link to decisions or commitments.
      </p>

      <Card>
        <CardContent className="pt-4">
          <CeoActionForm
            owners={ownersList}
            commitments={commitmentsList}
            decisions={decisionsList}
          />
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="font-semibold">Existing CEO Actions</h2>
        {all.length === 0 ? (
          <p className="text-muted-foreground">No CEO actions yet.</p>
        ) : (
          <div className="grid gap-4">
            {all.map((a) => (
              <Card key={a.id}>
                <CardContent className="pt-4">
                  <CeoActionForm
                    owners={ownersList}
                    commitments={commitmentsList}
                    decisions={decisionsList}
                    initial={a}
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
