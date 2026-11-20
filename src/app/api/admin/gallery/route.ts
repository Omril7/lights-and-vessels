import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import {
  galleryProjectSchema,
  galleryScalars,
  galleryImagesCreate,
  resolveGallerySlug,
} from "@/lib/gallery";

export async function POST(req: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = galleryProjectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const data = parsed.data;
  const last = await prisma.galleryProject.aggregate({ _max: { sortOrder: true } });

  const project = await prisma.galleryProject.create({
    data: {
      ...galleryScalars(data),
      slug: await resolveGallerySlug(data),
      sortOrder: (last._max.sortOrder ?? 0) + 1,
      images: galleryImagesCreate(data),
    },
  });
  return NextResponse.json(project, { status: 201 });
}
