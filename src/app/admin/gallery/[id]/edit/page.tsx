import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { GalleryForm } from "@/components/admin/GalleryForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "עריכת פרויקט" };

export default async function EditGalleryProjectPage({ params }: { params: { id: string } }) {
  const project = await prisma.galleryProject.findUnique({
    where: { id: params.id },
    include: { images: { orderBy: { order: "asc" } } },
  });
  if (!project) notFound();

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl text-charcoal">{project.title_he}</h1>
      <GalleryForm
        mode="edit"
        initial={{
          id: project.id,
          title_he: project.title_he,
          title_en: project.title_en ?? "",
          slug: project.slug,
          description_he: project.description_he ?? "",
          description_en: project.description_en ?? "",
          year: project.year,
          published: project.published,
          images: project.images.map((i) => ({ url: i.url, alt: i.alt_he })),
        }}
      />
    </div>
  );
}
