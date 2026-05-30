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
      value: z.string(),
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

  // Snapshot the old values so we can clean up any images dropped by this save.
  const keys = entries.map((e) => e.key);
  const oldRows = await prisma.siteContent.findMany({
    where: { key: { in: keys } },
  });

  await prisma.$transaction(
    entries.map((e) =>
      prisma.siteContent.upsert({
        where: { key: e.key },
        update: { value: e.value, type: e.type ?? "text" },
        create: { key: e.key, value: e.value, type: e.type ?? "text" },
      })
    )
  );

  // Remove from storage any image URL present before but gone after the save.
  // Values are scanned for bucket URLs, so this covers single-image keys
  // (hero/story/portrait) and JSON collections (gallery, category images,
  // testimonials) alike. A URL still referenced anywhere in the new payload is
  // kept, so moving an image between fields won't delete it.
  await deleteRemovedImages(
    oldRows.map((r) => r.value),
    entries.map((e) => e.value)
  );

  return NextResponse.json({ ok: true });
}
