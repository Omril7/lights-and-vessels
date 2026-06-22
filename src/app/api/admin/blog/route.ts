import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { makeSlug } from "@/lib/utils";

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

function normalize(payload: Payload) {
  const title_he = (payload.title_he ?? "").trim();
  const title_en = payload.title_en?.trim() || null;
  const excerpt_he = (payload.excerpt_he ?? "").trim();
  const excerpt_en = payload.excerpt_en?.trim() || null;
  const body_he = payload.body_he ?? "";
  const body_en = payload.body_en || null;
  const author = (payload.author ?? "").trim() || "אלון בראל";
  const status = payload.status === "published" ? "published" : "draft";
  const slug = (payload.slug?.trim() || makeSlug(title_he)) || `post-${Date.now()}`;
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
          alt_he: i.alt?.toString().trim() || null,
          order: idx,
        }))
    : [];
  return {
    title_he,
    title_en,
    excerpt_he,
    excerpt_en,
    body_he,
    body_en,
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
  if (!data.title_he) {
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
        title_he: data.title_he,
        title_en: data.title_en,
        slug: data.slug,
        excerpt_he: data.excerpt_he,
        excerpt_en: data.excerpt_en,
        body_he: data.body_he,
        body_en: data.body_en,
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
