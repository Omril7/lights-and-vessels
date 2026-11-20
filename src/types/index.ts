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

export type SortKey = "curated" | "price-asc" | "price-desc";
