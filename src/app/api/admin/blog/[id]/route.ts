import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { makeSlug } from "@/lib/utils";
import { deleteRemovedImages, deleteStorageObjects } from "@/lib/storage";

export const dynamic = "force-dynamic";

type ImageInput = { url: string; alt?: string | null };

type Payload = {
  title_he?: string;
  title_en?: string | null;
  slug?: string;
  excerpt_he?: string;
  excerpt_en?: string | null;
  body_he?: string;
  body_en?: string | null;
  images?: ImageInput[];
  author?: string;
  status?: string;
  publishedAt?: string | null;
  tagIds?: string[];
};

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const body = (await req.json().catch(() => ({}))) as Payload;
  const existing = await prisma.blogPost.findUnique({
    where: { id: params.id },
    include: { images: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const title_he = (body.title_he ?? existing.title_he).trim();
  const status =
    body.status === "published"
      ? "published"
      : body.status === "draft"
      ? "draft"
      : existing.status;
  const publishedAt =
    body.publishedAt === undefined
      ? status === "published" && !existing.publishedAt
        ? new Date()
        : existing.publishedAt
      : body.publishedAt
      ? new Date(body.publishedAt)
      : null;

  const data = {
    title_he,
    title_en: body.title_en !== undefined ? (body.title_en?.trim() || null) : existing.title_en,
    slug: body.slug?.trim() || existing.slug || makeSlug(title_he),
    excerpt_he: body.excerpt_he !== undefined ? (body.excerpt_he ?? existing.excerpt_he) : existing.excerpt_he,
    excerpt_en: body.excerpt_en !== undefined ? (body.excerpt_en?.trim() || null) : existing.excerpt_en,
    body_he: body.body_he !== undefined ? (body.body_he ?? existing.body_he) : existing.body_he,
    body_en: body.body_en !== undefined ? (body.body_en || null) : existing.body_en,
    author: (body.author ?? existing.author).trim() || "אלון בראל",
    status,
    publishedAt,
  };

  try {
    const post = await prisma.$transaction(async (tx) => {
      const updated = await tx.blogPost.update({
        where: { id: params.id },
        data,
      });
      if (Array.isArray(body.tagIds)) {
        await tx.blogPostTag.deleteMany({ where: { postId: params.id } });
        if (body.tagIds.length) {
          await tx.blogPostTag.createMany({
            data: body.tagIds.map((tagId) => ({ postId: params.id, tagId })),
          });
        }
      }
      if (Array.isArray(body.images)) {
        await tx.blogPostImage.deleteMany({ where: { postId: params.id } });
        const cleaned = body.images
          .filter((i) => i && typeof i.url === "string" && i.url.trim())
          .map((i, idx) => ({
            url: i.url.trim(),
            alt_he: i.alt?.toString().trim() || null,
            order: idx,
            postId: params.id,
          }));
        if (cleaned.length) {
          await tx.blogPostImage.createMany({ data: cleaned });
        }
      }
      return updated;
    });
    if (Array.isArray(body.images)) {
      await deleteRemovedImages(
        existing.images.map((img) => img.url),
        body.images
          .map((i) => (i && typeof i.url === "string" ? i.url.trim() : ""))
          .filter(Boolean)
      );
    }
    return NextResponse.json({ post });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "שגיאה" },
      { status: 400 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const existing = await prisma.blogPost.findUnique({
    where: { id: params.id },
    include: { images: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  await prisma.blogPost.delete({ where: { id: params.id } });
  await deleteStorageObjects(existing.images.map((img) => img.url));
  return NextResponse.json({ ok: true });
}
