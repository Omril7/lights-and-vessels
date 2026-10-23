import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { makeSlug } from "@/lib/utils";

const patchSchema = z.object({
  name_he: z.string().trim().min(1).optional(),
  name_en: z.string().trim().min(1).optional(),
  slug: z.string().trim().min(1).optional(),
  order: z.number().int().optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const parsed = patchSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const existing = await prisma.productCategory.findUnique({
    where: { id: params.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const slug = parsed.data.slug ? makeSlug(parsed.data.slug) : undefined;
  try {
    // Products reference the category by slug, so a slug change moves them along.
    const category = await prisma.$transaction(async (tx) => {
      const updated = await tx.productCategory.update({
        where: { id: params.id },
        data: { ...parsed.data, slug },
      });
      if (slug && slug !== existing.slug) {
        await tx.product.updateMany({
          where: { category: existing.slug },
          data: { category: slug },
        });
      }
      return updated;
    });
    return NextResponse.json({ category });
  } catch {
    return NextResponse.json(
      { error: "קטגוריה עם slug כזה כבר קיימת" },
      { status: 409 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const existing = await prisma.productCategory.findUnique({
    where: { id: params.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  await prisma.$transaction([
    prisma.product.updateMany({
      where: { category: existing.slug },
      data: { category: null },
    }),
    prisma.productCategory.delete({ where: { id: params.id } }),
  ]);
  return NextResponse.json({ ok: true });
}
