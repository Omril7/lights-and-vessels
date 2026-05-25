import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { getIncomeReport } from "@/lib/morning";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(req.url);
  const today = new Date();
  const defaultFrom = new Date(today.getFullYear(), today.getMonth() - 11, 1);
  const fromIso = (d: Date) => d.toISOString().slice(0, 10);

  const from = searchParams.get("from") || fromIso(defaultFrom);
  const to = searchParams.get("to") || fromIso(today);

  try {
    const data = await getIncomeReport({ from, to });
    return NextResponse.json({ from, to, ...data });
  } catch (err) {
    console.error("[morning/reports] failed:", err);
    return NextResponse.json({ error: "Morning API error" }, { status: 502 });
  }
}
