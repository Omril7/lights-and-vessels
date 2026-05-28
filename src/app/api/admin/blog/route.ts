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

function normalize(payload: Payload) {
  const title = (payload.title ?? "").trim();
  const excerpt = (payload.excerpt ?? "").trim();
  const body = payload.body ?? "";
  const author = (payload.author ?? "").trim() || "אלון בראל";
  const status = payload.status === "published" ? "published" : "draft";
  const slug = (payload.slug?.trim() || makeSlug(title)) || `post-${Date.now()}`;
  const publishedAt = payload.publishedAt
    ? new Date(payload.publishedAt)
    : status === "published"
    ? new Date()
    : null;
  const images = Array.isArray(payload.images)
    ? payload.images
        .filter((i) => i && typeof i.url === "string" && i.url.trim())
        .map((i, idx) => ({
          url: i.url.trim(),
          alt: i.alt?.toString().trim() || null,
          order: idx,
        }))
    : [];
  return {
    title,
    excerpt,
    body,
    author,
    status,
    slug,
    publishedAt,
    images,
    tagIds: Array.isArray(payload.tagIds) ? payload.tagIds : [],
  };
}

export async function POST(req: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const data = normalize((await req.json().catch(() => ({}))) as Payload);
  if (!data.title) {
    return NextResponse.json({ error: "כותרת חובה" }, { status: 400 });
  }
  if (data.images.length === 0) {
    return NextResponse.json(
      { error: "צריך לפחות תמונה אחת" },
      { status: 400 }
    );
  }

  try {
    const post = await prisma.blogPost.create({
      data: {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        body: data.body,
        author: data.author,
        status: data.status,
        publishedAt: data.publishedAt,
        images: { create: data.images },
        tags: { create: data.tagIds.map((tagId) => ({ tagId })) },
      },
    });
    return NextResponse.json({ post });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "שגיאה" },
      { status: 400 }
    );
  }
}
