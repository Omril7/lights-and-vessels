import { GalleryForm } from "@/components/admin/GalleryForm";

export const metadata = { title: "פרויקט חדש" };

export default function NewGalleryProjectPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl text-charcoal">פרויקט חדש</h1>
      <GalleryForm mode="create" />
    </div>
  );
}
