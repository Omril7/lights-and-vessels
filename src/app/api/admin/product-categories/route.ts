import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { makeSlug } from "@/lib/utils";

export const dynamic = "force-dynamic";

const createSchema = z.object({
  name_he: z.string().trim().min(1, "שם בעברית חובה"),
  name_en: z.string().trim().min(1, "Name in English is required"),
  slug: z.string().trim().optional(),
});

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const categories = await prisma.productCategory.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  });
  return NextResponse.json({ categories });
}

export async function POST(req: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const parsed = createSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }
  const { name_he, name_en } = parsed.data;
  const slug = parsed.data.slug || makeSlug(name_en);
  if (!slug) {
    return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
  }

  const last = await prisma.productCategory.findFirst({
    orderBy: { order: "desc" },
    select: { order: true },
  });
  try {
    const category = await prisma.productCategory.create({
      data: { name_he, name_en, slug, order: (last?.order ?? -1) + 1 },
    });
    return NextResponse.json({ category });
  } catch {
    return NextResponse.json(
      { error: "קטגוריה עם slug כזה כבר קיימת" },
      { status: 409 }
    );
  }
}
