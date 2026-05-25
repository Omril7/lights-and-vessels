import { ProductForm } from "@/components/admin/ProductForm";

export const metadata = { title: "מוצר חדש" };

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-wider2 text-charcoal/50">
          מוצרים
        </p>
        <h1 className="mt-1 font-serif text-3xl text-charcoal">מוצר חדש</h1>
      </header>
      <ProductForm mode="create" />
    </div>
  );
}
