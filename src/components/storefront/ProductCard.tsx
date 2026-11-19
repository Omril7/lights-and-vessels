"use client";

import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { Badge } from "@/components/ui/Badge";
import { formatPrice, localize } from "@/lib/utils";
import type { ProductWithImages } from "@/types";

/**
 * Shop card: one portrait photo, a quiet caption underneath.
 * Hover "lights the candle" — crossfades to the second photo, which should be
 * the same piece shot lit (see .claude/STYLE.md).
 */
export function ProductCard({
  product,
  priority = false,
}: {
  product: ProductWithImages;
  priority?: boolean;
}) {
  const t = useTranslations("product");
  const locale = useLocale();

  const name = localize(product, "name", locale);
  const materials = localize(product, "materials", locale);
  const primary = product.images[0]?.url;
  const secondary = product.images[1]?.url;
  const onSale =
    product.comparePrice != null && product.comparePrice > product.price;
  const soldOut = !product.inStock || product.stockCount <= 0;

  return (
    <Link href={`/shop/${product.slug}`} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden bg-sand">
        {primary && (
          <Image
            src={primary}
            alt={localize(product.images[0], "alt", locale) || name}
            fill
            priority={priority}
            sizes="(max-width: 768px) 50vw, 33vw"
            className={`object-cover transition-opacity duration-700 ease-grace ${
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
            sizes="(max-width: 768px) 50vw, 33vw"
            className="object-cover opacity-0 transition-opacity duration-700 ease-grace group-hover:opacity-100"
          />
        )}

        {/* Sold-out dims the image so the state reads instantly */}
        {soldOut && <div className="absolute inset-0 bg-cream/45" aria-hidden />}

        {(soldOut || onSale) && (
          <div className="absolute start-3 top-3">
            {soldOut ? (
              <Badge tone="soldout">{t("soldOut")}</Badge>
            ) : (
              <Badge tone="sale">{t("sale")}</Badge>
            )}
          </div>
        )}
      </div>

      <div className="mt-3">
        <h2 className="text-lg font-medium leading-snug text-ink decoration-1 underline-offset-4 group-hover:underline">
          {name}
        </h2>
        <p className="mt-0.5 flex items-baseline gap-2 text-sm text-charcoal/70">
          {materials && (
            <>
              <span className="line-clamp-1">{materials}</span>
              <span aria-hidden>·</span>
            </>
          )}
          <span className="shrink-0 text-charcoal">{formatPrice(product.price)}</span>
          {onSale && (
            <span className="shrink-0 text-xs text-charcoal/40 line-through">
              {formatPrice(product.comparePrice!)}
            </span>
          )}
        </p>
      </div>
    </Link>
  );
}
