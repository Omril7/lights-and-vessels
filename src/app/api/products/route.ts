import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { productSchema, productScalars, resolveSlug } from "@/lib/products";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const where: Record<string, unknown> = {};
  if (searchParams.get("category")) where.category = searchParams.get("category");
  if (searchParams.get("featured") === "true") where.featured = true;
  if (searchParams.get("published") === "true") where.published = true;

  const items = await prisma.product.findMany({
    where,
    include: {
      images: { orderBy: { order: "asc" } },
      tags: { include: { tag: true } },
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
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
  const { slug, conflict } = await resolveSlug(data);
  if (conflict) {
    return NextResponse.json({ error: "Slug already in use" }, { status: 409 });
  }

  // New products go to the top of the manual order.
  const first = await prisma.product.findFirst({
    orderBy: { sortOrder: "asc" },
    select: { sortOrder: true },
  });

  const product = await prisma.$transaction(async (tx) => {
    const created = await tx.product.create({
      data: {
        ...productScalars(data),
        // Placeholder, replaced by the product ID below when no slug was resolved.
        slug: slug ?? `pending-${Date.now()}`,
        sortOrder: (first?.sortOrder ?? 1) - 1,
        tags: { create: data.tagIds.map((tagId) => ({ tagId })) },
        images: {
          create: data.images.map((img, i) => ({
            url: img.url,
            alt_he: img.alt ?? null,
            order: i,
          })),
        },
      },
    });
    if (slug) return created;
    return tx.product.update({
      where: { id: created.id },
      data: { slug: created.id },
    });
  });

  return NextResponse.json(product, { status: 201 });
}
