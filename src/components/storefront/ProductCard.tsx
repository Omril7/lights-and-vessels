"use client";

import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { useState } from "react";
import toast from "react-hot-toast";
import { motion } from "motion/react";
import { useTranslations, useLocale } from "next-intl";
import { useCart } from "@/lib/cart";
import { useShouldReduceMotion } from "@/lib/motion-prefs";
import { Badge } from "@/components/ui/Badge";
import { formatPrice, localize } from "@/lib/utils";
import type { ProductWithImages } from "@/types";

const CATEGORY_KEYS: Record<string, "rings" | "necklaces" | "bracelets" | "earrings" | "homeDecor"> = {
  rings: "rings",
  necklaces: "necklaces",
  bracelets: "bracelets",
  earrings: "earrings",
  "home-decor": "homeDecor",
};

export function ProductCard({
  product,
  priority = false,
}: {
  product: ProductWithImages;
  priority?: boolean;
}) {
  const t = useTranslations("product");
  const tCat = useTranslations("categories");
  const locale = useLocale();
  const addItem = useCart((s) => s.addItem);
  const [hover, setHover] = useState(false);
  const reduceMotion = useShouldReduceMotion();

  const name = localize(product, "name", locale);
  const primary = product.images[0]?.url;
  const secondary = product.images[1]?.url;
  const onSale =
    product.comparePrice != null && product.comparePrice > product.price;
  const soldOut = !product.inStock || product.stockCount <= 0;

  const categoryLabel = product.category
    ? (tCat(CATEGORY_KEYS[product.category] ?? (product.category as never)) as string)
    : null;

  const quickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    if (soldOut) return;
    addItem({
      productId: product.id,
      slug: product.slug,
      name,
      price: product.price,
      image: primary ?? "",
      stockCount: product.stockCount,
    });
    toast.success(t("addedToCart"));
  };

  return (
    <Link
      href={`/shop/${product.slug}`}
      className="group block"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-sand">
        {primary && (
          <Image
            src={primary}
            alt={localize(product.images[0], "alt", locale) || name}
            fill
            priority={priority}
            sizes="(max-width: 768px) 50vw, 25vw"
            className={`object-cover transition-all duration-700 ease-grace ${
              hover && secondary ? "opacity-0" : "opacity-100"
            } group-hover:scale-105`}
          />
        )}
        {secondary && (
          <Image
            src={secondary}
            alt={localize(product.images[1], "alt", locale) || name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className={`object-cover transition-all duration-700 ease-grace ${
              hover ? "opacity-100 scale-105" : "opacity-0"
            }`}
          />
        )}

        {/* Sold-out dims the image so the state reads instantly */}
        {soldOut && (
          <div className="absolute inset-0 bg-cream/45" aria-hidden />
        )}

        {/* Badges */}
        <div className="absolute start-3 top-3 flex flex-col items-start gap-1.5">
          {soldOut && (
            <Badge tone="soldout" className="shadow-lift">
              {t("soldOut")}
            </Badge>
          )}
          {!soldOut && onSale && (
            <motion.div
              animate={
                reduceMotion
                  ? undefined
                  : {
                      scale: [1, 1.06, 1],
                      boxShadow: [
                        "0 0 0 0 rgba(181, 112, 78, 0.45)",
                        "0 0 0 6px rgba(181, 112, 78, 0)",
                        "0 0 0 0 rgba(181, 112, 78, 0)",
                      ],
                    }
              }
              transition={{
                duration: 2.6,
                repeat: Infinity,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="rounded-full"
            >
              <Badge tone="sale" className="shadow-lift">
                {t("sale")}
              </Badge>
            </motion.div>
          )}
        </div>

        {/* Quick add */}
        {!soldOut && (
          <button
            onClick={quickAdd}
            className="absolute inset-x-3 bottom-3 translate-y-3 rounded-full bg-cream/95 py-2.5 text-xs font-medium tracking-wide text-charcoal opacity-0 shadow-soft transition-all duration-300 ease-grace hover:bg-cream group-hover:translate-y-0 group-hover:opacity-100"
          >
            {t("quickAdd")}
          </button>
        )}
      </div>

      <div className="mt-3 px-0.5">
        {categoryLabel && (
          <p className="text-[0.7rem] uppercase tracking-wider2 text-charcoal/50">
            {categoryLabel}
          </p>
        )}
        <h2 className="mt-1 font-serif text-lg leading-snug text-ink transition-colors group-hover:text-copper">
          {name}
        </h2>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-sm font-medium text-charcoal">
            {formatPrice(product.price)}
          </span>
          {onSale && (
            <span className="text-xs text-charcoal/40 line-through">
              {formatPrice(product.comparePrice!)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
