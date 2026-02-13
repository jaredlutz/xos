import "dotenv/config";
import { inArray, eq } from "drizzle-orm";
import { db } from "../src/lib/db";
import {
  users,
  owners,
  systems,
  commitments,
  decisions,
  decisionOptions,
  kpiMetrics,
  signals,
  ceoActions,
  userPrefs,
} from "../src/lib/db/schema";

const CEO_EMAIL = process.env.CEO_EMAIL ?? "ceo@example.com";

const SYSTEM_KEYS = ["investor-portal", "df-crm", "dealxer", "portfolio-tracker", "hiring"] as const;

async function seed() {
  console.log("Seeding...");

  const systemData = [
    { key: "investor-portal", name: "Investor Portal", description: "Investor onboarding and portal" },
    { key: "df-crm", name: "DF CRM", description: "DiversyFund CRM" },
    { key: "dealxer", name: "DealXer", description: "Wholesaling / deals" },
    { key: "portfolio-tracker", name: "Portfolio Tracker", description: "Portfolio tracking" },
    { key: "hiring", name: "Hiring", description: "Hiring and ops" },
  ];
  for (const row of systemData) {
    await db.insert(systems).values(row).onConflictDoNothing({ target: systems.key });
  }
  const systemRows = await db.select().from(systems).where(inArray(systems.key, [...SYSTEM_KEYS]));
  const systemByKey = Object.fromEntries(systemRows.map((s) => [s.key, s]));

  const [ceoUser] = await db
    .insert(users)
    .values({
      email: CEO_EMAIL,
      name: "CEO",
      role: "CEO",
    })
    .onConflictDoUpdate({
      target: users.email,
      set: { role: "CEO", name: "CEO" },
    })
    .returning();

  const [owner1] = await db
    .insert(owners)
    .values({
      displayName: "Jared",
      email: "jared@example.com",
      userId: ceoUser?.id,
    })
    .returning();

  const [owner2] = await db
    .insert(owners)
    .values({
      displayName: "Engineering",
      email: "eng@example.com",
    })
    .returning();

  const now = new Date();
  const pastDue = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const futureDue = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const invPortal = systemByKey["investor-portal"];
  const dfCrm = systemByKey["df-crm"];

  if (invPortal && owner1) {
    await db.insert(commitments).values([
      {
        systemId: invPortal.id,
        externalRef: "seed-1",
        title: "Reduce onboarding steps",
        outcome: "Investor Portal onboarding reduced from 7 steps to 3 steps",
        ownerId: owner1.id,
        dueDate: pastDue,
        status: "ACTIVE",
        blastRadius: "HIGH",
        priority: "P0",
      },
      {
        systemId: invPortal.id,
        externalRef: "seed-2",
        title: "Uptime SLA",
        outcome: "99.9% uptime for portal in Q1",
        ownerId: owner1.id,
        dueDate: futureDue,
        status: "ACTIVE",
        blastRadius: "HIGH",
        priority: "P1",
      },
    ]).onConflictDoNothing({ target: [commitments.systemId, commitments.externalRef] });
  }

  if (dfCrm && owner2) {
    await db.insert(commitments).values({
      systemId: dfCrm.id,
      externalRef: "seed-3",
      title: "Reply rate dashboard",
      outcome: "CRM reply rate dashboard live for sales team",
      ownerId: owner2.id,
      dueDate: futureDue,
      status: "ACTIVE",
      blastRadius: "MEDIUM",
      priority: "P1",
    }).onConflictDoNothing({ target: [commitments.systemId, commitments.externalRef] });
  }

  let decision1 = await db
    .select()
    .from(decisions)
    .where(eq(decisions.title, "Greenlight SMS campaign?"))
    .limit(1)
    .then((r) => r[0]);

  if (!decision1) {
    const [inserted] = await db
      .insert(decisions)
      .values({
        title: "Greenlight SMS campaign?",
        context: "SMS investor campaign is ready. Portal fix is 3 days out. Risk of waiting: lost momentum. Risk of launching: support load spike.",
        status: "QUEUED",
        consequenceIfNoDecision: "Campaign delayed; pipeline impact.",
        maxOptions: 3,
        createdBy: ceoUser?.id,
      })
      .returning();
    decision1 = inserted ?? undefined;
    if (decision1) {
      await db.insert(decisionOptions).values([
        { decisionId: decision1.id, label: "Launch now with guardrails", impact: "MEDIUM" },
        { decisionId: decision1.id, label: "Delay 7 days", impact: "LOW" },
        { decisionId: decision1.id, label: "Soft launch to segment", impact: "MEDIUM" },
      ]);
    }
  }

  const [overdueCommitment] = await db
    .select()
    .from(commitments)
    .where(eq(commitments.externalRef, "seed-1"))
    .limit(1);

  const kpiRows = [
    { kpiKey: "capital.pipeline_usd", label: "Pipeline (7d)", valueNum: "1250000", deltaNum: "120000", period: "7d" },
    { kpiKey: "capital.committed_usd", label: "Committed (7d)", valueNum: "480000", deltaNum: "50000", period: "7d" },
    { kpiKey: "marketing.forms_today", label: "Forms today", valueNum: "42", deltaNum: "5", period: "today" },
    { kpiKey: "marketing.cpl_usd", label: "CPL (7d)", valueNum: "28", deltaNum: "-2", period: "7d" },
    { kpiKey: "sales.conversations_7d", label: "Conversations (7d)", valueNum: "312", deltaNum: "18", period: "7d" },
    { kpiKey: "sales.booked_calls_7d", label: "Booked calls (7d)", valueNum: "89", deltaNum: "12", period: "7d" },
    { kpiKey: "platform.p0_incidents_7d", label: "P0 incidents (7d)", valueNum: "0", deltaNum: "0", period: "7d" },
    { kpiKey: "platform.deploy_status", label: "Deploy status", valueText: "Healthy", period: "today" },
  ];
  for (const row of kpiRows) {
    await db.insert(kpiMetrics).values(row).onConflictDoUpdate({
      target: kpiMetrics.kpiKey,
      set: { label: row.label, valueNum: row.valueNum, valueText: row.valueText, deltaNum: row.deltaNum, period: row.period, updatedAt: new Date() },
    });
  }

  await db.delete(signals);
  await db.delete(ceoActions);
  await db.insert(signals).values([
    {
      signalType: "PIPELINE_RISK",
      title: "SMS campaign awaiting CEO decision",
      description: "Greenlight SMS investor campaign is blocked. Delaying impacts pipeline momentum.",
      severity: "HIGH",
      status: "OPEN",
      relatedDecisionId: decision1?.id ?? null,
    },
    {
      signalType: "MOMENTUM_RISK",
      title: "Onboarding reduction slipped",
      description: "Commitment to reduce onboarding steps is past due. Reason required.",
      severity: "MEDIUM",
      status: "OPEN",
      relatedCommitmentId: overdueCommitment?.id ?? null,
    },
    {
      signalType: "SYSTEM_RISK",
      title: "Portal uptime target at risk",
      description: "No P0 incidents this week but deploy pipeline has one failing check.",
      severity: "LOW",
      status: "OPEN",
    },
  ]);

  if (decision1 && owner1) {
    await db.insert(ceoActions).values([
      {
        title: "Decide: Greenlight SMS campaign",
        whyItMatters: "Campaign is ready; waiting on your call affects pipeline and support planning.",
        impactLabel: "+$320K pipeline if launched with guardrails",
        dueBy: new Date(now.getTime() + 24 * 60 * 60 * 1000),
        ownerId: owner1.id,
        relatedDecisionId: decision1.id,
        status: "OPEN",
        actionButtons: [
          { label: "View decision", actionType: "openDecision", payload: decision1.id },
        ],
      },
      {
        title: "Add slippage reason: onboarding steps",
        whyItMatters: "Past-due commitment needs a reason to unblock the team.",
        impactLabel: "Unblocks commitment tracking",
        ownerId: owner1.id,
        relatedCommitmentId: overdueCommitment?.id ?? null,
        status: "OPEN",
        actionButtons: overdueCommitment
          ? [{ label: "Add reason", actionType: "openCommitment", payload: overdueCommitment.id }]
          : [],
      },
      {
        title: "Review sales metrics",
        whyItMatters: "Booked calls up 12; confirm capacity for follow-up.",
        impactLabel: "Sustain conversion rate",
        status: "OPEN",
      },
    ]);
  }

  if (ceoUser) {
    await db.insert(userPrefs).values({
      userId: ceoUser.id,
      ceoMode: false,
      updatedAt: new Date(),
    }).onConflictDoUpdate({
      target: userPrefs.userId,
      set: { ceoMode: false, updatedAt: new Date() },
    });
  }

  console.log("Seed complete.");
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
