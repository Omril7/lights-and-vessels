import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createPaymentForm, VAT_TYPE_EXEMPT } from "@/lib/morning";

export const dynamic = "force-dynamic";

const schema = z.object({ orderId: z.string().min(1) });

export async function POST(req: Request) {
  let parsed;
  try {
    parsed = schema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const order = await prisma.order.findUnique({
    where: { id: parsed.orderId },
    include: { items: { include: { product: true } } },
  });
  if (!order) return NextResponse.json({ error: "הזמנה לא נמצאה" }, { status: 404 });
  if (order.status !== "pending") {
    return NextResponse.json({ error: "ההזמנה כבר טופלה" }, { status: 409 });
  }

  const origin = process.env.NEXTAUTH_URL || new URL(req.url).origin;
  const income = order.items.map((i) => ({
    description: i.product.name_he,
    quantity: i.quantity,
    price: i.price,
    vatType: VAT_TYPE_EXEMPT,
    itemId: i.productId,
  }));
  if (order.shippingCost > 0) {
    income.push({
      description: "משלוח דואר ישראל",
      quantity: 1,
      price: order.shippingCost,
      vatType: VAT_TYPE_EXEMPT,
      itemId: "shipping",
    });
  }

  let address: string | undefined;
  try {
    const a = JSON.parse(order.shippingAddress || "{}") as { street?: string; city?: string; zip?: string };
    if (a.street) address = [a.street, a.city, a.zip].filter(Boolean).join(", ");
  } catch {}

  try {
    const form = await createPaymentForm({
      description: `הזמנה ${order.orderNumber}`,
      income,
      client: {
        name: order.customerName,
        emails: [order.customerEmail],
        phone: order.phone ?? undefined,
        address,
        country: "IL",
      },
      successUrl: `${origin}/checkout/success?orderId=${order.id}`,
      failureUrl: `${origin}/checkout/failed?orderId=${order.id}`,
      notifyUrl: `${origin}/api/webhooks/morning`,
      custom: order.id,
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { morningPaymentFormId: form.id, morningPaymentFormUrl: form.url },
    });

    return NextResponse.json({ redirectUrl: form.url });
  } catch (err) {
    console.error("[checkout/retry] failed:", err);
    return NextResponse.json({ error: "תקלה בחיבור לסליקה" }, { status: 502 });
  }
}
