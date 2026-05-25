import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { listDocuments } from "@/lib/morning";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(req.url);
  const typeRaw = searchParams.get("type");
  const type = typeRaw && typeRaw !== "all" ? Number(typeRaw) : undefined;
  const from = searchParams.get("from") || undefined;
  const to = searchParams.get("to") || undefined;
  const search = searchParams.get("search") || undefined;
  const page = Number(searchParams.get("page") || "1") || 1;

  try {
    const data = await listDocuments({ type, from, to, search, page, pageSize: 25 });
    return NextResponse.json(data);
  } catch (err) {
    console.error("[morning/documents] failed:", err);
    return NextResponse.json({ error: "Morning API error" }, { status: 502 });
  }
}
