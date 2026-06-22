import { NextResponse } from "next/server";
import { z } from "zod";
import { draftMode } from "next/headers";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

const entriesSchema = z.object({
  entries: z.array(
    z.object({
      key: z.string().min(1),
      value_he: z.string(),
      value_en: z.string().nullable().optional(),
      type: z.string().optional(),
    })
  ),
});

export async function POST(req: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = entriesSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const entries = parsed.data.entries;

  await prisma.$transaction([
    prisma.siteContentDraft.deleteMany({}),
    prisma.siteContentDraft.createMany({
      data: entries.map((e) => ({
        key: e.key,
        value_he: e.value_he,
        value_en: e.value_en ?? null,
        type: e.type ?? "text",
      })),
    }),
  ]);

  draftMode().enable();
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  draftMode().disable();
  await prisma.siteContentDraft.deleteMany({});
  return NextResponse.json({ ok: true });
}
