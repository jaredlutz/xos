import { DecisionQueueCard } from "@/components/dashboard/decision-queue-card";
import { SlippageCard } from "@/components/dashboard/slippage-card";
import { CommitmentsSnapshotCard } from "@/components/dashboard/commitments-snapshot-card";
import { ProofInboxCard } from "@/components/dashboard/proof-inbox-card";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <section className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <DecisionQueueCard />
        <SlippageCard />
      </section>
      <section className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <CommitmentsSnapshotCard />
        <ProofInboxCard />
      </section>
    </div>
  );
}
