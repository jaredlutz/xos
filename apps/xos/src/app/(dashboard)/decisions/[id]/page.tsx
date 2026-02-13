import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { decisions, decisionOptions, commitments } from "@/lib/db/schema";
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
  if (decision.commitmentId) {
    const [c] = await db
      .select({ title: commitments.title })
      .from(commitments)
      .where(eq(commitments.id, decision.commitmentId))
      .limit(1);
    commitmentTitle = c?.title ?? null;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">{decision.title}</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Context</CardTitle>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{decision.context}</p>
          {commitmentTitle && (
            <p className="text-xs text-muted-foreground">Linked commitment: {commitmentTitle}</p>
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
