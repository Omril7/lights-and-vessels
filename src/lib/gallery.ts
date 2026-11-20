import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { makeSlug } from "@/lib/utils";

export const galleryProjectSchema = z.object({
  title_he: z.string().trim().min(1, "כותרת בעברית חובה"),
  title_en: z.string().trim().nullable().optional(),
  slug: z.string().trim().optional(),
  description_he: z.string().trim().nullable().optional(),
  description_en: z.string().trim().nullable().optional(),
  year: z.number().int().min(1900).max(2100).nullable().optional(),
  published: z.boolean().default(false),
  images: z
    .array(z.object({ url: z.string().min(1), alt: z.string().nullable().optional() }))
    .default([]),
});

export type GalleryProjectInput = z.infer<typeof galleryProjectSchema>;

export function galleryScalars(data: GalleryProjectInput) {
  return {
    title_he: data.title_he,
    title_en: data.title_en || null,
    description_he: data.description_he || null,
    description_en: data.description_en || null,
    year: data.year ?? null,
    published: data.published,
  };
}

/** Explicit slug, else from the English title, else the Hebrew one; suffixed until free. */
export async function resolveGallerySlug(
  data: GalleryProjectInput,
  currentId?: string
): Promise<string> {
  const base =
    makeSlug(data.slug || "") ||
    makeSlug(data.title_en || "") ||
    makeSlug(data.title_he) ||
    "project";
  let candidate = base;
  for (let n = 2; ; n++) {
    const clash = await prisma.galleryProject.findUnique({ where: { slug: candidate } });
    if (!clash || clash.id === currentId) return candidate;
    candidate = `${base}-${n}`;
  }
}

export function galleryImagesCreate(data: GalleryProjectInput) {
  return {
    create: data.images.map((img, i) => ({ url: img.url, alt_he: img.alt ?? null, order: i })),
  };
}
