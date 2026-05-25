"use client";

import { useEffect, useState } from "react";
import { ProductCard } from "./ProductCard";
import { FadeIn } from "@/components/ui/FadeIn";
import { Button } from "@/components/ui/Button";
import type { ProductWithImages } from "@/types";

const PAGE_SIZE = 8;

export function ShopGrid({ products }: { products: ProductWithImages[] }) {
  const [visible, setVisible] = useState(PAGE_SIZE);

  // Reset paging whenever the filtered list changes (category/sort).
  useEffect(() => setVisible(PAGE_SIZE), [products]);

  const shown = products.slice(0, visible);
  const remaining = products.length - shown.length;

  return (
    <>
      <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-5 md:grid-cols-3 lg:grid-cols-4">
        {shown.map((p, i) => (
          <FadeIn key={p.id} delay={(i % 4) * 0.06}>
            <ProductCard product={p} priority={i < 4} />
          </FadeIn>
        ))}
      </div>

      {remaining > 0 && (
        <div className="mt-14 flex flex-col items-center gap-3">
          <p className="text-xs text-charcoal/50">
            מוצגים {shown.length} מתוך {products.length} פריטים
          </p>
          <Button
            variant="outline"
            onClick={() => setVisible((v) => v + PAGE_SIZE)}
          >
            הצגת פריטים נוספים
          </Button>
        </div>
      )}
    </>
  );
}
