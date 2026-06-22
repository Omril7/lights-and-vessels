"use client";

import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { MinusIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useTranslations } from "next-intl";
import { useCart, cartSubtotal } from "@/lib/cart";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";

const FREE_SHIPPING_THRESHOLD = 500;
const FLAT_SHIPPING = 30;

export default function CartPage() {
  const t = useTranslations("cartPage");
  const { items, setQuantity, removeItem } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const subtotal = cartSubtotal(items);
  const shipping =
    items.length === 0 || subtotal >= FREE_SHIPPING_THRESHOLD
      ? 0
      : FLAT_SHIPPING;
  const total = subtotal + shipping;

  if (!mounted) {
    return <div className="min-h-[60vh]" />;
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-editorial flex-col items-center gap-5 px-5 py-40 text-center">
        <h1 className="font-serif text-4xl text-ink">{t("empty")}</h1>
        <p className="max-w-sm text-charcoal/60">
          {t("emptyMessage")}
        </p>
        <Button href="/shop" size="lg">
          {t("browse")}
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-editorial px-5 pb-16 pt-28 md:px-8 md:pt-32">
      <h1 className="mb-10 font-serif text-4xl text-ink md:text-5xl">
        {t("heading")}
      </h1>

      <div className="grid gap-10 lg:grid-cols-3">
        {/* Items */}
        <ul className="divide-y divide-charcoal/10 lg:col-span-2">
          {items.map((item) => (
            <li key={item.productId} className="flex gap-5 py-6">
              <Link
                href={`/shop/${item.slug}`}
                className="relative h-32 w-28 shrink-0 overflow-hidden rounded-xl bg-sand"
              >
                {item.image && (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="112px"
                    className="object-cover"
                  />
                )}
              </Link>

              <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <Link
                    href={`/shop/${item.slug}`}
                    className="font-serif text-xl text-ink hover:text-copper"
                  >
                    {item.name}
                  </Link>
                  <button
                    onClick={() => {
                      removeItem(item.productId);
                      toast.success(t("itemRemoved"));
                    }}
                    aria-label={t("removeItem")}
                    className="text-charcoal/40 transition hover:text-terracotta"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
                <p className="mt-1 text-sm text-charcoal/60">
                  {formatPrice(item.price)} {t("perUnit")}
                </p>

                <div className="mt-auto flex items-center justify-between pt-3">
                  <div className="flex items-center rounded-full border border-charcoal/25">
                    <button
                      onClick={() =>
                        setQuantity(item.productId, item.quantity - 1)
                      }
                      aria-label={t("decreaseQty")}
                      className="p-2 text-charcoal hover:text-ink"
                    >
                      <MinusIcon className="h-4 w-4" />
                    </button>
                    <span className="min-w-[2.5ch] text-center text-sm font-medium">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        setQuantity(item.productId, item.quantity + 1)
                      }
                      aria-label={t("increaseQty")}
                      className="p-2 text-charcoal hover:text-ink disabled:opacity-30"
                      disabled={item.quantity >= item.stockCount}
                    >
                      <PlusIcon className="h-4 w-4" />
                    </button>
                  </div>
                  <span className="font-serif text-lg text-ink">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>

        {/* Summary */}
        <aside className="h-fit rounded-2xl border border-charcoal/15 bg-linen p-6 lg:sticky lg:top-28">
          <h2 className="font-serif text-2xl text-ink">{t("summary")}</h2>

          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-charcoal/70">{t("subtotal")}</dt>
              <dd className="text-charcoal">{formatPrice(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-charcoal/70">{t("shipping")}</dt>
              <dd className="text-charcoal">
                {shipping === 0 ? t("free") : formatPrice(shipping)}
              </dd>
            </div>
            {shipping > 0 && (
              <p className="text-xs text-copper">
                {t("freeShippingProgress", { amount: formatPrice(FREE_SHIPPING_THRESHOLD - subtotal) })}
              </p>
            )}
          </dl>

          <div className="mt-4 flex justify-between border-t border-charcoal/15 pt-4">
            <span className="font-serif text-lg text-ink">{t("total")}</span>
            <span className="font-serif text-2xl text-ink">
              {formatPrice(total)}
            </span>
          </div>

          <div className="mt-6">
            <Button href="/checkout" className="w-full" size="lg">
              {t("checkout")}
            </Button>
          </div>
          <Link
            href="/shop"
            className="mt-3 block text-center text-sm text-charcoal/60 underline-offset-4 hover:text-charcoal hover:underline"
          >
            {t("continue")}
          </Link>
        </aside>
      </div>
    </div>
  );
}
