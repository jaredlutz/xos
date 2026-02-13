import { NextRequest, NextResponse } from "next/server";
import { detectSlippage } from "@/lib/slippage/detect";

export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const header =
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ??
    request.headers.get("x-cron-secret");

  if (!secret || header !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await detectSlippage();
  return NextResponse.json({ ok: true });
}
