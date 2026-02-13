import { db } from "@/lib/db";
import { systems } from "@/lib/db/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminSystemsPage() {
  const all = await db.select().from(systems);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Systems</h1>
      <p className="text-sm text-muted-foreground">
        Manage systems and webhook secrets. Use SYSTEM_WEBHOOK_SECRETS_JSON env for runtime verification.
      </p>
      <div className="grid gap-4">
        {all.map((s) => (
          <Card key={s.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{s.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{s.description ?? "—"}</p>
              <p className="text-xs font-mono">key: {s.key}</p>
            </CardHeader>
          </Card>
        ))}
      </div>
      {all.length === 0 && <p className="text-muted-foreground">No systems. Run seed to create default systems.</p>}
    </div>
  );
}
