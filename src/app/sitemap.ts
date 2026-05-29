import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://lights-and-vessels.vercel.app";

  const products = await prisma.product.findMany({
    where: { published: true },
    select: { slug: true, updatedAt: true },
  });

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${site}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${site}/shop`, changeFrequency: "daily", priority: 0.9 },
    { url: `${site}/about`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${site}/legal/terms`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${site}/legal/privacy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${site}/legal/returns`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${site}/legal/shipping`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${site}/legal/accessibility`, changeFrequency: "yearly", priority: 0.3 },
  ];

  const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${site}/shop/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...productRoutes];
}
