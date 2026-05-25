import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { getDocument, getDocumentPreviewUrl } from "@/lib/morning";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  try {
    const [doc, url] = await Promise.all([
      getDocument(params.id),
      getDocumentPreviewUrl(params.id).catch(() => null),
    ]);
    return NextResponse.json({ document: doc, url });
  } catch (err) {
    console.error("[morning/documents/:id] failed:", err);
    return NextResponse.json({ error: "Morning API error" }, { status: 502 });
  }
}
