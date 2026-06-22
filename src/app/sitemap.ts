import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const LOCALES = ["he", "en"] as const;

const site =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://lights-and-vessels.vercel.app";

function alternate(path: string) {
  return Object.fromEntries(LOCALES.map((l) => [l, `${site}/${l}${path}`]));
}

function bothLocales(
  path: string,
  opts: {
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
    priority: number;
    lastModified?: Date;
  },
): MetadataRoute.Sitemap {
  return LOCALES.map((locale) => ({
    url: `${site}/${locale}${path}`,
    lastModified: opts.lastModified,
    changeFrequency: opts.changeFrequency,
    priority: opts.priority,
    alternates: { languages: alternate(path) },
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, posts] = await Promise.all([
    prisma.product.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
    }),
    prisma.blogPost.findMany({
      where: { status: "published", publishedAt: { lte: new Date() } },
      select: { slug: true, publishedAt: true, updatedAt: true },
    }),
  ]);

  const staticRoutes = [
    ...bothLocales("", { changeFrequency: "weekly", priority: 1 }),
    ...bothLocales("/shop", { changeFrequency: "daily", priority: 0.9 }),
    ...bothLocales("/about", { changeFrequency: "monthly", priority: 0.6 }),
    ...bothLocales("/blog", { changeFrequency: "weekly", priority: 0.7 }),
    ...bothLocales("/legal/terms", { changeFrequency: "yearly", priority: 0.3 }),
    ...bothLocales("/legal/privacy", { changeFrequency: "yearly", priority: 0.3 }),
    ...bothLocales("/legal/returns", { changeFrequency: "yearly", priority: 0.3 }),
    ...bothLocales("/legal/shipping", { changeFrequency: "yearly", priority: 0.3 }),
    ...bothLocales("/legal/accessibility", { changeFrequency: "yearly", priority: 0.3 }),
  ];

  const productRoutes = products.flatMap((p) =>
    bothLocales(`/shop/${p.slug}`, {
      changeFrequency: "weekly",
      priority: 0.8,
      lastModified: p.updatedAt,
    }),
  );

  const blogRoutes = posts.flatMap((p) =>
    bothLocales(`/blog/${p.slug}`, {
      changeFrequency: "monthly",
      priority: 0.6,
      lastModified: p.updatedAt,
    }),
  );

  return [...staticRoutes, ...productRoutes, ...blogRoutes];
}
