import "dotenv/config";
import { inArray } from "drizzle-orm";
import { db } from "../src/lib/db";
import {
  users,
  owners,
  systems,
  commitments,
  decisions,
  decisionOptions,
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
    ]);
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
    });
  }

  const [decision1] = await db
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

  if (decision1) {
    await db.insert(decisionOptions).values([
      { decisionId: decision1.id, label: "Launch now with guardrails", impact: "MEDIUM" },
      { decisionId: decision1.id, label: "Delay 7 days", impact: "LOW" },
      { decisionId: decision1.id, label: "Soft launch to segment", impact: "MEDIUM" },
    ]);
  }

  console.log("Seed complete.");
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
