import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { decisions, decisionOptions, commitments, systems } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SelectOptionForm } from "./select-option-form";

export default async function DecisionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [decision] = await db.select().from(decisions).where(eq(decisions.id, id)).limit(1);
  if (!decision) notFound();

  const options = await db
    .select()
    .from(decisionOptions)
    .where(eq(decisionOptions.decisionId, id));

  let commitmentTitle: string | null = null;
  let systemName: string | null = null;
  if (decision.commitmentId) {
    const [c] = await db
      .select({ title: commitments.title, systemId: commitments.systemId })
      .from(commitments)
      .where(eq(commitments.id, decision.commitmentId))
      .limit(1);
    commitmentTitle = c?.title ?? null;
    if (c?.systemId) {
      const [s] = await db.select({ name: systems.name }).from(systems).where(eq(systems.id, c.systemId)).limit(1);
      systemName = s?.name ?? null;
    }
  }
  const ageMs = Date.now() - new Date(decision.createdAt).getTime();
  const ageDays = Math.floor(ageMs / (24 * 60 * 60 * 1000));
  const ageStr = ageDays > 0 ? `${ageDays} day${ageDays !== 1 ? "s" : ""}` : "Today";

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">{decision.title}</h1>
      <p className="text-sm text-muted-foreground">Age: {ageStr}</p>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Context</CardTitle>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{decision.context}</p>
          {commitmentTitle && (
            <p className="text-xs text-muted-foreground">Linked commitment: {commitmentTitle}</p>
          )}
          {systemName && (
            <p className="text-xs text-muted-foreground">System: {systemName}</p>
          )}
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Consequence if no decision</CardTitle>
          <p className="text-sm text-muted-foreground">{decision.consequenceIfNoDecision}</p>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {decision.status === "QUEUED" ? (
            <SelectOptionForm decisionId={id} options={options} />
          ) : (
            <ul className="space-y-2">
              {options.map((o) => (
                <li key={o.id} className="rounded border p-3">
                  {o.label}
                  {o.selected && <span className="ml-2 text-primary font-medium">(Selected)</span>}
                  {o.description && <p className="text-sm text-muted-foreground mt-1">{o.description}</p>}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
