import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { getSiteContent } from "@/lib/content";
import { Entry } from "@/components/storefront/Entry";
import { alternatesFor } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  return { alternates: alternatesFor(params.locale, "/") };
}

export default async function EntryPage() {
  const locale = await getLocale();
  const content = await getSiteContent({ locale });

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://lights-and-vessels.vercel.app";
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "אורות וכלים",
    url: siteUrl,
    logo: `${siteUrl}/logo-2169x1282-black.png`,
  };

  // Each door's photo falls back to the main entry photo until one is set.
  const base = content.hero_image;
  const images = {
    none: base,
    store: content.entry_image_store || base,
    gallery: content.entry_image_gallery || base,
    about: content.entry_image_about || base,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />
      <Entry line={content.hero_title} images={images} />
    </>
  );
}
