import { getLocale } from "next-intl/server";
import { getSiteContent } from "@/lib/content";
import { CartView } from "@/components/storefront/CartView";

export const dynamic = "force-dynamic";

export default async function CartPage() {
  const locale = await getLocale();
  const content = await getSiteContent({ locale });
  const postPrice = Number(content.shipping_post_price || "30") || 30;
  const freeOver = Number(content.shipping_free_over || "") || 0;

  return <CartView postPrice={postPrice} freeOver={freeOver} />;
}
