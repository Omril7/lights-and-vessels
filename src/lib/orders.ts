import { prisma } from "@/lib/prisma";

export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "ממתינה",
  confirmed: "אושרה",
  shipped: "נשלחה",
  delivered: "נמסרה",
  cancelled: "בוטלה",
  refunded: "הוחזרה",
};

export const STATUS_TONES: Record<
  OrderStatus,
  "neutral" | "accent" | "sale" | "soldout"
> = {
  pending: "accent",
  confirmed: "neutral",
  shipped: "neutral",
  delivered: "neutral",
  cancelled: "sale",
  refunded: "sale",
};

/**
 * Release stock reserved by a pending order and mark it `cancelled`.
 * Idempotent: only runs when status === "pending". Safe to call from the
 * webhook non-success branch and from the TTL sweep.
 */
export async function releaseOrderStock(orderId: string) {
  await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
    if (!order || order.status !== "pending") return;
    for (const item of order.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stockCount: { increment: item.quantity } },
      });
    }
    await tx.order.update({
      where: { id: orderId },
      data: { status: "cancelled" },
    });
  });
}
