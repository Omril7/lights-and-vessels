import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { releaseOrderStock } from "@/lib/orders";

export const dynamic = "force-dynamic";

/**
 * Admin action: release a pending order's stock reservation now (don't wait
 * for the TTL sweep). Marks the order `cancelled` and increments stockCount.
 * Idempotent — no-op if the order isn't pending.
 */
export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    select: { id: true, status: true },
  });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (order.status !== "pending") {
    return NextResponse.json(
      { error: "ניתן לשחרר רק הזמנות בסטטוס 'ממתינה'" },
      { status: 409 },
    );
  }

  await releaseOrderStock(order.id);
  return NextResponse.json({ ok: true });
}
