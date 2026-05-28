import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { makeSlug } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const tags = await prisma.blogTag.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  });
  return NextResponse.json({ tags });
}

export async function POST(req: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const body = (await req.json().catch(() => ({}))) as {
    name?: string;
    slug?: string;
    order?: number;
  };
  const name = (body.name ?? "").trim();
  if (!name) {
    return NextResponse.json({ error: "Name required" }, { status: 400 });
  }
  const slug = (body.slug?.trim() || makeSlug(name)) || `tag-${Date.now()}`;

  try {
    const tag = await prisma.blogTag.create({
      data: { name, slug, order: body.order ?? 0 },
    });
    return NextResponse.json({ tag });
  } catch {
    return NextResponse.json(
      { error: "תגית עם שם או slug כזה כבר קיימת" },
      { status: 409 }
    );
  }
}
