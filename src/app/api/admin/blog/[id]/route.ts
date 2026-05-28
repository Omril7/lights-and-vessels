import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { makeSlug } from "@/lib/utils";

export const dynamic = "force-dynamic";

type ImageInput = { url: string; alt?: string | null };

type Payload = {
  title?: string;
  slug?: string;
  excerpt?: string;
  body?: string;
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
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const title = (body.title ?? existing.title).trim();
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
    title,
    slug: body.slug?.trim() || existing.slug || makeSlug(title),
    excerpt: body.excerpt ?? existing.excerpt,
    body: body.body ?? existing.body,
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
            alt: i.alt?.toString().trim() || null,
            order: idx,
            postId: params.id,
          }));
        if (cleaned.length) {
          await tx.blogPostImage.createMany({ data: cleaned });
        }
      }
      return updated;
    });
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
  await prisma.blogPost.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
