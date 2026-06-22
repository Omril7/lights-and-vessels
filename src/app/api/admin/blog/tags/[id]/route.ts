import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { makeSlug } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const body = (await req.json().catch(() => ({}))) as {
    name?: string;
    name_en?: string | null;
    slug?: string;
    order?: number;
  };

  const data: Record<string, unknown> = {};
  if (typeof body.name === "string") {
    const name = body.name.trim();
    if (!name) {
      return NextResponse.json({ error: "Name required" }, { status: 400 });
    }
    data.name_he = name;
  }
  if ("name_en" in body) {
    data.name_en = body.name_en?.trim() || null;
  }
  if (typeof body.slug === "string") {
    data.slug = body.slug.trim() || makeSlug(String(data.name_he ?? ""));
  }
  if (typeof body.order === "number") data.order = body.order;

  try {
    const tag = await prisma.blogTag.update({
      where: { id: params.id },
      data,
    });
    return NextResponse.json({ tag });
  } catch {
    return NextResponse.json({ error: "שגיאה בעדכון" }, { status: 400 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  await prisma.blogTag.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
