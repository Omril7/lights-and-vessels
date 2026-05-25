import { getSiteContent } from "@/lib/content";
import { CheckoutForm } from "@/components/storefront/CheckoutForm";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const content = await getSiteContent();
  const postPrice = Number(content.shipping_post_price || "30") || 30;
  const freeOver = Number(content.shipping_free_over || "") || 0;
  const postEta = content.shipping_post_eta || "עד 7 ימי עסקים";
  const pickupAddress = content.shipping_pickup_address || "";
  const pickupHours = content.shipping_pickup_hours || "";

  return (
    <div className="mx-auto max-w-editorial px-5 pb-20 pt-28 md:px-8 md:pt-32">
      <h1 className="mb-10 font-serif text-4xl text-ink md:text-5xl">תשלום</h1>
      <CheckoutForm
        shipping={{ postPrice, freeOver, postEta, pickupAddress, pickupHours }}
      />
    </div>
  );
}
