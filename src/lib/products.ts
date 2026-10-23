import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { makeSlug } from "@/lib/utils";

const required = (msg: string) => z.string().trim().min(1, msg);
const dimension = z.number().positive().nullable().optional();

export const productSchema = z.object({
  name_he: required("שם בעברית חובה"),
  name_en: required("Name in English is required"),
  slug: z.string().trim().optional(),
  description_he: required("תיאור בעברית חובה"),
  description_en: required("Description in English is required"),
  price: z.number().nonnegative(),
  comparePrice: z.number().nonnegative().nullable().optional(),
  category: z.string().min(1).nullable().optional(),
  tagIds: z.array(z.string()).default([]),
  materials_he: z.string().trim().nullable().optional(),
  materials_en: z.string().trim().nullable().optional(),
  width: dimension,
  height: dimension,
  depth: dimension,
  stockCount: z.number().int().nonnegative().default(0),
  inStock: z.boolean().default(true),
  featured: z.boolean().default(false),
  published: z.boolean().default(false),
  images: z
    .array(
      z.object({
        url: z.string().min(1),
        alt: z.string().nullable().optional(),
      })
    )
    .default([]),
});

export type ProductInput = z.infer<typeof productSchema>;

/** Columns shared by create and update. Slug/images/tags are handled by the callers. */
export function productScalars(data: ProductInput) {
  return {
    name_he: data.name_he,
    name_en: data.name_en,
    description_he: data.description_he,
    description_en: data.description_en,
    price: data.price,
    comparePrice: data.comparePrice ?? null,
    category: data.category ?? null,
    materials_he: data.materials_he || null,
    materials_en: data.materials_en || null,
    width: data.width ?? null,
    height: data.height ?? null,
    depth: data.depth ?? null,
    stockCount: data.stockCount,
    inStock: data.inStock,
    featured: data.featured,
    published: data.published,
  };
}

/**
 * Explicit slug if given, otherwise a slug from the English name.
 * Returns null when neither yields a free slug; the caller then uses the product ID.
 */
export async function resolveSlug(
  data: ProductInput,
  currentProductId?: string
): Promise<{ slug: string | null; conflict: boolean }> {
  const explicit = data.slug?.trim();
  const candidate = explicit || makeSlug(data.name_en);
  if (!candidate) return { slug: null, conflict: false };

  const clash = await prisma.product.findUnique({ where: { slug: candidate } });
  if (clash && clash.id !== currentProductId) {
    return explicit
      ? { slug: null, conflict: true }
      : { slug: null, conflict: false };
  }
  return { slug: candidate, conflict: false };
}
