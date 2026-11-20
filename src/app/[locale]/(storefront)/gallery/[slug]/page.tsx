import type { Metadata } from "next";
import Image from "next/image";
import { cache } from "react";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { Link } from "@/i18n/navigation";
import { alternatesFor } from "@/lib/seo";
import { localize, renderMarkdown } from "@/lib/utils";

export const dynamic = "force-dynamic";

const getProject = cache(async (slug: string) =>
  prisma.galleryProject.findFirst({
    where: { slug, published: true },
    include: { images: { orderBy: { order: "asc" } } },
  })
);

export async function generateMetadata({
  params,
}: {
  params: { locale: string; slug: string };
}): Promise<Metadata> {
  const project = await getProject(params.slug);
  if (!project) return {};
  return {
    title: localize(project, "title", params.locale),
    alternates: alternatesFor(params.locale, `/gallery/${project.slug}`),
    openGraph: project.images[0] ? { images: [{ url: project.images[0].url }] } : undefined,
  };
}

/** One gallery project: title, year, text, then its photos in a single column. */
export default async function GalleryProjectPage({ params }: { params: { slug: string } }) {
  const [project, locale, t] = await Promise.all([
    getProject(params.slug),
    getLocale(),
    getTranslations("gallery"),
  ]);
  if (!project) notFound();

  const title = localize(project, "title", locale);
  const description = project.description_he ? localize(project, "description", locale) : "";

  return (
    <article className="paper-grain px-5 pb-10 pt-12 sm:px-[5vw]">
      <div className="mx-auto flex w-[min(720px,100%)] flex-col gap-10">
        <header className="flex flex-col gap-3 text-center">
          <h1 className="font-serif text-5xl font-medium leading-none text-ink">{title}</h1>
          {project.year && <p className="text-sm font-light text-ink-2">{project.year}</p>}
        </header>

        {description && (
          <div
            className="prose-art text-[1.02rem] font-light text-ink-2"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(description) }}
          />
        )}

        <div className="flex flex-col gap-6">
          {project.images.map((img, i) => (
            <div key={img.id} className="relative aspect-[4/5] w-full overflow-hidden bg-sand">
              <Image
                src={img.url}
                alt={localize(img, "alt", locale) || title}
                fill
                priority={i === 0}
                sizes="(max-width: 760px) 100vw, 720px"
                className="object-cover"
              />
            </div>
          ))}
        </div>

        <Link
          href="/gallery"
          className="ink self-center border-[1.5px] border-stamp px-6 py-3 text-sm font-bold text-stamp transition-opacity hover:opacity-70"
        >
          {t("back")}
        </Link>
      </div>
    </article>
  );
}
