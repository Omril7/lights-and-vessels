import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { productSchema, productScalars, resolveSlug } from "@/lib/products";
import { deleteRemovedImages, deleteStorageObjects } from "@/lib/storage";

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
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const data = parsed.data;
  const { slug, conflict } = await resolveSlug(data, params.id);
  if (conflict) {
    return NextResponse.json({ error: "Slug already in use" }, { status: 409 });
  }

  const product = await prisma.$transaction(async (tx) => {
    await tx.productImage.deleteMany({ where: { productId: params.id } });
    await tx.productTagLink.deleteMany({ where: { productId: params.id } });
    return tx.product.update({
      where: { id: params.id },
      data: {
        ...productScalars(data),
        slug: slug ?? existing.slug,
        tags: { create: data.tagIds.map((tagId) => ({ tagId })) },
        images: {
          create: data.images.map((img, i) => ({
            url: img.url,
            alt_he: img.alt ?? null,
            order: i,
          })),
        },
      },
      include: { images: true },
    });
  });

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
