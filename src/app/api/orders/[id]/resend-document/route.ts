import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { resendDocumentByEmail } from "@/lib/morning";

export const dynamic = "force-dynamic";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const order = await prisma.order.findUnique({ where: { id: params.id } });
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  if (!order.morningDocumentId) {
    return NextResponse.json({ error: "אין מסמך לשליחה מחדש" }, { status: 409 });
  }

  try {
    await resendDocumentByEmail(order.morningDocumentId, order.customerEmail);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[orders/resend-document] failed:", err);
    return NextResponse.json({ error: "תקלה בשליחת המסמך" }, { status: 502 });
  }
}
