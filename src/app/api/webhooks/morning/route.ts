import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDocumentPreviewUrl, verifyWebhookSignature } from "@/lib/morning";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { getSiteContent } from "@/lib/content";

export const dynamic = "force-dynamic";

/**
 * Morning IPN handler.
 *
 * The exact payload shape depends on the merchant's Morning plugin setup;
 * we read defensively, accepting whichever of these fields Morning sends:
 *   - id / formId / paymentFormId    → matches Order.morningPaymentFormId
 *   - custom                          → echoes our Order.id
 *   - transactionId / paymentId       → payment processor id
 *   - documentId / document.id        → the issued tax document
 *   - documentNumber / document.number
 *   - status: "success" | "failed" | numeric code
 *   - errorCode / amount
 */
type MorningIpnPayload = {
  id?: string;
  formId?: string;
  paymentFormId?: string;
  custom?: string;
  transactionId?: string;
  paymentId?: string;
  documentId?: string;
  documentNumber?: string;
  document?: { id?: string; number?: string; url?: string | { he?: string; origin?: string } };
  status?: string | number;
  errorCode?: number;
  amount?: number;
};

function pickFormId(p: MorningIpnPayload): string | undefined {
  return p.paymentFormId || p.formId || p.id;
}

function isSuccess(p: MorningIpnPayload): boolean {
  if (typeof p.status === "number") return p.status === 1 || p.status === 200;
  if (typeof p.status === "string") return ["success", "paid", "ok", "1"].includes(p.status.toLowerCase());
  // No status field but errorCode 0 → treat as success.
  return p.errorCode === 0 && !!(p.documentId || p.document?.id);
}

function docUrl(p: MorningIpnPayload): string | undefined {
  const u = p.document?.url;
  if (typeof u === "string") return u;
  if (u && typeof u === "object") return u.he ?? u.origin;
  return undefined;
}

export async function POST(req: Request) {
  const raw = await req.text();
  const signature = req.headers.get("x-morning-signature") || req.headers.get("x-signature");

  // Webhook signature: enforce in prod when secret is configured.
  const secret = process.env.MORNING_WEBHOOK_SECRET;
  if (secret && secret !== "..." && !verifyWebhookSignature(raw, signature)) {
    console.warn("[morning/webhook] signature verification failed");
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  let payload: MorningIpnPayload;
  try {
    payload = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const formId = pickFormId(payload);
  const orderIdEcho = payload.custom;

  // Resolve order: prefer the echoed custom (our Order.id), fall back to formId.
  let order = orderIdEcho
    ? await prisma.order.findUnique({ where: { id: orderIdEcho } })
    : null;
  if (!order && formId) {
    order = await prisma.order.findFirst({ where: { morningPaymentFormId: formId } });
  }
  if (!order) {
    console.warn("[morning/webhook] no matching order; formId=", formId, "custom=", orderIdEcho);
    // Acknowledge so Morning doesn't retry forever for unknown orders.
    return NextResponse.json({ ok: true, note: "no matching order" });
  }

  // Idempotency: if we've already finalized this order, no-op.
  if (order.status === "confirmed" && order.paidAt) {
    return NextResponse.json({ ok: true, note: "already processed" });
  }

  if (!isSuccess(payload)) {
    // Leave the order in `pending` so the customer can retry from /checkout/failed.
    // The reserved stock stays held until the customer succeeds, an admin cancels,
    // or the TTL sweep (/api/orders/sweep) releases it after the reservation window.
    console.info("[morning/webhook] payment not successful for", order.orderNumber);
    return NextResponse.json({ ok: true, note: "not successful — order left pending" });
  }

  const documentId = payload.documentId || payload.document?.id || null;
  const documentNumber = payload.documentNumber || payload.document?.number || null;
  let documentUrl = docUrl(payload) || null;
  if (!documentUrl && documentId) {
    try {
      documentUrl = (await getDocumentPreviewUrl(documentId)) || null;
    } catch (err) {
      console.warn("[morning/webhook] failed to fetch document URL:", err);
    }
  }

  const updated = await prisma.order.update({
    where: { id: order.id },
    data: {
      status: "confirmed",
      paidAt: new Date(),
      morningTransactionId: payload.transactionId || payload.paymentId || null,
      morningDocumentId: documentId,
      morningDocumentNumber: documentNumber,
      morningDocumentUrl: documentUrl,
    },
    include: { items: { include: { product: { select: { name: true, slug: true } } } } },
  });

  if (documentId) {
    try {
      await prisma.morningDocument.upsert({
        where: { morningId: documentId },
        update: {
          number: documentNumber || "",
          amount: payload.amount ?? order.total,
          url: documentUrl ?? undefined,
          orderId: order.id,
        },
        create: {
          morningId: documentId,
          type: 400,
          number: documentNumber || "",
          amount: payload.amount ?? order.total,
          currency: "ILS",
          status: "issued",
          url: documentUrl ?? null,
          issuedAt: new Date(),
          orderId: order.id,
          rawPayload: JSON.stringify(payload),
        },
      });
    } catch (err) {
      console.warn("[morning/webhook] morningDocument upsert failed:", err);
    }
  }

  // Branded confirmation email (Resend) — fire and forget, errors logged.
  try {
    const content = await getSiteContent();
    await sendOrderConfirmationEmail(updated, {
      pickupAddress: content.shipping_pickup_address,
      pickupHours: content.shipping_pickup_hours,
      shippingEta: content.shipping_post_eta,
    });
  } catch (err) {
    console.error("[morning/webhook] confirmation email failed:", err);
  }

  return NextResponse.json({ ok: true });
}
