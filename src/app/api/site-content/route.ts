import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { deleteRemovedImages } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function GET() {
  const rows = await prisma.siteContent.findMany({ orderBy: { key: "asc" } });
  return NextResponse.json(rows);
}

const updateSchema = z.object({
  entries: z.array(
    z.object({
      key: z.string().min(1),
      value_he: z.string(),
      value_en: z.string().nullable().optional(),
      type: z.string().optional(),
    })
  ),
});

export async function PUT(req: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const entries = parsed.data.entries;

  const keys = entries.map((e) => e.key);
  const oldRows = await prisma.siteContent.findMany({
    where: { key: { in: keys } },
  });

  await prisma.$transaction(
    entries.map((e) =>
      prisma.siteContent.upsert({
        where: { key: e.key },
        update: {
          value_he: e.value_he,
          value_en: e.value_en ?? null,
          type: e.type ?? "text",
        },
        create: {
          key: e.key,
          value_he: e.value_he,
          value_en: e.value_en ?? null,
          type: e.type ?? "text",
        },
      })
    )
  );

  await deleteRemovedImages(
    oldRows.map((r) => r.value_he),
    entries.map((e) => e.value_he)
  );

  return NextResponse.json({ ok: true });
}
