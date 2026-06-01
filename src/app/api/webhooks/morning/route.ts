import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDocumentPreviewUrl, verifyWebhookSignature } from "@/lib/morning";
import { sendOrderConfirmationEmail, sendAdminOrderNotificationEmail } from "@/lib/email";
import { getSiteContent } from "@/lib/content";

export const dynamic = "force-dynamic";

/**
 * Morning IPN handler.
 *
 * Confirmed from sandbox logs (user-agent GreenInvoice/2.1): Morning POSTs the
 * payment result as `application/x-www-form-urlencoded` with snake_case fields:
 *   id              — payment-process id
 *   external_data   — echoes the value we passed as `custom` (our Order.id)
 *   document_id     — issued tax document id
 *   number          — document number
 *   type            — document type (e.g. 400)
 *   transaction_id  — payment processor id
 *   url / original_doc_url / copy_doc_url — document links
 * The IPN arrives UNSIGNED (no x-morning-signature header), so HMAC
 * verification is only enforced when a signature header is actually present.
 * A JSON body with camelCase fields is still accepted as a fallback.
 */
type IpnFields = Record<string, string | undefined>;

function parseBody(raw: string, contentType: string | null): IpnFields {
  if (contentType && contentType.includes("application/x-www-form-urlencoded")) {
    return Object.fromEntries(new URLSearchParams(raw));
  }
  try {
    const json = JSON.parse(raw) as Record<string, unknown>;
    if (json && typeof json === "object") {
      const doc = json.document as { id?: string; number?: string; url?: unknown } | undefined;
      if (doc && typeof doc === "object") {
        json.document_id = json.document_id ?? doc.id;
        json.number = json.number ?? doc.number;
        if (typeof doc.url === "string") json.url = json.url ?? doc.url;
      }
      return json as IpnFields;
    }
  } catch {
    /* not JSON — fall through to urlencoded */
  }
  return Object.fromEntries(new URLSearchParams(raw));
}

/** First non-empty value among the given keys. */
function field(p: IpnFields, ...keys: string[]): string | undefined {
  for (const k of keys) {
    const v = p[k];
    if (v !== undefined && v !== null && v !== "") return String(v);
  }
  return undefined;
}

export async function POST(req: Request) {
  const raw = await req.text();
  const signature = req.headers.get("x-morning-signature") || req.headers.get("x-signature");

  // First-time diagnostics: log every header + the raw body. Vercel logs are
  // admin-only — safe through the sandbox phase; gate/remove once confirmed.
  console.log(
    "[morning/webhook] incoming",
    JSON.stringify({ headers: Object.fromEntries(req.headers.entries()), body: raw }),
  );

  // Enforce HMAC only when Morning actually sends a signature header. The
  // payment IPN is currently unsigned, so a configured secret must not block it.
  // NOTE (prod hardening): since this IPN is unsigned, authenticity rests on the
  // echoed external_data (our internal Order.id) being unguessable. Consider
  // re-verifying the document_id against the Morning API before go-live.
  const secret = process.env.MORNING_WEBHOOK_SECRET;
  if (secret && secret !== "..." && signature && !verifyWebhookSignature(raw, signature)) {
    console.warn("[morning/webhook] signature verification failed");
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  const p = parseBody(raw, req.headers.get("content-type"));

  const orderIdEcho = field(p, "external_data", "custom");
  const formId = field(p, "payment_form_id", "form_id", "paymentFormId", "formId");
  const documentId = field(p, "document_id", "documentId") || null;
  const documentNumber = field(p, "number", "document_number", "documentNumber") || null;
  const transactionId = field(p, "transaction_id", "transactionId", "payment_id", "paymentId") || null;
  let documentUrl = field(p, "url", "original_doc_url", "copy_doc_url") || null;
  const docType = Number(field(p, "type")) || 400;

  // Resolve order: the echoed external_data is our Order.id; fall back to formId.
  let order = orderIdEcho
    ? await prisma.order.findUnique({ where: { id: orderIdEcho } })
    : null;
  if (!order && formId) {
    order = await prisma.order.findFirst({ where: { morningPaymentFormId: formId } });
  }
  if (!order) {
    console.warn("[morning/webhook] no matching order; external_data=", orderIdEcho, "formId=", formId);
    // Acknowledge so Morning doesn't retry forever for unknown orders.
    return NextResponse.json({ ok: true, note: "no matching order" });
  }

  // Idempotency: if we've already finalized this order, no-op.
  if (order.status === "confirmed" && order.paidAt) {
    return NextResponse.json({ ok: true, note: "already processed" });
  }

  // Success = Morning issued a tax document for this payment. The IPN carries no
  // explicit status field; a present document_id (and absence of a failure
  // status, if one is ever sent) is the success signal.
  const statusRaw = (field(p, "status") || "").toLowerCase();
  const failed = ["failed", "error", "cancelled", "canceled", "declined", "0"].includes(statusRaw);
  const success = !failed && !!documentId;
  if (!success) {
    // Leave the order `pending` so the customer can retry from /checkout/failed.
    console.info("[morning/webhook] payment not successful for", order.orderNumber, "status=", statusRaw || "(none)");
    return NextResponse.json({ ok: true, note: "not successful — order left pending" });
  }

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
      morningTransactionId: transactionId,
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
          amount: order.total,
          url: documentUrl ?? undefined,
          orderId: order.id,
        },
        create: {
          morningId: documentId,
          type: docType,
          number: documentNumber || "",
          amount: order.total,
          currency: "ILS",
          status: "issued",
          url: documentUrl ?? null,
          issuedAt: new Date(),
          orderId: order.id,
          rawPayload: raw,
        },
      });
    } catch (err) {
      console.warn("[morning/webhook] morningDocument upsert failed:", err);
    }
  }

  // Order emails — fire and forget, errors logged.
  try {
    const content = await getSiteContent();
    await sendOrderConfirmationEmail(updated, {
      pickupAddress: content.shipping_pickup_address,
      pickupHours: content.shipping_pickup_hours,
      shippingEta: content.shipping_post_eta,
    });
    await sendAdminOrderNotificationEmail(updated);
  } catch (err) {
    console.error("[morning/webhook] order emails failed:", err);
  }

  return NextResponse.json({ ok: true });
}
