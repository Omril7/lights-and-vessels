import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";
import { getSiteContent } from "@/lib/content";
import { formatPrice, localize } from "@/lib/utils";
import { ClearCartOnMount } from "@/components/storefront/ClearCartOnMount";

export const dynamic = "force-dynamic";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: { orderId?: string };
}) {
  const [locale, t] = await Promise.all([getLocale(), getTranslations("checkoutSuccess")]);
  const orderId = searchParams.orderId;
  const order = orderId
    ? await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: { include: { product: { select: { name_he: true, name_en: true, slug: true } } } } },
      })
    : null;

  if (!order) {
    return (
      <div className="mx-auto max-w-editorial px-5 py-40 text-center">
        <h1 className="font-serif text-3xl text-ink">{t("orderNotFound")}</h1>
        <p className="mt-3 text-charcoal/70">{t("orderNotFoundMessage")}</p>
        <Link href="/shop" className="mt-6 inline-block text-copper underline-offset-4 hover:underline">{t("backToShop")}</Link>
      </div>
    );
  }

  const content = await getSiteContent({ locale });
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
        <p className="text-sm uppercase tracking-wider2 text-copper">{isPaid ? t("confirmed") : t("received")}</p>
        <h1 className="mt-2 font-serif text-4xl text-ink">{t("thanks", { name: order.customerName })}</h1>
        <p className="mt-2 text-charcoal/70">
          {t("orderConfirmation", { number: order.orderNumber, email: order.customerEmail })}
        </p>

        <div className="mt-8 grid gap-8 md:grid-cols-3">
          <section className="md:col-span-2">
            <h2 className="font-serif text-xl text-ink">{t("items")}</h2>
            <ul className="mt-3 divide-y divide-charcoal/10">
              {order.items.map((i) => (
                <li key={i.id} className="flex justify-between py-3 text-sm">
                  <span>{localize(i.product, "name", locale)} × {i.quantity}</span>
                  <span>{formatPrice(i.price * i.quantity)}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6 space-y-1 text-sm">
              <div className="flex justify-between text-charcoal/70">
                <span>{t("subtotal")}</span><span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-charcoal/70">
                <span>{t("shipping")}</span><span>{order.shippingCost > 0 ? formatPrice(order.shippingCost) : t("free")}</span>
              </div>
              <div className="mt-2 flex justify-between border-t border-charcoal/15 pt-3 font-serif text-lg text-ink">
                <span>{t("total")}</span><span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </section>

          <aside>
            <h2 className="font-serif text-xl text-ink">{isPickup ? t("pickupLabel") : t("shippingLabel")}</h2>
            {isPickup ? (
              <div className="mt-3 space-y-1 text-sm">
                <p>{content.shipping_pickup_address || t("pickupAddressFallback")}</p>
                <p className="text-charcoal/60">{content.shipping_pickup_hours || t("pickupHoursFallback")}</p>
              </div>
            ) : (
              <div className="mt-3 space-y-1 text-sm">
                <p>{address}</p>
                <p className="text-charcoal/60">דואר ישראל · {content.shipping_post_eta || t("postEtaFallback")}</p>
              </div>
            )}

            {order.morningDocumentUrl && (
              <a
                href={order.morningDocumentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-block text-copper underline-offset-4 hover:underline"
              >
                {t("downloadReceipt")}
              </a>
            )}
          </aside>
        </div>
      </div>

      <div className="mt-8 text-center">
        <Link href="/shop" className="text-charcoal/70 underline-offset-4 hover:text-ink hover:underline">
          {t("continueShopping")}
        </Link>
      </div>
    </div>
  );
}
