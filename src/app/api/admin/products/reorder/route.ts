import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

const schema = z.object({ ids: z.array(z.string()).min(1) });

/** Persists a manual order: ids[0] is shown first on the shop. */
export async function POST(req: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const { ids } = parsed.data;

  // The submitted ids may be one page of a longer list; reuse the sortOrder
  // slots they already occupy so other pages keep their place.
  const rows = await prisma.product.findMany({
    where: { id: { in: ids } },
    select: { id: true, sortOrder: true },
  });
  const slots = rows.map((r) => r.sortOrder).sort((a, b) => a - b);
  const known = new Set(rows.map((r) => r.id));
  const ordered = ids.filter((id) => known.has(id));

  await prisma.$transaction(
    ordered.map((id, i) =>
      prisma.product.update({
        where: { id },
        data: { sortOrder: slots[i] ?? i },
      })
    )
  );
  return NextResponse.json({ ok: true });
}
