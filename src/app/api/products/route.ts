import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { makeSlug } from "@/lib/utils";

export const dynamic = "force-dynamic";

const productSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).optional(),
  description: z.string().default(""),
  price: z.number().nonnegative(),
  comparePrice: z.number().nonnegative().nullable().optional(),
  category: z.string().min(1).nullable().optional(),
  tags: z.string().nullable().optional(),
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

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const where: Record<string, unknown> = {};
  if (searchParams.get("category")) where.category = searchParams.get("category");
  if (searchParams.get("featured") === "true") where.featured = true;
  if (searchParams.get("published") === "true") where.published = true;

  const items = await prisma.product.findMany({
    where,
    include: { images: { orderBy: { order: "asc" } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = productSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const slug = data.slug?.trim() || makeSlug(data.name);

  // Ensure slug is unique
  const existing = await prisma.product.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json(
      { error: "Slug already in use" },
      { status: 409 }
    );
  }

  const product = await prisma.product.create({
    data: {
      name: data.name,
      slug,
      description: data.description,
      price: data.price,
      comparePrice: data.comparePrice ?? null,
      category: data.category ?? null,
      tags: data.tags ?? null,
      stockCount: data.stockCount,
      inStock: data.inStock,
      featured: data.featured,
      published: data.published,
      images: {
        create: data.images.map((img, i) => ({
          url: img.url,
          alt: img.alt ?? null,
          order: i,
        })),
      },
    },
    include: { images: true },
  });

  return NextResponse.json(product, { status: 201 });
}
