import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { makeSlug } from "@/lib/utils";
import { deleteRemovedImages, deleteStorageObjects } from "@/lib/storage";

const updateSchema = z.object({
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

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const existing = await prisma.product.findUnique({
    where: { id: params.id },
    include: { images: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const data = parsed.data;
  const slug = data.slug?.trim() || makeSlug(data.name);

  if (slug !== existing.slug) {
    const clash = await prisma.product.findUnique({ where: { slug } });
    if (clash) {
      return NextResponse.json(
        { error: "Slug already in use" },
        { status: 409 }
      );
    }
  }

  const product = await prisma.$transaction(async (tx) => {
    await tx.productImage.deleteMany({ where: { productId: params.id } });
    return tx.product.update({
      where: { id: params.id },
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
  });

  // Drop any images that were removed in this edit from storage.
  await deleteRemovedImages(
    existing.images.map((img) => img.url),
    data.images.map((img) => img.url)
  );

  return NextResponse.json(product);
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const existing = await prisma.product.findUnique({
    where: { id: params.id },
    include: { images: true, _count: { select: { orderItems: true } } },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (existing._count.orderItems > 0) {
    return NextResponse.json(
      {
        error:
          "המוצר משויך להזמנות קיימות ולא ניתן למחוק אותו. ניתן להסתיר אותו במקום (ביטול פרסום).",
      },
      { status: 409 }
    );
  }

  await prisma.product.delete({ where: { id: params.id } });
  await deleteStorageObjects(existing.images.map((img) => img.url));
  return NextResponse.json({ ok: true });
}
