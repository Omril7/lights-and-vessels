"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import toast from "react-hot-toast";
import { motion } from "motion/react";
import { useCart } from "@/lib/cart";
import { useShouldReduceMotion } from "@/lib/motion-prefs";
import { Badge } from "@/components/ui/Badge";
import { formatPrice } from "@/lib/utils";
import { categoryLabel } from "@/types";
import type { ProductWithImages } from "@/types";

export function ProductCard({
  product,
  priority = false,
}: {
  product: ProductWithImages;
  priority?: boolean;
}) {
  const addItem = useCart((s) => s.addItem);
  const [hover, setHover] = useState(false);
  const reduceMotion = useShouldReduceMotion();

  const primary = product.images[0]?.url;
  const secondary = product.images[1]?.url;
  const onSale =
    product.comparePrice != null && product.comparePrice > product.price;
  const soldOut = !product.inStock || product.stockCount <= 0;

  const quickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    if (soldOut) return;
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: primary ?? "",
      stockCount: product.stockCount,
    });
    toast.success("נוסף לעגלה");
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
            alt={product.images[0]?.alt ?? product.name}
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
            alt={product.images[1]?.alt ?? product.name}
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
              אזל מהמלאי
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
                במבצע
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
            הוספה מהירה לעגלה
          </button>
        )}
      </div>

      <div className="mt-3 px-0.5">
        {product.category && (
          <p className="text-[0.7rem] uppercase tracking-wider2 text-charcoal/50">
            {categoryLabel(product.category)}
          </p>
        )}
        <h2 className="mt-1 font-serif text-lg leading-snug text-ink transition-colors group-hover:text-copper">
          {product.name}
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
