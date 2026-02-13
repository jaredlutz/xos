import Link from "next/link";
import { db } from "@/lib/db";
import { commitments, owners, systems } from "@/lib/db/schema";
import { eq, asc, desc, and } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CommitmentsFilters } from "./commitments-filters";

const now = new Date();
const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

function isOverdue(due: Date) {
  return due < now;
}
function isDueSoon(due: Date) {
  return due >= now && due <= threeDaysFromNow;
}

export default async function CommitmentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const ownerId = typeof params.owner_id === "string" ? params.owner_id : undefined;
  const systemId = typeof params.system_id === "string" ? params.system_id : undefined;
  const blastRadius = typeof params.blast_radius === "string" ? params.blast_radius : undefined;
  const sort = typeof params.sort === "string" ? params.sort : "due_asc";

  const conditions = [];
  if (ownerId) conditions.push(eq(commitments.ownerId, ownerId));
  if (systemId) conditions.push(eq(commitments.systemId, systemId));
  if (blastRadius) conditions.push(eq(commitments.blastRadius, blastRadius as "LOW" | "MEDIUM" | "HIGH"));
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const baseQuery = whereClause
    ? db.select().from(commitments).where(whereClause)
    : db.select().from(commitments);
  const all =
    sort === "priority"
      ? await baseQuery.orderBy(asc(commitments.priority), asc(commitments.dueDate))
      : sort === "due_desc"
      ? await baseQuery.orderBy(desc(commitments.dueDate))
      : await baseQuery.orderBy(asc(commitments.dueDate));

  const withMeta = await Promise.all(
    all.map(async (c) => {
      const [owner] = await db.select().from(owners).where(eq(owners.id, c.ownerId)).limit(1);
      const [system] = await db.select().from(systems).where(eq(systems.id, c.systemId)).limit(1);
      return { commitment: c, owner, system };
    })
  );

  const ownersList = await db.select().from(owners);
  const systemsList = await db.select().from(systems);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Commitments</h1>
      <CommitmentsFilters owners={ownersList} systems={systemsList} />
      <div className="grid gap-4">
        {withMeta.map(({ commitment, owner, system }) => {
          const due = new Date(commitment.dueDate);
          const overdue = isOverdue(due);
          const dueSoon = commitment.status === "ACTIVE" && isDueSoon(due);
          return (
            <Card key={commitment.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">
                  <Link href={`/commitments/${commitment.id}`} className="hover:underline">
                    {commitment.title}
                  </Link>
                </CardTitle>
                <p className="text-sm text-muted-foreground">{commitment.outcome}</p>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2 items-center">
                <Badge variant="secondary">{commitment.status}</Badge>
                <Badge variant="outline">{commitment.blastRadius}</Badge>
                <Badge variant="outline">{commitment.priority}</Badge>
                {commitment.status === "ACTIVE" && overdue && (
                  <Badge variant="destructive">Overdue</Badge>
                )}
                {dueSoon && <Badge variant="secondary">Due soon</Badge>}
                <span className="text-xs text-muted-foreground">
                  Owner: {owner?.displayName ?? "—"} · System: {system?.name ?? "—"} · Due: {due.toISOString().slice(0, 10)}
                </span>
              </CardContent>
            </Card>
          );
        })}
      </div>
      {withMeta.length === 0 && (
        <p className="text-muted-foreground">No commitments match the filters.</p>
      )}
    </div>
  );
}
