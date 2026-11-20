"use client";

import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { formatPrice, localize } from "@/lib/utils";
import type { ProductWithImages } from "@/types";
import { displayName, isComingSoon, isSoldOut } from "@/lib/product-status";

/**
 * Store card: 4:5 photo, then a hairline, name and price on one row, and a
 * one-line spec underneath. Hover crossfades to the second photo (ideally the
 * same piece, lit).
 */
export function ProductCard({
  product,
  priority = false,
}: {
  product: ProductWithImages;
  priority?: boolean;
}) {
  const t = useTranslations("shop");
  const locale = useLocale();

  const name = displayName(product, locale);
  const materials = localize(product, "materials", locale);
  const primary = product.images[0]?.url;
  const secondary = product.images[1]?.url;
  const comingSoon = isComingSoon(product);
  const soldOut = isSoldOut(product);
  const onSale = !comingSoon && product.comparePrice != null && product.comparePrice > product.price;

  const detail = [product.isUnique ? t("oneOfAKind") : null, materials || null]
    .filter(Boolean)
    .join(" · ");

  return (
    <Link href={`/shop/${product.slug}`} className="group flex flex-col gap-3.5 text-ink">
      <div className="relative aspect-[4/5] overflow-hidden bg-sand">
        {primary && (
          <Image
            src={primary}
            alt={localize(product.images[0], "alt", locale) || name}
            fill
            priority={priority}
            sizes="(max-width: 640px) 100vw, (max-width: 1100px) 50vw, 33vw"
            className={`object-cover saturate-[0.85] transition-opacity duration-700 ease-grace ${
              secondary ? "group-hover:opacity-0" : ""
            }`}
          />
        )}
        {secondary && (
          <Image
            src={secondary}
            alt=""
            aria-hidden
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1100px) 50vw, 33vw"
            className="object-cover opacity-0 saturate-[0.85] transition-opacity duration-700 ease-grace group-hover:opacity-100"
          />
        )}
        {soldOut && <div className="absolute inset-0 bg-cream/45" aria-hidden />}
      </div>

      <div className="flex items-baseline justify-between gap-3 border-t border-stone pt-3">
        <span className="text-base transition-colors group-hover:text-accent">{name}</span>
        <span
          className={`shrink-0 text-[0.95rem] font-light ${comingSoon || soldOut ? "text-charcoal/70" : ""}`}
        >
          {comingSoon ? (
            t("comingSoon")
          ) : soldOut ? (
            t("soldOut")
          ) : (
            <>
              {onSale && (
                <span className="me-2 text-xs text-charcoal/50 line-through">
                  {formatPrice(product.comparePrice!)}
                </span>
              )}
              {formatPrice(product.price)}
            </>
          )}
        </span>
      </div>
      {detail && <span className="-mt-1.5 text-[0.82rem] font-light text-charcoal/80">{detail}</span>}
    </Link>
  );
}
