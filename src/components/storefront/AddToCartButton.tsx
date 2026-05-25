"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { MinusIcon, PlusIcon } from "@heroicons/react/24/outline";
import { useCart } from "@/lib/cart";
import { Button } from "@/components/ui/Button";
import type { ProductWithImages } from "@/types";

export function AddToCartButton({
  product,
  withQuantity = false,
}: {
  product: ProductWithImages;
  withQuantity?: boolean;
}) {
  const addItem = useCart((s) => s.addItem);
  const [qty, setQty] = useState(1);

  const soldOut = !product.inStock || product.stockCount <= 0;

  const handleAdd = () => {
    addItem(
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        image: product.images[0]?.url ?? "",
        stockCount: product.stockCount,
      },
      qty
    );
    toast.success("נוסף לעגלה");
  };

  if (soldOut) {
    return (
      <Button variant="outline" disabled className="w-full">
        אזל מהמלאי
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      {withQuantity && (
        <div className="flex items-center justify-between rounded-full border border-charcoal/25 px-2 sm:w-36">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            aria-label="הפחתת כמות"
            className="p-2 text-charcoal transition hover:text-ink disabled:opacity-30"
            disabled={qty <= 1}
          >
            <MinusIcon className="h-4 w-4" />
          </button>
          <span className="min-w-[2ch] text-center text-sm font-medium">
            {qty}
          </span>
          <button
            onClick={() =>
              setQty((q) => Math.min(product.stockCount, q + 1))
            }
            aria-label="הוספת כמות"
            className="p-2 text-charcoal transition hover:text-ink disabled:opacity-30"
            disabled={qty >= product.stockCount}
          >
            <PlusIcon className="h-4 w-4" />
          </button>
        </div>
      )}
      <Button onClick={handleAdd} className="flex-1" size={withQuantity ? "lg" : "md"}>
        הוספה לעגלה
      </Button>
    </div>
  );
}
