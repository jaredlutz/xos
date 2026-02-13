import { db } from "@/lib/db";
import { kpiMetrics, systems } from "@/lib/db/schema";
import { asc } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KpiForm } from "./kpi-form";

export default async function AdminKpisPage() {
  const all = await db.select().from(kpiMetrics).orderBy(asc(kpiMetrics.kpiKey));
  const systemsList = await db.select().from(systems);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">KPIs</h1>
      <p className="text-sm text-muted-foreground">
        Create and edit KPI metrics for the Live Scoreboard. Keys like capital.pipeline_usd, marketing.forms_today, etc.
      </p>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add KPI</CardTitle>
        </CardHeader>
        <CardContent>
          <KpiForm systems={systemsList} />
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="font-semibold">Existing KPIs</h2>
        {all.length === 0 ? (
          <p className="text-muted-foreground">No KPIs yet. Add one above.</p>
        ) : (
          <div className="grid gap-4">
            {all.map((k) => (
              <Card key={k.id}>
                <CardContent className="pt-4">
                  <KpiForm systems={systemsList} initial={k} />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
