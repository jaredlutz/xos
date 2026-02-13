import { db } from "@/lib/db";
import { owners } from "@/lib/db/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminOwnersPage() {
  const all = await db.select().from(owners);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Owners</h1>
      <p className="text-sm text-muted-foreground">People who own commitments.</p>
      <div className="grid gap-4">
        {all.map((o) => (
          <Card key={o.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{o.displayName}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {o.email ?? "—"} {o.slackHandle ? `· @${o.slackHandle}` : ""}
              </p>
            </CardHeader>
          </Card>
        ))}
      </div>
      {all.length === 0 && <p className="text-muted-foreground">No owners. They are created via webhooks or seed.</p>}
    </div>
  );
}
