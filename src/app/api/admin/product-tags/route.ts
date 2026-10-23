import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { makeSlug } from "@/lib/utils";

export const dynamic = "force-dynamic";

const createSchema = z.object({
  name_he: z.string().trim().min(1, "שם בעברית חובה"),
  name_en: z.string().trim().min(1, "Name in English is required"),
});

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const tags = await prisma.productTag.findMany({
    orderBy: { name_he: "asc" },
    include: { _count: { select: { products: true } } },
  });
  return NextResponse.json({ tags });
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
  const slug = makeSlug(name_en) || `tag-${Date.now()}`;

  try {
    const tag = await prisma.productTag.create({
      data: { name_he, name_en, slug },
      include: { _count: { select: { products: true } } },
    });
    return NextResponse.json({ tag });
  } catch {
    return NextResponse.json(
      { error: "תגית עם שם כזה כבר קיימת" },
      { status: 409 }
    );
  }
}
