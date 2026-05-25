import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { RetryPaymentButton } from "@/components/storefront/RetryPaymentButton";

export const dynamic = "force-dynamic";

export default async function CheckoutFailedPage({
  searchParams,
}: {
  searchParams: { orderId?: string };
}) {
  const orderId = searchParams.orderId;
  const order = orderId
    ? await prisma.order.findUnique({ where: { id: orderId } })
    : null;

  return (
    <div className="mx-auto max-w-editorial px-5 pb-20 pt-28 md:px-8 md:pt-32">
      <div className="rounded-2xl border border-terracotta/30 bg-linen p-8 md:p-10">
        <p className="text-sm uppercase tracking-wider2 text-terracotta">התשלום לא הושלם</p>
        <h1 className="mt-2 font-serif text-4xl text-ink">משהו השתבש</h1>
        <p className="mt-3 text-charcoal/70">
          התשלום לא עבר. ההזמנה שמורה{order ? <> תחת המספר <strong>{order.orderNumber}</strong></> : null} — אפשר לנסות שוב.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          {order && <RetryPaymentButton orderId={order.id} />}
          <Link
            href="/cart"
            className="rounded-full border border-charcoal/30 px-6 py-3 text-sm text-charcoal hover:border-charcoal"
          >
            חזרה לעגלה
          </Link>
        </div>
      </div>
    </div>
  );
}
