"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/utils";
import { displayName, isBuyable, isComingSoon, pieceLabel } from "@/lib/product-status";
import type { ProductWithImages } from "@/types";

/**
 * The buy button, drawn as a rubber stamp: brand + piece number | logo | action + price.
 * The rough edge comes from the .ink filter (globals.css + app/layout.tsx).
 */
export function StampBuyButton({ product }: { product: ProductWithImages }) {
  const t = useTranslations("product");
  const locale = useLocale();
  const addItem = useCart((s) => s.addItem);
  const openCart = useCart((s) => s.openCart);
  const [added, setAdded] = useState(false);

  const buyable = isBuyable(product);
  const comingSoon = isComingSoon(product);
  const name = displayName(product, locale);

  const label = comingSoon
    ? t("comingSoon")
    : !buyable
      ? t("soldOut")
      : added
        ? t("inCart")
        : t("buy");

  const onClick = () => {
    if (!buyable) return;
    if (added) {
      openCart();
      return;
    }
    addItem({
      productId: product.id,
      slug: product.slug,
      name,
      price: product.price,
      image: product.images[0]?.url ?? "",
      stockCount: product.stockCount,
    });
    // No popup: the stamp itself turns into "in cart", and the header count updates.
    setAdded(true);
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!buyable}
      aria-label={
        added ? `${label} — ${t("viewCart")}` : buyable ? `${label} — ${formatPrice(product.price)}` : label
      }
      className={`ink flex h-[72px] w-full items-stretch border-2 border-stamp text-stamp transition-[opacity,background-color] hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-60 ${
        added ? "bg-stamp/[0.07] motion-safe:animate-stamp" : "bg-transparent"
      }`}
    >
      <span className="flex flex-col justify-center gap-0.5 whitespace-nowrap border-e-2 border-stamp px-4 text-start text-sm font-bold">
        {t("brand")}
        <span className="font-serif text-2xl font-medium leading-none">
          {product.isUnique && product.pieceNumber != null ? pieceLabel(product.pieceNumber) : "—"}
        </span>
      </span>
      <span className="flex flex-1 items-center justify-center border-e-2 border-stamp px-3">
        <span aria-hidden className="stamp-logo h-[46px] w-[78px]" />
      </span>
      <span className="flex flex-col justify-center gap-0.5 whitespace-nowrap px-4 text-start text-base font-bold">
        {label}
        {added ? (
          <span className="text-sm font-medium">{t("viewCart")}</span>
        ) : (
          !comingSoon && <span className="font-medium">{formatPrice(product.price)}</span>
        )}
      </span>
    </button>
  );
}
