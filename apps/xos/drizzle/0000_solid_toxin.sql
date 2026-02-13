CREATE TYPE "public"."activity_entity_type" AS ENUM('COMMITMENT', 'PROOF', 'SLIPPAGE', 'DECISION');--> statement-breakpoint
CREATE TYPE "public"."blast_radius" AS ENUM('LOW', 'MEDIUM', 'HIGH');--> statement-breakpoint
CREATE TYPE "public"."ceo_action_status" AS ENUM('OPEN', 'DONE');--> statement-breakpoint
CREATE TYPE "public"."commitment_status" AS ENUM('ACTIVE', 'DONE', 'CANCELED');--> statement-breakpoint
CREATE TYPE "public"."decision_impact" AS ENUM('LOW', 'MEDIUM', 'HIGH');--> statement-breakpoint
CREATE TYPE "public"."decision_status" AS ENUM('QUEUED', 'DECIDED', 'ARCHIVED');--> statement-breakpoint
CREATE TYPE "public"."priority" AS ENUM('P0', 'P1', 'P2', 'P3');--> statement-breakpoint
CREATE TYPE "public"."proof_status" AS ENUM('SUBMITTED', 'VERIFIED', 'REJECTED');--> statement-breakpoint
CREATE TYPE "public"."proof_type" AS ENUM('URL', 'METRIC', 'DEMO', 'SCREENSHOT', 'DOC');--> statement-breakpoint
CREATE TYPE "public"."signal_severity" AS ENUM('LOW', 'MEDIUM', 'HIGH');--> statement-breakpoint
CREATE TYPE "public"."signal_status" AS ENUM('OPEN', 'ACKED', 'RESOLVED');--> statement-breakpoint
CREATE TYPE "public"."signal_type" AS ENUM('MONEY_STUCK', 'MOMENTUM_RISK', 'COMPLIANCE_RISK', 'SYSTEM_RISK', 'PIPELINE_RISK');--> statement-breakpoint
CREATE TYPE "public"."slippage_severity" AS ENUM('LOW', 'MEDIUM', 'HIGH');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('CEO', 'EXEC', 'OWNER', 'VIEWER');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "activity_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_user_id" uuid,
	"entity_type" "activity_entity_type" NOT NULL,
	"entity_id" uuid NOT NULL,
	"action" text NOT NULL,
	"meta" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ceo_actions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"why_it_matters" text,
	"impact_label" text,
	"due_by" timestamp with time zone,
	"owner_id" uuid,
	"related_decision_id" uuid,
	"related_commitment_id" uuid,
	"action_buttons" jsonb,
	"status" "ceo_action_status" DEFAULT 'OPEN' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "commitments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"system_id" uuid NOT NULL,
	"external_ref" text,
	"title" text NOT NULL,
	"outcome" text NOT NULL,
	"owner_id" uuid NOT NULL,
	"due_date" timestamp with time zone NOT NULL,
	"status" "commitment_status" DEFAULT 'ACTIVE' NOT NULL,
	"blast_radius" "blast_radius" DEFAULT 'MEDIUM' NOT NULL,
	"priority" "priority" DEFAULT 'P2' NOT NULL,
	"slip_count" integer DEFAULT 0 NOT NULL,
	"last_status_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "decision_options" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"decision_id" uuid NOT NULL,
	"label" text NOT NULL,
	"description" text,
	"pros" text,
	"cons" text,
	"impact" "decision_impact" DEFAULT 'MEDIUM' NOT NULL,
	"selected" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "decisions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"context" text NOT NULL,
	"commitment_id" uuid,
	"status" "decision_status" DEFAULT 'QUEUED' NOT NULL,
	"consequence_if_no_decision" text NOT NULL,
	"max_options" integer DEFAULT 3 NOT NULL,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "kpi_metrics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kpi_key" text NOT NULL,
	"label" text,
	"value_num" numeric,
	"value_text" text,
	"delta_num" numeric,
	"period" text,
	"system_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "kpi_metrics_kpi_key_unique" UNIQUE("kpi_key")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "owners" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"display_name" text NOT NULL,
	"slack_handle" text,
	"email" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "proofs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"commitment_id" uuid NOT NULL,
	"type" "proof_type" NOT NULL,
	"label" text NOT NULL,
	"url" text,
	"metric_key" text,
	"metric_value" text,
	"metric_delta" text,
	"notes" text,
	"status" "proof_status" DEFAULT 'SUBMITTED' NOT NULL,
	"submitted_by" uuid,
	"verified_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"verified_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "signals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"signal_type" "signal_type" NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"severity" "signal_severity" NOT NULL,
	"related_commitment_id" uuid,
	"related_decision_id" uuid,
	"related_system_id" uuid,
	"status" "signal_status" DEFAULT 'OPEN' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "slippages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"commitment_id" uuid NOT NULL,
	"first_slipped_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_slipped_at" timestamp with time zone DEFAULT now() NOT NULL,
	"reason" text,
	"severity" "slippage_severity" DEFAULT 'MEDIUM' NOT NULL,
	"escalated" boolean DEFAULT false NOT NULL,
	"escalated_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "slippages_commitment_id_unique" UNIQUE("commitment_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "systems" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"webhook_signing_secret_hash" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "systems_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "teams" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_prefs" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"ceo_mode" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"role" "user_role" DEFAULT 'VIEWER' NOT NULL,
	"workos_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_workos_id_unique" UNIQUE("workos_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "activity_log" ADD CONSTRAINT "activity_log_actor_user_id_users_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ceo_actions" ADD CONSTRAINT "ceo_actions_owner_id_owners_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."owners"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ceo_actions" ADD CONSTRAINT "ceo_actions_related_decision_id_decisions_id_fk" FOREIGN KEY ("related_decision_id") REFERENCES "public"."decisions"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ceo_actions" ADD CONSTRAINT "ceo_actions_related_commitment_id_commitments_id_fk" FOREIGN KEY ("related_commitment_id") REFERENCES "public"."commitments"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "commitments" ADD CONSTRAINT "commitments_system_id_systems_id_fk" FOREIGN KEY ("system_id") REFERENCES "public"."systems"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "commitments" ADD CONSTRAINT "commitments_owner_id_owners_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."owners"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "decision_options" ADD CONSTRAINT "decision_options_decision_id_decisions_id_fk" FOREIGN KEY ("decision_id") REFERENCES "public"."decisions"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "decisions" ADD CONSTRAINT "decisions_commitment_id_commitments_id_fk" FOREIGN KEY ("commitment_id") REFERENCES "public"."commitments"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "decisions" ADD CONSTRAINT "decisions_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "kpi_metrics" ADD CONSTRAINT "kpi_metrics_system_id_systems_id_fk" FOREIGN KEY ("system_id") REFERENCES "public"."systems"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "owners" ADD CONSTRAINT "owners_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "proofs" ADD CONSTRAINT "proofs_commitment_id_commitments_id_fk" FOREIGN KEY ("commitment_id") REFERENCES "public"."commitments"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "proofs" ADD CONSTRAINT "proofs_submitted_by_users_id_fk" FOREIGN KEY ("submitted_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "proofs" ADD CONSTRAINT "proofs_verified_by_users_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "signals" ADD CONSTRAINT "signals_related_commitment_id_commitments_id_fk" FOREIGN KEY ("related_commitment_id") REFERENCES "public"."commitments"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "signals" ADD CONSTRAINT "signals_related_decision_id_decisions_id_fk" FOREIGN KEY ("related_decision_id") REFERENCES "public"."decisions"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "signals" ADD CONSTRAINT "signals_related_system_id_systems_id_fk" FOREIGN KEY ("related_system_id") REFERENCES "public"."systems"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "slippages" ADD CONSTRAINT "slippages_commitment_id_commitments_id_fk" FOREIGN KEY ("commitment_id") REFERENCES "public"."commitments"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_prefs" ADD CONSTRAINT "user_prefs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "commitments_system_external_ref" ON "commitments" USING btree ("system_id","external_ref");