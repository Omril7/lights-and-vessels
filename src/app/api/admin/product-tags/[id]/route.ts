import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

const patchSchema = z.object({
  name_he: z.string().trim().min(1).optional(),
  name_en: z.string().trim().min(1).optional(),
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
  try {
    const tag = await prisma.productTag.update({
      where: { id: params.id },
      data: parsed.data,
    });
    return NextResponse.json({ tag });
  } catch {
    return NextResponse.json(
      { error: "תגית עם שם כזה כבר קיימת" },
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
  await prisma.productTag.deleteMany({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
