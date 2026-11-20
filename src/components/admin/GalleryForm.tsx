"use client";

import { ImageUploader, type UploadedImage } from "@/components/admin/ImageUploader";
import { MarkdownEditor } from "@/components/admin/MarkdownEditor";
import { Button, Input } from "@/components/ui";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

export type GalleryFormValues = {
  id?: string;
  title_he: string;
  title_en: string;
  slug: string;
  description_he: string;
  description_en: string;
  year: number | null;
  published: boolean;
  images: UploadedImage[];
};

const EMPTY: GalleryFormValues = {
  title_he: "",
  title_en: "",
  slug: "",
  description_he: "",
  description_en: "",
  year: new Date().getFullYear(),
  published: false,
  images: [],
};

const card = "border border-charcoal/10 bg-cream p-5 space-y-4";

export function GalleryForm({
  initial,
  mode,
}: {
  initial?: Partial<GalleryFormValues>;
  mode: "create" | "edit";
}) {
  const router = useRouter();
  const [values, setValues] = useState<GalleryFormValues>({ ...EMPTY, ...initial });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const set = <K extends keyof GalleryFormValues>(k: K, v: GalleryFormValues[K]) =>
    setValues((prev) => ({ ...prev, [k]: v }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!values.title_he.trim()) {
      toast.error("חסר: כותרת בעברית");
      return;
    }
    setSaving(true);
    const payload = {
      title_he: values.title_he.trim(),
      title_en: values.title_en.trim() || null,
      slug: values.slug.trim() || undefined,
      description_he: values.description_he.trim() || null,
      description_en: values.description_en.trim() || null,
      year: values.year,
      published: values.published,
      images: values.images,
    };
    const res = await fetch(
      mode === "create" ? "/api/admin/gallery" : `/api/admin/gallery/${initial?.id}`,
      {
        method: mode === "create" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
    setSaving(false);
    if (!res.ok) {
      toast.error("השמירה נכשלה");
      return;
    }
    toast.success("נשמר");
    router.push("/admin/gallery");
    router.refresh();
  }

  async function onDelete() {
    if (mode !== "edit" || !initial?.id) return;
    if (!window.confirm("למחוק את הפרויקט? התמונות שלו יימחקו גם הן.")) return;
    setDeleting(true);
    const res = await fetch(`/api/admin/gallery/${initial.id}`, { method: "DELETE" });
    setDeleting(false);
    if (!res.ok) {
      toast.error("המחיקה נכשלה");
      return;
    }
    toast.success("נמחק");
    router.push("/admin/gallery");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <div className={card}>
            <h2 className="font-serif text-lg text-charcoal">פרטים</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                id="title_he"
                label="כותרת (עברית)"
                value={values.title_he}
                onChange={(e) => set("title_he", e.target.value)}
                required
              />
              <Input
                id="title_en"
                label="Title (English)"
                dir="ltr"
                value={values.title_en}
                onChange={(e) => set("title_en", e.target.value)}
              />
            </div>
            <MarkdownEditor
              locale="he"
              label="תיאור (עברית)"
              value={values.description_he}
              onChange={(v) => set("description_he", v)}
              rows={6}
            />
            <MarkdownEditor
              locale="en"
              label="Description (English)"
              value={values.description_en}
              onChange={(v) => set("description_en", v)}
              rows={6}
            />
          </div>

          <div className={card}>
            <h2 className="font-serif text-lg text-charcoal">תמונות</h2>
            <ImageUploader
              images={values.images}
              onChange={(imgs) => set("images", imgs)}
              folder="gallery"
              hint="התמונה הראשונה היא תמונת השער בגלריה (מומלץ 4:5, לאורך)"
            />
          </div>
        </div>

        <aside className="space-y-6">
          <div className={card}>
            <h2 className="font-serif text-lg text-charcoal">פרסום</h2>
            <label className="flex items-center gap-2 text-sm text-charcoal">
              <input
                type="checkbox"
                checked={values.published}
                onChange={(e) => set("published", e.target.checked)}
                className="accent-charcoal"
              />
              מוצג בגלריה
            </label>
            <Input
              id="year"
              type="number"
              min="1900"
              max="2100"
              label="שנה"
              value={values.year ?? ""}
              onChange={(e) => set("year", e.target.value === "" ? null : Number(e.target.value))}
            />
            <Input
              id="slug"
              label="כתובת (slug)"
              dir="ltr"
              value={values.slug}
              onChange={(e) => set("slug", e.target.value)}
              placeholder="ריק = נוצר מהכותרת"
            />
          </div>
        </aside>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-charcoal/10 pt-6">
        <div>
          {mode === "edit" && (
            <button
              type="button"
              onClick={onDelete}
              disabled={deleting}
              className="text-sm text-terracotta hover:underline disabled:opacity-50"
            >
              {deleting ? "מוחק…" : "מחיקת הפרויקט"}
            </button>
          )}
        </div>
        <Button type="submit" disabled={saving}>
          {saving ? "שומר…" : "שמירה"}
        </Button>
      </div>
    </form>
  );
}
