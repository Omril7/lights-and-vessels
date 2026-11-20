import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import {
  galleryProjectSchema,
  galleryScalars,
  galleryImagesCreate,
  resolveGallerySlug,
} from "@/lib/gallery";
import { deleteRemovedImages, deleteStorageObjects } from "@/lib/storage";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const existing = await prisma.galleryProject.findUnique({
    where: { id: params.id },
    include: { images: true },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

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

  const project = await prisma.$transaction(async (tx) => {
    await tx.galleryImage.deleteMany({ where: { projectId: params.id } });
    return tx.galleryProject.update({
      where: { id: params.id },
      data: {
        ...galleryScalars(data),
        slug: data.slug ? await resolveGallerySlug(data, params.id) : existing.slug,
        images: galleryImagesCreate(data),
      },
    });
  });

  await deleteRemovedImages(
    existing.images.map((i) => i.url),
    data.images.map((i) => i.url)
  );
  return NextResponse.json(project);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const existing = await prisma.galleryProject.findUnique({
    where: { id: params.id },
    include: { images: true },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.galleryProject.delete({ where: { id: params.id } });
  await deleteStorageObjects(existing.images.map((i) => i.url));
  return NextResponse.json({ ok: true });
}
