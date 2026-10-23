import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getProductFormOptions } from "@/lib/product-options";
import { ProductForm } from "@/components/admin/ProductForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "עריכת מוצר" };

export default async function EditProductPage({
  params,
}: {
  params: { id: string };
}) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: {
      images: { orderBy: { order: "asc" } },
      tags: { select: { tagId: true } },
    },
  });
  if (!product) notFound();
  const options = await getProductFormOptions();

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-wider2 text-charcoal/50">
          מוצרים
        </p>
        <h1 className="mt-1 font-serif text-3xl text-charcoal">
          {product.name_he}
        </h1>
      </header>
      <ProductForm
        mode="edit"
        options={options}
        initial={{
          id: product.id,
          name_he: product.name_he,
          name_en: product.name_en ?? "",
          slug: product.slug,
          description_he: product.description_he,
          description_en: product.description_en ?? "",
          price: product.price,
          comparePrice: product.comparePrice,
          category: product.category ?? "",
          tagIds: product.tags.map((t) => t.tagId),
          materials_he: product.materials_he ?? "",
          materials_en: product.materials_en ?? "",
          width: product.width,
          height: product.height,
          depth: product.depth,
          stockCount: product.stockCount,
          inStock: product.inStock,
          featured: product.featured,
          published: product.published,
          images: product.images.map((i) => ({ url: i.url, alt: i.alt_he })),
        }}
      />
    </div>
  );
}
