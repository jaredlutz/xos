import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { userPrefs, decisions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { canVerifyProof } from "@/lib/permissions";
import { DecisionQueueCard } from "@/components/dashboard/decision-queue-card";
import { SlippageCard } from "@/components/dashboard/slippage-card";
import { CommitmentsSnapshotCard } from "@/components/dashboard/commitments-snapshot-card";
import { ProofInboxCard } from "@/components/dashboard/proof-inbox-card";
import { CeoActionsTodayCard } from "@/components/dashboard/ceo-actions-today-card";
import { LiveScoreboardCard } from "@/components/dashboard/live-scoreboard-card";
import { MomentumRisksCard } from "@/components/dashboard/momentum-risks-card";
import { OperatingRhythmCard } from "@/components/dashboard/operating-rhythm-card";

export default async function DashboardPage() {
  const user = await getSession();
  if (!user) redirect("/login");

  const [prefs] = await db
    .select()
    .from(userPrefs)
    .where(eq(userPrefs.userId, user.id))
    .limit(1);
  const ceoMode = prefs?.ceoMode ?? false;
  const canEdit = user.role === "CEO" || user.role === "EXEC";
  const showProofInbox = canVerifyProof(user);

  if (ceoMode) {
    const queuedList = await db
      .select({ id: decisions.id })
      .from(decisions)
      .where(eq(decisions.status, "QUEUED"));
    const queuedCount = queuedList.length;

    return (
      <div className="space-y-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="rounded-lg bg-primary/10 border border-primary/20 px-4 py-3">
          <p className="font-semibold text-primary">
            You have {queuedCount} decision{queuedCount !== 1 ? "s" : ""} to clear
          </p>
        </div>
        <section className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
          <DecisionQueueCard />
          <SlippageCard />
        </section>
        <section className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
          {showProofInbox && <ProofInboxCard />}
          <CommitmentsSnapshotCard />
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Operations Command Center</h1>

      <section>
        <CeoActionsTodayCard />
      </section>

      <section>
        <LiveScoreboardCard canEdit={canEdit} />
      </section>

      <section>
        <MomentumRisksCard />
      </section>

      {showProofInbox && (
        <section>
          <ProofInboxCard />
        </section>
      )}

      <section>
        <OperatingRhythmCard />
      </section>
    </div>
  );
}
