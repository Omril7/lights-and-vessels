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
