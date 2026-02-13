import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { userPrefs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

export async function GET() {
  let user;
  try {
    user = await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [prefs] = await db
    .select()
    .from(userPrefs)
    .where(eq(userPrefs.userId, user.id))
    .limit(1);

  return NextResponse.json({
    ceo_mode: prefs?.ceoMode ?? false,
  });
}

const patchSchema = z.object({
  ceo_mode: z.boolean(),
});

export async function PATCH(request: NextRequest) {
  let user;
  try {
    user = await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid body", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  await db
    .insert(userPrefs)
    .values({
      userId: user.id,
      ceoMode: parsed.data.ceo_mode,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: userPrefs.userId,
      set: {
        ceoMode: parsed.data.ceo_mode,
        updatedAt: new Date(),
      },
    });

  return NextResponse.json({ ceo_mode: parsed.data.ceo_mode });
}
