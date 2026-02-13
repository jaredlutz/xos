import Link from "next/link";
import { db } from "@/lib/db";
import { kpiMetrics } from "@/lib/db/schema";
import { inArray } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const TILES: { title: string; keys: string[] }[] = [
  {
    title: "Capital Raising",
    keys: ["capital.pipeline_usd", "capital.committed_usd"],
  },
  {
    title: "Marketing Engine",
    keys: ["marketing.forms_today", "marketing.cpl_usd"],
  },
  {
    title: "Sales Engine",
    keys: ["sales.conversations_7d", "sales.booked_calls_7d"],
  },
  {
    title: "Platform / Ops Health",
    keys: ["platform.p0_incidents_7d", "platform.deploy_status"],
  },
];

export async function LiveScoreboardCard({ canEdit }: { canEdit: boolean }) {
  const all = await db.select().from(kpiMetrics);
  const byKey = Object.fromEntries(all.map((k) => [k.kpiKey, k]));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Live Scoreboard</CardTitle>
        <p className="text-sm text-muted-foreground">Key metrics at a glance.</p>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TILES.map((tile) => {
            const metrics = tile.keys
              .map((key) => byKey[key])
              .filter(Boolean);
            const hasData = metrics.length > 0;
            return (
              <div
                key={tile.title}
                className="rounded-lg border p-4 min-h-[100px] flex flex-col"
              >
                <p className="text-sm font-semibold text-muted-foreground mb-2">
                  {tile.title}
                </p>
                {hasData ? (
                  <div className="space-y-1">
                    {metrics.map((m) => (
                      <div key={m.id} className="flex items-baseline justify-between gap-2">
                        <span className="font-semibold text-lg">
                          {m.valueNum != null ? String(m.valueNum) : m.valueText ?? "—"}
                        </span>
                        {m.deltaNum != null && (
                          <span className="text-xs text-muted-foreground">
                            {Number(m.deltaNum) >= 0 ? "+" : ""}{m.deltaNum}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col justify-end">
                    <p className="text-sm text-muted-foreground">Not wired yet</p>
                    {canEdit && (
                      <Link
                        href="/admin/kpis"
                        className="text-xs text-primary hover:underline mt-1"
                      >
                        Add KPIs
                      </Link>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
