import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSiteContent } from "@/lib/content";
import { formatPrice } from "@/lib/utils";
import { ClearCartOnMount } from "@/components/storefront/ClearCartOnMount";

export const dynamic = "force-dynamic";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: { orderId?: string };
}) {
  const orderId = searchParams.orderId;
  const order = orderId
    ? await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: { include: { product: { select: { name: true, slug: true } } } } },
      })
    : null;

  if (!order) {
    return (
      <div className="mx-auto max-w-editorial px-5 py-40 text-center">
        <h1 className="font-serif text-3xl text-ink">הזמנה לא נמצאה</h1>
        <p className="mt-3 text-charcoal/70">ייתכן שהקישור פג. אם בוצע חיוב — אנא צרו קשר.</p>
        <Link href="/shop" className="mt-6 inline-block text-copper underline-offset-4 hover:underline">חזרה לחנות</Link>
      </div>
    );
  }

  const content = await getSiteContent();
  const isPickup = order.shippingMethod === "pickup";
  const isPaid = order.status === "confirmed" || !!order.paidAt;

  let address = "";
  try {
    const a = JSON.parse(order.shippingAddress || "{}") as { street?: string; city?: string; zip?: string };
    address = [a.street, a.city, a.zip].filter(Boolean).join(", ");
  } catch {}

  return (
    <div className="mx-auto max-w-editorial px-5 pb-20 pt-28 md:px-8 md:pt-32">
      <ClearCartOnMount />
      <div className="rounded-2xl border border-charcoal/15 bg-linen p-8 md:p-10">
        <p className="text-sm uppercase tracking-wider2 text-copper">{isPaid ? "התשלום אושר" : "ההזמנה התקבלה"}</p>
        <h1 className="mt-2 font-serif text-4xl text-ink">תודה, {order.customerName}</h1>
        <p className="mt-2 text-charcoal/70">
          הזמנה <strong>{order.orderNumber}</strong> — אישור נשלח אל {order.customerEmail}.
        </p>

        <div className="mt-8 grid gap-8 md:grid-cols-3">
          <section className="md:col-span-2">
            <h2 className="font-serif text-xl text-ink">פריטים</h2>
            <ul className="mt-3 divide-y divide-charcoal/10">
              {order.items.map((i) => (
                <li key={i.id} className="flex justify-between py-3 text-sm">
                  <span>{i.product.name} × {i.quantity}</span>
                  <span>{formatPrice(i.price * i.quantity)}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6 space-y-1 text-sm">
              <div className="flex justify-between text-charcoal/70">
                <span>סכום ביניים</span><span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-charcoal/70">
                <span>משלוח</span><span>{order.shippingCost > 0 ? formatPrice(order.shippingCost) : "חינם"}</span>
              </div>
              <div className="mt-2 flex justify-between border-t border-charcoal/15 pt-3 font-serif text-lg text-ink">
                <span>סך הכול</span><span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </section>

          <aside>
            <h2 className="font-serif text-xl text-ink">{isPickup ? "איסוף עצמי" : "משלוח"}</h2>
            {isPickup ? (
              <div className="mt-3 space-y-1 text-sm">
                <p>{content.shipping_pickup_address || "כתובת תיאום באמצעות וואטסאפ"}</p>
                <p className="text-charcoal/60">{content.shipping_pickup_hours || "ניצור איתך קשר לתיאום"}</p>
              </div>
            ) : (
              <div className="mt-3 space-y-1 text-sm">
                <p>{address}</p>
                <p className="text-charcoal/60">דואר ישראל · {content.shipping_post_eta || "עד 7 ימי עסקים"}</p>
              </div>
            )}

            {order.morningDocumentUrl && (
              <a
                href={order.morningDocumentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-block text-copper underline-offset-4 hover:underline"
              >
                הורד קבלה (PDF)
              </a>
            )}
          </aside>
        </div>
      </div>

      <div className="mt-8 text-center">
        <Link href="/shop" className="text-charcoal/70 underline-offset-4 hover:text-ink hover:underline">
          המשך קנייה
        </Link>
      </div>
    </div>
  );
}
