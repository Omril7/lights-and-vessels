import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createPaymentForm, VAT_TYPE_EXEMPT } from "@/lib/morning";
import { getSiteContent } from "@/lib/content";
import { releaseOrderStock } from "@/lib/orders";

export const dynamic = "force-dynamic";

const schema = z.object({
  items: z
    .array(z.object({ productId: z.string().min(1), quantity: z.number().int().min(1).max(99) }))
    .min(1),
  customer: z.object({
    name: z.string().trim().min(1).max(120),
    email: z.string().trim().email().max(200),
    phone: z.string().trim().min(5).max(40),
  }),
  shippingMethod: z.enum(["post", "pickup"]),
  shippingAddress: z
    .object({
      street: z.string().trim().min(1).max(160),
      city: z.string().trim().min(1).max(80),
      zip: z.string().trim().max(20).optional().default(""),
    })
    .nullable(),
});

function originFromRequest(req: Request): string {
  return process.env.NEXTAUTH_URL || new URL(req.url).origin;
}

async function nextOrderNumber(): Promise<string> {
  const count = await prisma.order.count();
  return `ORD-${(1000 + count + 1).toString()}`;
}

export async function POST(req: Request) {
  let parsed;
  try {
    parsed = schema.parse(await req.json());
  } catch (err) {
    return NextResponse.json({ error: "Invalid payload", details: (err as Error).message }, { status: 400 });
  }

  if (parsed.shippingMethod === "post" && !parsed.shippingAddress) {
    return NextResponse.json({ error: "Shipping address required for post" }, { status: 400 });
  }

  // Load products from DB — never trust client-side prices.
  const products = await prisma.product.findMany({
    where: { id: { in: parsed.items.map((i) => i.productId) }, published: true },
  });
  if (products.length !== parsed.items.length) {
    return NextResponse.json({ error: "אחד הפריטים לא זמין יותר" }, { status: 400 });
  }

  // Shipping cost from SiteContent
  const content = await getSiteContent();
  const postPrice = Number(content.shipping_post_price || "30") || 30;
  const freeOver = Number(content.shipping_free_over || "") || 0;

  const subtotal = parsed.items.reduce((sum, item) => {
    const p = products.find((p) => p.id === item.productId)!;
    return sum + p.price * item.quantity;
  }, 0);

  const shippingCost =
    parsed.shippingMethod === "pickup"
      ? 0
      : freeOver > 0 && subtotal >= freeOver
      ? 0
      : postPrice;
  const total = subtotal + shippingCost;

  const orderNumber = await nextOrderNumber();

  // Atomically reserve stock + create the pending order. Each updateMany only
  // succeeds when stockCount >= quantity, so concurrent checkouts can't oversell.
  let order;
  try {
    order = await prisma.$transaction(async (tx) => {
      for (const item of parsed.items) {
        const res = await tx.product.updateMany({
          where: {
            id: item.productId,
            published: true,
            inStock: true,
            stockCount: { gte: item.quantity },
          },
          data: { stockCount: { decrement: item.quantity } },
        });
        if (res.count !== 1) {
          throw new Error(`OUT_OF_STOCK:${item.productId}`);
        }
      }
      return tx.order.create({
        data: {
          orderNumber,
          status: "pending",
          customerName: parsed.customer.name,
          customerEmail: parsed.customer.email,
          phone: parsed.customer.phone,
          shippingMethod: parsed.shippingMethod,
          shippingAddress: JSON.stringify(parsed.shippingAddress ?? {}),
          subtotal,
          shippingCost,
          total,
          items: {
            create: parsed.items.map((item) => {
              const p = products.find((p) => p.id === item.productId)!;
              return { productId: p.id, quantity: item.quantity, price: p.price };
            }),
          },
        },
      });
    });
  } catch (err) {
    const msg = (err as Error).message;
    if (msg.startsWith("OUT_OF_STOCK:")) {
      const id = msg.split(":")[1];
      const p = products.find((p) => p.id === id);
      return NextResponse.json({ error: `אזל מהמלאי: ${p?.name_he ?? ""}` }, { status: 409 });
    }
    throw err;
  }

  // Build Morning payment-form payload
  const origin = originFromRequest(req);
  const income = parsed.items.map((item) => {
    const p = products.find((p) => p.id === item.productId)!;
    return {
      description: p.name_he,
      quantity: item.quantity,
      price: p.price,
      vatType: VAT_TYPE_EXEMPT,
      itemId: p.id,
    };
  });
  if (shippingCost > 0) {
    income.push({
      description: "משלוח דואר ישראל",
      quantity: 1,
      price: shippingCost,
      vatType: VAT_TYPE_EXEMPT,
      itemId: "shipping",
    });
  }

  const addr = parsed.shippingAddress;
  try {
    const form = await createPaymentForm({
      description: `הזמנה ${order.orderNumber}`,
      income,
      client: {
        name: parsed.customer.name,
        emails: [parsed.customer.email],
        phone: parsed.customer.phone,
        address: addr ? `${addr.street}, ${addr.city}${addr.zip ? ", " + addr.zip : ""}` : undefined,
        country: "IL",
      },
      successUrl: `${origin}/checkout/success?orderId=${order.id}`,
      failureUrl: `${origin}/checkout/failed?orderId=${order.id}`,
      notifyUrl: `${origin}/api/webhooks/morning`,
      custom: order.id,
    });

    await prisma.order.update({
      where: { id: order.id },
      data: {
        morningPaymentFormId: form.id,
        morningPaymentFormUrl: form.url,
      },
    });

    return NextResponse.json({ orderId: order.id, redirectUrl: form.url });
  } catch (err) {
    console.error("[checkout] Morning createPaymentForm failed:", err);
    // Release the stock we reserved and cancel the order so it doesn't sit
    // pending and consume inventory until the TTL sweep runs.
    try {
      await releaseOrderStock(order.id);
    } catch (restoreErr) {
      console.error("[checkout] stock restore failed:", restoreErr);
    }
    return NextResponse.json(
      { error: "תקלה בחיבור לסליקה. נסה שוב בעוד רגע." },
      { status: 502 },
    );
  }
}
