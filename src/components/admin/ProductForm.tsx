"use client";

import { ImageUploader, type UploadedImage } from "@/components/admin/ImageUploader";
import { MarkdownEditor } from "@/components/admin/MarkdownEditor";
import { Button, Dropdown, Input, LocalizedInput } from "@/components/ui";
import type { ProductFormOptions } from "@/lib/product-options";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

export type ProductFormValues = {
  id?: string;
  name_he: string;
  name_en: string;
  slug: string;
  description_he: string;
  description_en: string;
  price: number;
  comparePrice: number | null;
  category: string | null;
  tagIds: string[];
  materials_he: string;
  materials_en: string;
  width: number | null;
  height: number | null;
  depth: number | null;
  stockCount: number;
  inStock: boolean;
  featured: boolean;
  published: boolean;
  images: UploadedImage[];
};

const EMPTY: ProductFormValues = {
  name_he: "",
  name_en: "",
  slug: "",
  description_he: "",
  description_en: "",
  price: 0,
  comparePrice: null,
  category: null,
  tagIds: [],
  materials_he: "",
  materials_en: "",
  width: null,
  height: null,
  depth: null,
  stockCount: 0,
  inStock: true,
  featured: false,
  published: false,
  images: [],
};

const card =
  "rounded-2xl border border-charcoal/10 bg-cream p-5 space-y-4 shadow-soft";
const fieldLabel =
  "text-xs uppercase tracking-wider2 text-charcoal/70 font-medium";

export function ProductForm({
  initial,
  mode,
  options,
}: {
  initial?: Partial<ProductFormValues>;
  mode: "create" | "edit";
  options: ProductFormOptions;
}) {
  const router = useRouter();
  const [values, setValues] = useState<ProductFormValues>({
    ...EMPTY,
    ...initial,
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const set = <K extends keyof ProductFormValues>(
    k: K,
    v: ProductFormValues[K]
  ) => setValues((prev) => ({ ...prev, [k]: v }));

  const toggleTag = (id: string) =>
    set(
      "tagIds",
      values.tagIds.includes(id)
        ? values.tagIds.filter((t) => t !== id)
        : [...values.tagIds, id]
    );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const missing = (
      [
        [values.name_he, "שם המוצר בעברית"],
        [values.name_en, "שם המוצר באנגלית"],
        [values.description_he, "תיאור בעברית"],
        [values.description_en, "תיאור באנגלית"],
      ] as const
    ).find(([v]) => !v.trim());
    if (missing) {
      toast.error(`חסר: ${missing[1]}`);
      return;
    }
    if (values.price < 0) {
      toast.error("מחיר לא תקין");
      return;
    }

    setSaving(true);
    const payload = {
      name_he: values.name_he.trim(),
      name_en: values.name_en.trim(),
      // Empty slug: the server derives it from the English name, or the product ID.
      slug: values.slug.trim() || undefined,
      description_he: values.description_he.trim(),
      description_en: values.description_en.trim(),
      price: Number(values.price),
      comparePrice:
        values.comparePrice == null || Number.isNaN(values.comparePrice)
          ? null
          : Number(values.comparePrice),
      category: values.category || null,
      tagIds: values.tagIds,
      materials_he: values.materials_he.trim() || null,
      materials_en: values.materials_en.trim() || null,
      width: values.width,
      height: values.height,
      depth: values.depth,
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
        const detail =
          res.status === 409
            ? "כתובת הדף כבר בשימוש במוצר אחר"
            : err.error || "שגיאה בשמירה";
        throw new Error(detail);
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
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || "שגיאה במחיקה");
      }
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
          <div className={card}>
            <h2 className="font-serif text-lg text-charcoal">פרטי המוצר</h2>
            <p className="text-xs text-charcoal/50">
              שדות המסומנים ב-* חובה בשתי השפות.
            </p>

            <div className="grid sm:grid-cols-2 gap-3">
              <LocalizedInput
                id="name-he"
                locale="he"
                label="שם המוצר *"
                value={values.name_he}
                onChange={(e) => set("name_he", e.target.value)}
                placeholder="שם בעברית"
                required
              />
              <LocalizedInput
                id="name-en"
                locale="en"
                label="Product Name *"
                value={values.name_en}
                onChange={(e) => set("name_en", e.target.value)}
                placeholder="Name in English"
                required
              />
            </div>

            <Input
              id="slug"
              label="כתובת הדף באתר"
              value={values.slug}
              onChange={(e) => set("slug", e.target.value)}
              dir="ltr"
              placeholder="ריק = נוצר אוטומטית מהשם באנגלית"
            />

            <MarkdownEditor
              locale="he"
              label="תיאור *"
              value={values.description_he}
              onChange={(v) => set("description_he", v)}
              rows={8}
              placeholder="כתבו תיאור עשיר…  שורות חדשות, **מודגש**, *נטוי*, ## כותרת, - רשימה"
            />
            <MarkdownEditor
              locale="en"
              label="Description *"
              value={values.description_en}
              onChange={(v) => set("description_en", v)}
              rows={6}
              placeholder="Write the English description…"
            />
          </div>

          <div className={card}>
            <h2 className="font-serif text-lg text-charcoal">תמונות</h2>
            <ImageUploader
              images={values.images}
              onChange={(imgs) => set("images", imgs)}
              hint="מומלץ: 1200×1500 פיקסל (יחס 4:5, לאורך)"
            />
          </div>

          <div className={card}>
            <h2 className="font-serif text-lg text-charcoal">מידות וחומרים</h2>
            <div className="grid grid-cols-3 gap-3">
              {(
                [
                  ["width", "רוחב (ס״מ)"],
                  ["height", "גובה (ס״מ)"],
                  ["depth", "עומק (ס״מ)"],
                ] as const
              ).map(([key, label]) => (
                <Input
                  key={key}
                  id={key}
                  type="number"
                  step="0.1"
                  min="0"
                  label={label}
                  value={values[key] ?? ""}
                  onChange={(e) =>
                    set(key, e.target.value === "" ? null : Number(e.target.value))
                  }
                />
              ))}
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <LocalizedInput
                id="materials-he"
                locale="he"
                label="חומרים"
                value={values.materials_he}
                onChange={(e) => set("materials_he", e.target.value)}
                placeholder="קרמיקה, זכוכית, כסף 925"
              />
              <LocalizedInput
                id="materials-en"
                locale="en"
                label="Materials"
                value={values.materials_en}
                onChange={(e) => set("materials_en", e.target.value)}
                placeholder="Ceramic, glass, sterling silver"
              />
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <div className={card}>
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
              label="מחיר לפני הנחה (₪)"
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

          <div className={card}>
            <h2 className="font-serif text-lg text-charcoal">קטגוריה ותגיות</h2>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className={fieldLabel}>קטגוריה</span>
                <Link
                  href="/admin/products/categories"
                  className="text-xs text-copper hover:underline"
                >
                  ניהול קטגוריות
                </Link>
              </div>
              <Dropdown
                variant="field"
                ariaLabel="קטגוריה"
                value={values.category ?? ""}
                onChange={(v) => set("category", v || null)}
                options={[
                  { value: "", label: "ללא קטגוריה" },
                  ...options.categories.map((c) => ({
                    value: c.slug,
                    label: c.name_en ? `${c.name_he} · ${c.name_en}` : c.name_he,
                  })),
                ]}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className={fieldLabel}>תגיות</span>
                <Link
                  href="/admin/products/tags"
                  className="text-xs text-copper hover:underline"
                >
                  ניהול תגיות
                </Link>
              </div>
              {options.tags.length === 0 ? (
                <p className="text-sm text-charcoal/50">
                  אין עדיין תגיות. אפשר להוסיף בדף ניהול התגיות.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {options.tags.map((tag) => {
                    const on = values.tagIds.includes(tag.id);
                    return (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => toggleTag(tag.id)}
                        aria-pressed={on}
                        className={cn(
                          "rounded-full border px-3 py-1 text-sm transition-colors",
                          on
                            ? "border-charcoal bg-charcoal text-cream"
                            : "border-charcoal/20 text-charcoal/80 hover:bg-charcoal/[0.06]"
                        )}
                      >
                        {tag.name_he}
                        {tag.name_en && (
                          <span className="opacity-60"> · {tag.name_en}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
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
              מוצג בדף הבית
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
