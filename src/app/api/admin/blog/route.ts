import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { makeSlug } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Payload = {
  title?: string;
  slug?: string;
  excerpt?: string;
  body?: string;
  coverImage?: string;
  coverAlt?: string | null;
  author?: string;
  status?: string;
  publishedAt?: string | null;
  tagIds?: string[];
};

function normalize(payload: Payload) {
  const title = (payload.title ?? "").trim();
  const excerpt = (payload.excerpt ?? "").trim();
  const body = payload.body ?? "";
  const coverImage = (payload.coverImage ?? "").trim();
  const author = (payload.author ?? "").trim() || "אלון בראל";
  const status = payload.status === "published" ? "published" : "draft";
  const slug = (payload.slug?.trim() || makeSlug(title)) || `post-${Date.now()}`;
  const publishedAt = payload.publishedAt
    ? new Date(payload.publishedAt)
    : status === "published"
    ? new Date()
    : null;
  return {
    title,
    excerpt,
    body,
    coverImage,
    coverAlt: payload.coverAlt?.trim() || null,
    author,
    status,
    slug,
    publishedAt,
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
  if (!data.coverImage) {
    return NextResponse.json({ error: "תמונת כותרת חובה" }, { status: 400 });
  }

  try {
    const post = await prisma.blogPost.create({
      data: {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        body: data.body,
        coverImage: data.coverImage,
        coverAlt: data.coverAlt,
        author: data.author,
        status: data.status,
        publishedAt: data.publishedAt,
        tags: {
          create: data.tagIds.map((tagId) => ({ tagId })),
        },
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
