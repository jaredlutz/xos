import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { commitments, proofs, slippages, activityLog } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";

const bodySchema = z.object({
  commitmentId: z.string().uuid(),
});

export async function POST(request: NextRequest) {
  try {
    await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body", details: parsed.error.flatten() }, { status: 400 });
  }

  const { commitmentId } = parsed.data;
  const [commitment] = await db
    .select()
    .from(commitments)
    .where(eq(commitments.id, commitmentId))
    .limit(1);
  if (!commitment) {
    return NextResponse.json({ error: "Commitment not found" }, { status: 404 });
  }

  const commitmentProofs = await db
    .select()
    .from(proofs)
    .where(eq(proofs.commitmentId, commitmentId));
  const [slippage] = await db
    .select()
    .from(slippages)
    .where(eq(slippages.commitmentId, commitmentId))
    .limit(1);
  const recentActivity = await db
    .select()
    .from(activityLog)
    .where(eq(activityLog.entityId, commitmentId))
    .orderBy(desc(activityLog.createdAt))
    .limit(10);

  const context = [
    `Commitment: ${commitment.title}. Outcome: ${commitment.outcome}. Status: ${commitment.status}. Blast radius: ${commitment.blastRadius}. Priority: ${commitment.priority}.`,
    slippage ? `Slippage reason: ${slippage.reason ?? "Not provided"}. Escalated: ${slippage.escalated}.` : "No slippage.",
    `Proofs: ${commitmentProofs.map((p) => `${p.type} - ${p.label} (${p.status})`).join("; ") || "None"}.`,
    `Recent actions: ${recentActivity.map((a) => a.action).join(", ") || "None"}.`,
  ].join(" ");

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      summary: "AI summary unavailable (OPENAI_API_KEY not set).",
      risks: [],
      nextAction: "Add OPENAI_API_KEY for AI summaries.",
    });
  }

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are an executive assistant. In 2 short sentences summarize status; list 1-3 risks; suggest one next action. Be concise.",
          },
          { role: "user", content: context },
        ],
        max_tokens: 300,
      }),
    });
    const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const content = data.choices?.[0]?.message?.content ?? "Unable to generate summary.";
    const lines = content.split("\n").filter(Boolean);
    const summary = lines[0] ?? content;
    const risks = lines.filter((l) => l.toLowerCase().includes("risk") || l.startsWith("-"));
    const nextAction = lines.find((l) => l.toLowerCase().includes("next") || l.toLowerCase().includes("action")) ?? lines[lines.length - 1] ?? "";

    return NextResponse.json({
      summary,
      risks: risks.length ? risks : [summary],
      nextAction: nextAction || "Review commitment and proofs.",
    });
  } catch (e) {
    console.error("OpenAI summary error:", e);
    return NextResponse.json(
      { error: "AI summary failed" },
      { status: 500 }
    );
  }
}
