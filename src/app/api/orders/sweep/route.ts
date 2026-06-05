import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { releaseOrderStock } from "@/lib/orders";

export const dynamic = "force-dynamic";

// How long a pending order holds its stock reservation before the sweep releases it.
const RESERVATION_TTL_MINUTES = Number(process.env.ORDER_RESERVATION_TTL_MINUTES || "60");

/**
 * Releases stock held by abandoned pending orders.
 *
 * Auth: pass `CRON_SECRET` as `Authorization: Bearer <secret>` or `?secret=<secret>`.
 * Trigger via Vercel Cron (recommended every 5–10 min) or any external scheduler.
 */
async function handle(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 500 });
  }
  const auth = req.headers.get("authorization") || "";
  const provided = auth.startsWith("Bearer ")
    ? auth.slice(7)
    : new URL(req.url).searchParams.get("secret") || "";
  if (provided !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cutoff = new Date(Date.now() - RESERVATION_TTL_MINUTES * 60_000);
  const stale = await prisma.order.findMany({
    where: { status: "pending", createdAt: { lt: cutoff } },
    select: { id: true, orderNumber: true },
  });

  const released: string[] = [];
  for (const o of stale) {
    try {
      await releaseOrderStock(o.id);
      released.push(o.orderNumber);
    } catch (err) {
      console.error("[orders/sweep] release failed for", o.orderNumber, err);
    }
  }
  return NextResponse.json({ ok: true, releasedCount: released.length, released });
}

export const GET = handle;
export const POST = handle;
