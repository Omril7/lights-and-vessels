import { prisma } from "@/lib/prisma";

export type ProductFormOptions = {
  categories: { slug: string; name_he: string; name_en: string | null }[];
  tags: { id: string; name_he: string; name_en: string | null }[];
};

/** Categories and tags the product form can pick from. */
export async function getProductFormOptions(): Promise<ProductFormOptions> {
  const [categories, tags] = await Promise.all([
    prisma.productCategory.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      select: { slug: true, name_he: true, name_en: true },
    }),
    prisma.productTag.findMany({
      orderBy: { name_he: "asc" },
      select: { id: true, name_he: true, name_en: true },
    }),
  ]);
  return { categories, tags };
}
