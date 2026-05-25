import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

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

  await prisma.$transaction(
    parsed.data.entries.map((e) =>
      prisma.siteContent.upsert({
        where: { key: e.key },
        update: { value: e.value, type: e.type ?? "text" },
        create: { key: e.key, value: e.value, type: e.type ?? "text" },
      })
    )
  );

  return NextResponse.json({ ok: true });
}
