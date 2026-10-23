import type { Product, ProductImage } from "@prisma/client";

export type ProductWithImages = Product & {
  images: ProductImage[];
};

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  stockCount: number;
};

export type Category = {
  slug: string;
  label: string;
};

/** Category slugs stay ASCII (for URLs); labels are Hebrew. */
export const CATEGORIES: Category[] = [
  { slug: "rings", label: "טבעות" },
  { slug: "necklaces", label: "שרשראות" },
  { slug: "bracelets", label: "צמידים" },
  { slug: "earrings", label: "עגילים" },
  { slug: "home-decor", label: "לבית" },
];

export function categoryLabel(slug: string): string {
  return CATEGORIES.find((c) => c.slug === slug)?.label ?? slug;
}

export type SortKey = "curated" | "price-asc" | "price-desc";
