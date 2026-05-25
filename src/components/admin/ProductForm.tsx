"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { ImageUploader, type UploadedImage } from "@/components/admin/ImageUploader";
import { CATEGORIES } from "@/types";
import { renderMarkdown, makeSlug, cn } from "@/lib/utils";

export type ProductFormValues = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  comparePrice: number | null;
  category: string;
  tags: string;
  stockCount: number;
  inStock: boolean;
  featured: boolean;
  published: boolean;
  images: UploadedImage[];
};

const EMPTY: ProductFormValues = {
  name: "",
  slug: "",
  description: "",
  price: 0,
  comparePrice: null,
  category: CATEGORIES[0]?.slug ?? "rings",
  tags: "",
  stockCount: 0,
  inStock: true,
  featured: false,
  published: false,
  images: [],
};

export function ProductForm({
  initial,
  mode,
}: {
  initial?: Partial<ProductFormValues>;
  mode: "create" | "edit";
}) {
  const router = useRouter();
  const [values, setValues] = useState<ProductFormValues>({
    ...EMPTY,
    ...initial,
  });
  const [slugTouched, setSlugTouched] = useState(!!initial?.slug);
  const [descTab, setDescTab] = useState<"edit" | "preview">("edit");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const set = <K extends keyof ProductFormValues>(
    k: K,
    v: ProductFormValues[K]
  ) => setValues((prev) => ({ ...prev, [k]: v }));

  const onNameChange = (name: string) => {
    setValues((prev) => ({
      ...prev,
      name,
      slug: slugTouched ? prev.slug : makeSlug(name),
    }));
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!values.name.trim()) {
      toast.error("שם המוצר חובה");
      return;
    }
    if (values.price < 0) {
      toast.error("מחיר לא תקין");
      return;
    }

    setSaving(true);
    const payload = {
      name: values.name.trim(),
      slug: values.slug.trim() || makeSlug(values.name),
      description: values.description,
      price: Number(values.price),
      comparePrice:
        values.comparePrice == null || Number.isNaN(values.comparePrice)
          ? null
          : Number(values.comparePrice),
      category: values.category,
      tags: values.tags || null,
      stockCount: Number(values.stockCount) | 0,
      inStock: values.inStock,
      featured: values.featured,
      published: values.published,
      images: values.images,
    };

    const url =
      mode === "create" ? "/api/products" : `/api/products/${initial?.id}`;
    const method = mode === "create" ? "POST" : "PUT";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "שגיאה בשמירה");
      }
      toast.success(mode === "create" ? "המוצר נוצר" : "המוצר עודכן");
      router.push("/admin/products");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "שגיאה בשמירה");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    if (mode !== "edit" || !initial?.id) return;
    if (!confirm("למחוק את המוצר? פעולה זו לא ניתנת לביטול.")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/products/${initial.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("שגיאה במחיקה");
      toast.success("המוצר נמחק");
      router.push("/admin/products");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "שגיאה");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <div className="grid lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-charcoal/10 bg-cream p-5 space-y-4 shadow-soft">
            <h2 className="font-serif text-lg text-charcoal">פרטי המוצר</h2>
            <Input
              id="name"
              label="שם המוצר"
              value={values.name}
              onChange={(e) => onNameChange(e.target.value)}
              required
            />
            <Input
              id="slug"
              label="כתובת (slug)"
              value={values.slug}
              onChange={(e) => {
                setSlugTouched(true);
                set("slug", e.target.value);
              }}
              dir="ltr"
              placeholder="auto-generated-from-name"
            />

            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider2 text-charcoal/70 font-medium">
                  תיאור (Markdown)
                </span>
                <div className="flex gap-1 text-xs">
                  <button
                    type="button"
                    onClick={() => setDescTab("edit")}
                    className={cn(
                      "rounded-full px-3 py-1",
                      descTab === "edit"
                        ? "bg-charcoal text-cream"
                        : "text-charcoal/60 hover:bg-charcoal/[0.06]"
                    )}
                  >
                    עריכה
                  </button>
                  <button
                    type="button"
                    onClick={() => setDescTab("preview")}
                    className={cn(
                      "rounded-full px-3 py-1",
                      descTab === "preview"
                        ? "bg-charcoal text-cream"
                        : "text-charcoal/60 hover:bg-charcoal/[0.06]"
                    )}
                  >
                    תצוגה מקדימה
                  </button>
                </div>
              </div>
              {descTab === "edit" ? (
                <textarea
                  value={values.description}
                  onChange={(e) => set("description", e.target.value)}
                  rows={2}
                  className="mt-1.5 w-full rounded-xl border border-charcoal/20 bg-cream p-3 font-sans text-sm focus:outline-none focus:border-charcoal/60 focus:ring-2 focus:ring-gold/30"
                  placeholder="כתבו תיאור עשיר…  שורות חדשות, **מודגש**, *נטוי*, ## כותרת, - רשימה"
                />
              ) : (
                <div
                  className="mt-1.5 min-h-[12rem] rounded-xl border border-charcoal/10 bg-linen/60 p-4 prose-product"
                  dangerouslySetInnerHTML={{
                    __html:
                      renderMarkdown(values.description) ||
                      '<p class="text-charcoal/40">אין תוכן עדיין.</p>',
                  }}
                />
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-charcoal/10 bg-cream p-5 space-y-4 shadow-soft">
            <h2 className="font-serif text-lg text-charcoal">תמונות</h2>
            <ImageUploader
              images={values.images}
              onChange={(imgs) => set("images", imgs)}
            />
          </div>
        </section>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-charcoal/10 bg-cream p-5 space-y-4 shadow-soft">
            <h2 className="font-serif text-lg text-charcoal">מחיר ומלאי</h2>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              label="מחיר (₪)"
              value={values.price}
              onChange={(e) => set("price", Number(e.target.value))}
              required
            />
            <Input
              id="comparePrice"
              type="number"
              step="0.01"
              min="0"
              label="מחיר מקורי (לבדיקות מבצע)"
              value={values.comparePrice ?? ""}
              onChange={(e) =>
                set(
                  "comparePrice",
                  e.target.value === "" ? null : Number(e.target.value)
                )
              }
              placeholder="ריק = אין מבצע"
            />
            <Input
              id="stockCount"
              type="number"
              step="1"
              min="0"
              label="מלאי"
              value={values.stockCount}
              onChange={(e) => set("stockCount", Number(e.target.value))}
            />
            <label className="flex items-center gap-2 text-sm text-charcoal">
              <input
                type="checkbox"
                checked={values.inStock}
                onChange={(e) => set("inStock", e.target.checked)}
                className="accent-charcoal"
              />
              במלאי
            </label>
          </div>

          <div className="rounded-2xl border border-charcoal/10 bg-cream p-5 space-y-4 shadow-soft">
            <h2 className="font-serif text-lg text-charcoal">סיווג</h2>
            <Select
              id="category"
              label="קטגוריה"
              value={values.category}
              onChange={(e) => set("category", e.target.value)}
            >
              {CATEGORIES.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.label}
                </option>
              ))}
            </Select>
            <Input
              id="tags"
              label="תגיות (מופרדות בפסיק)"
              value={values.tags}
              onChange={(e) => set("tags", e.target.value)}
              placeholder="כסף, מינימלי, יומיומי"
            />
          </div>

          <div className="rounded-2xl border border-charcoal/10 bg-cream p-5 space-y-3 shadow-soft">
            <h2 className="font-serif text-lg text-charcoal">תצוגה</h2>
            <label className="flex items-center gap-2 text-sm text-charcoal">
              <input
                type="checkbox"
                checked={values.published}
                onChange={(e) => set("published", e.target.checked)}
                className="accent-charcoal"
              />
              מפורסם באתר
            </label>
            <label className="flex items-center gap-2 text-sm text-charcoal">
              <input
                type="checkbox"
                checked={values.featured}
                onChange={(e) => set("featured", e.target.checked)}
                className="accent-charcoal"
              />
              מוצג בדף הבית (Featured)
            </label>
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
              {deleting ? "מוחק…" : "מחיקת המוצר"}
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <Button href="/admin/products" variant="outline" size="sm">
            ביטול
          </Button>
          <Button type="submit" disabled={saving} size="sm">
            {saving ? "שומר…" : mode === "create" ? "יצירה" : "שמירת שינויים"}
          </Button>
        </div>
      </div>
    </form>
  );
}
