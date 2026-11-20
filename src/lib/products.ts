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
  categoryId: z.string().min(1).nullable().optional(),
  tagIds: z.array(z.string()).max(50).default([]),
  materials_he: z.string().trim().nullable().optional(),
  materials_en: z.string().trim().nullable().optional(),
  width: dimension,
  height: dimension,
  depth: dimension,
  stockCount: z.number().int().nonnegative().default(0),
  status: z.enum(["AVAILABLE", "COMING_SOON", "SOLD", "HIDDEN"]).default("HIDDEN"),
  isUnique: z.boolean().default(false),
  pieceNumber: z.number().int().positive().nullable().optional(),
  year: z.number().int().min(1900).max(2100).nullable().optional(),
  featured: z.boolean().default(false),
  images: z
    .array(
      z.object({
        url: z.string().min(1),
        alt: z.string().nullable().optional(),
      })
    )
    .max(40).default([]),
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
    categoryId: data.categoryId ?? null,
    materials_he: data.materials_he || null,
    materials_en: data.materials_en || null,
    width: data.width ?? null,
    height: data.height ?? null,
    depth: data.depth ?? null,
    // A one-of-a-kind piece is exactly one item.
    stockCount: data.isUnique ? Math.min(data.stockCount, 1) : data.stockCount,
    status: data.status,
    isUnique: data.isUnique,
    pieceNumber: data.isUnique ? data.pieceNumber ?? null : null,
    year: data.year ?? null,
    featured: data.featured,
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
