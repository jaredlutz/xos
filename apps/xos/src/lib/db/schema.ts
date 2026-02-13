import {
  pgTable,
  uuid,
  text,
  timestamp,
  date,
  integer,
  boolean,
  jsonb,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { pgEnum } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["CEO", "EXEC", "OWNER", "VIEWER"]);
export const commitmentStatusEnum = pgEnum("commitment_status", [
  "ACTIVE",
  "DONE",
  "CANCELED",
]);
export const blastRadiusEnum = pgEnum("blast_radius", ["LOW", "MEDIUM", "HIGH"]);
export const priorityEnum = pgEnum("priority", ["P0", "P1", "P2", "P3"]);
export const proofTypeEnum = pgEnum("proof_type", [
  "URL",
  "METRIC",
  "DEMO",
  "SCREENSHOT",
  "DOC",
]);
export const proofStatusEnum = pgEnum("proof_status", [
  "SUBMITTED",
  "VERIFIED",
  "REJECTED",
]);
export const slippageSeverityEnum = pgEnum("slippage_severity", [
  "LOW",
  "MEDIUM",
  "HIGH",
]);
export const decisionStatusEnum = pgEnum("decision_status", [
  "QUEUED",
  "DECIDED",
  "ARCHIVED",
]);
export const decisionImpactEnum = pgEnum("decision_impact", [
  "LOW",
  "MEDIUM",
  "HIGH",
]);
export const activityEntityTypeEnum = pgEnum("activity_entity_type", [
  "COMMITMENT",
  "PROOF",
  "SLIPPAGE",
  "DECISION",
]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name"),
  role: userRoleEnum("role").notNull().default("VIEWER"),
  workosId: text("workos_id").unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const teams = pgTable("teams", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
});

export const owners = pgTable("owners", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id),
  displayName: text("display_name").notNull(),
  slackHandle: text("slack_handle"),
  email: text("email"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const systems = pgTable("systems", {
  id: uuid("id").primaryKey().defaultRandom(),
  key: text("key").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  webhookSigningSecretHash: text("webhook_signing_secret_hash"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const commitments = pgTable(
  "commitments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    systemId: uuid("system_id")
      .references(() => systems.id, { onDelete: "cascade" })
      .notNull(),
    externalRef: text("external_ref"),
    title: text("title").notNull(),
    outcome: text("outcome").notNull(),
    ownerId: uuid("owner_id")
      .references(() => owners.id, { onDelete: "set null" })
      .notNull(),
    dueDate: timestamp("due_date", { withTimezone: true }).notNull(),
    status: commitmentStatusEnum("status").notNull().default("ACTIVE"),
    blastRadius: blastRadiusEnum("blast_radius").notNull().default("MEDIUM"),
    priority: priorityEnum("priority").notNull().default("P2"),
    slipCount: integer("slip_count").notNull().default(0),
    lastStatusAt: timestamp("last_status_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("commitments_system_external_ref").on(t.systemId, t.externalRef),
  ]
);

export const proofs = pgTable("proofs", {
  id: uuid("id").primaryKey().defaultRandom(),
  commitmentId: uuid("commitment_id")
    .references(() => commitments.id, { onDelete: "cascade" })
    .notNull(),
  type: proofTypeEnum("type").notNull(),
  label: text("label").notNull(),
  url: text("url"),
  metricKey: text("metric_key"),
  metricValue: text("metric_value"),
  metricDelta: text("metric_delta"),
  notes: text("notes"),
  status: proofStatusEnum("status").notNull().default("SUBMITTED"),
  submittedBy: uuid("submitted_by").references(() => users.id),
  verifiedBy: uuid("verified_by").references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  verifiedAt: timestamp("verified_at", { withTimezone: true }),
});

export const slippages = pgTable("slippages", {
  id: uuid("id").primaryKey().defaultRandom(),
  commitmentId: uuid("commitment_id")
    .references(() => commitments.id, { onDelete: "cascade" })
    .notNull()
    .unique(),
  firstSlippedAt: timestamp("first_slipped_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  lastSlippedAt: timestamp("last_slipped_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  reason: text("reason"),
  severity: slippageSeverityEnum("severity").notNull().default("MEDIUM"),
  escalated: boolean("escalated").notNull().default(false),
  escalatedAt: timestamp("escalated_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const decisions = pgTable("decisions", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  context: text("context").notNull(),
  commitmentId: uuid("commitment_id").references(() => commitments.id, {
    onDelete: "set null",
  }),
  status: decisionStatusEnum("status").notNull().default("QUEUED"),
  consequenceIfNoDecision: text("consequence_if_no_decision").notNull(),
  maxOptions: integer("max_options").notNull().default(3),
  createdBy: uuid("created_by").references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const decisionOptions = pgTable("decision_options", {
  id: uuid("id").primaryKey().defaultRandom(),
  decisionId: uuid("decision_id")
    .references(() => decisions.id, { onDelete: "cascade" })
    .notNull(),
  label: text("label").notNull(),
  description: text("description"),
  pros: text("pros"),
  cons: text("cons"),
  impact: decisionImpactEnum("impact").notNull().default("MEDIUM"),
  selected: boolean("selected").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const activityLog = pgTable("activity_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  actorUserId: uuid("actor_user_id").references(() => users.id),
  entityType: activityEntityTypeEnum("entity_type").notNull(),
  entityId: uuid("entity_id").notNull(),
  action: text("action").notNull(),
  meta: jsonb("meta"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Team = typeof teams.$inferSelect;
export type Owner = typeof owners.$inferSelect;
export type System = typeof systems.$inferSelect;
export type Commitment = typeof commitments.$inferSelect;
export type Proof = typeof proofs.$inferSelect;
export type Slippage = typeof slippages.$inferSelect;
export type Decision = typeof decisions.$inferSelect;
export type DecisionOption = typeof decisionOptions.$inferSelect;
export type ActivityLog = typeof activityLog.$inferSelect;
