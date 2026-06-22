import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { createCreditNote, DOC_TYPE, VAT_TYPE_EXEMPT } from "@/lib/morning";

export const dynamic = "force-dynamic";

const schema = z.object({
  amount: z.number().positive().optional(), // omit = full refund
  reason: z.string().trim().max(500).optional(),
});

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  let body;
  try {
    body = schema.parse(await req.json().catch(() => ({})));
  } catch (err) {
    return NextResponse.json({ error: "Invalid payload", details: (err as Error).message }, { status: 400 });
  }

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { items: { include: { product: true } } },
  });
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  if (!order.morningDocumentId) {
    return NextResponse.json({ error: "אין מסמך מקור לזיכוי" }, { status: 409 });
  }
  if (order.status === "refunded") {
    return NextResponse.json({ error: "ההזמנה כבר הוחזרה במלואה" }, { status: 409 });
  }

  const amount = body.amount ?? order.total;
  if (amount > order.total + 0.01) {
    return NextResponse.json({ error: "סכום ההחזר גבוה מסכום ההזמנה" }, { status: 400 });
  }
  const isFull = Math.abs(amount - order.total) < 0.01;

  // Build credit-note income lines.
  // Full refund → mirror all items + shipping.
  // Partial refund → single summary line.
  const income = isFull
    ? [
        ...order.items.map((i) => ({
          description: i.product.name_he,
          quantity: i.quantity,
          price: i.price,
          vatType: VAT_TYPE_EXEMPT,
        })),
        ...(order.shippingCost > 0
          ? [{ description: "משלוח דואר ישראל", quantity: 1, price: order.shippingCost, vatType: VAT_TYPE_EXEMPT }]
          : []),
      ]
    : [
        {
          description: `החזר חלקי — ${order.orderNumber}${body.reason ? ` (${body.reason})` : ""}`,
          quantity: 1,
          price: amount,
          vatType: VAT_TYPE_EXEMPT,
        },
      ];

  try {
    const creditNote = await createCreditNote({
      originalDocumentId: order.morningDocumentId,
      amount,
      description: `החזר עבור הזמנה ${order.orderNumber}`,
      client: {
        name: order.customerName,
        emails: [order.customerEmail],
        phone: order.phone ?? undefined,
        country: "IL",
      },
      income,
      sendByEmail: true,
    });

    await prisma.morningDocument.create({
      data: {
        morningId: creditNote.id,
        type: DOC_TYPE.CREDIT_NOTE,
        number: creditNote.number || "",
        amount: -amount,
        currency: "ILS",
        status: "issued",
        url: typeof creditNote.url === "string" ? creditNote.url : creditNote.url?.he ?? null,
        issuedAt: new Date(),
        orderId: order.id,
        rawPayload: JSON.stringify(creditNote),
      },
    });

    if (isFull) {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: "refunded" },
      });
    }

    return NextResponse.json({ ok: true, full: isFull, creditNoteId: creditNote.id });
  } catch (err) {
    console.error("[orders/refund] failed:", err);
    return NextResponse.json({ error: "תקלה בהנפקת זיכוי" }, { status: 502 });
  }
}
