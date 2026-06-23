"use client";

import { ImageUploader, type UploadedImage } from "@/components/admin/ImageUploader";
import { MarkdownEditor } from "@/components/admin/MarkdownEditor";
import { Button, DateTimePicker, Dropdown, Input, LocalizedInput, LocalizedTextarea } from "@/components/ui";
import { cn, makeSlug } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

export type BlogFormValues = {
  id?: string;
  title_he: string;
  title_en: string;
  slug: string;
  excerpt_he: string;
  excerpt_en: string;
  body_he: string;
  body_en: string;
  images: UploadedImage[];
  author: string;
  status: "draft" | "published";
  publishedAt: string;
  tagIds: string[];
};

const EMPTY: BlogFormValues = {
  title_he: "",
  title_en: "",
  slug: "",
  excerpt_he: "",
  excerpt_en: "",
  body_he: "",
  body_en: "",
  images: [],
  author: "אלון בראל",
  status: "draft",
  publishedAt: "",
  tagIds: [],
};

export function BlogForm({
  initial,
  mode,
  tags,
}: {
  initial?: Partial<BlogFormValues>;
  mode: "create" | "edit";
  tags: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [values, setValues] = useState<BlogFormValues>({ ...EMPTY, ...initial });
  const [slugTouched, setSlugTouched] = useState(!!initial?.slug);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const set = <K extends keyof BlogFormValues>(k: K, v: BlogFormValues[K]) =>
    setValues((prev) => ({ ...prev, [k]: v }));

  const onTitleChange = (title_he: string) =>
    setValues((p) => ({
      ...p,
      title_he,
      slug: slugTouched ? p.slug : makeSlug(title_he),
    }));

  function toggleTag(id: string) {
    set(
      "tagIds",
      values.tagIds.includes(id)
        ? values.tagIds.filter((x) => x !== id)
        : [...values.tagIds, id]
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!values.title_he.trim()) {
      toast.error("כותרת חובה");
      return;
    }
    if (values.images.length === 0) {
      toast.error("צריך לפחות תמונה אחת");
      return;
    }
    setSaving(true);
    const payload = {
      title_he: values.title_he.trim(),
      title_en: values.title_en.trim() || null,
      slug: values.slug.trim() || makeSlug(values.title_he),
      excerpt_he: values.excerpt_he.trim(),
      excerpt_en: values.excerpt_en.trim() || null,
      body_he: values.body_he,
      body_en: values.body_en || null,
      images: values.images,
      author: values.author.trim() || "אלון בראל",
      status: values.status,
      publishedAt: values.publishedAt
        ? new Date(values.publishedAt).toISOString()
        : null,
      tagIds: values.tagIds,
    };
    const url =
      mode === "create" ? "/api/admin/blog" : `/api/admin/blog/${initial?.id}`;
    const method = mode === "create" ? "POST" : "PATCH";
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "שגיאה");
      toast.success(mode === "create" ? "הפוסט נוצר" : "הפוסט עודכן");
      router.push("/admin/blog");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "שגיאה");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    if (mode !== "edit" || !initial?.id) return;
    if (!confirm("למחוק את הפוסט?")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/blog/${initial.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("שגיאה");
      toast.success("נמחק");
      router.push("/admin/blog");
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
            <h2 className="font-serif text-lg text-charcoal">פרטי הפוסט</h2>

            <div className="grid sm:grid-cols-2 gap-3">
              <LocalizedInput
                id="title-he"
                locale="he"
                label="כותרת"
                value={values.title_he}
                onChange={(e) => onTitleChange(e.target.value)}
                placeholder="כותרת בעברית"
                required
              />
              <LocalizedInput
                id="title-en"
                locale="en"
                label="Title"
                value={values.title_en}
                onChange={(e) => set("title_en", e.target.value)}
                placeholder="Title in English"
              />
            </div>

            <Input
              id="slug"
              label="כתובת (slug)"
              value={values.slug}
              dir="ltr"
              onChange={(e) => {
                setSlugTouched(true);
                set("slug", e.target.value);
              }}
              placeholder="auto-generated-from-title"
            />

            <div className="grid sm:grid-cols-2 gap-3">
              <LocalizedTextarea
                id="excerpt-he"
                locale="he"
                label="תקציר"
                value={values.excerpt_he}
                onChange={(e) => set("excerpt_he", e.target.value)}
                rows={2}
                placeholder="תקציר בעברית"
              />
              <LocalizedTextarea
                id="excerpt-en"
                locale="en"
                label="Excerpt"
                value={values.excerpt_en}
                onChange={(e) => set("excerpt_en", e.target.value)}
                rows={2}
                placeholder="Excerpt in English"
              />
            </div>

            {/* Body — Hebrew + English */}
            <MarkdownEditor
              locale="he"
              label="תוכן"
              value={values.body_he}
              onChange={(v) => set("body_he", v)}
              rows={16}
              placeholder="כתבו פוסט עשיר…  **מודגש**, *נטוי*, ## כותרת, - רשימה, [קישור](https://…), ![תיאור](url-תמונה)"
            />
            <MarkdownEditor
              locale="en"
              label="Content"
              value={values.body_en}
              onChange={(v) => set("body_en", v)}
              rows={10}
              placeholder="Write the full post in English…"
            />
          </div>

          <div className="rounded-2xl border border-charcoal/10 bg-cream p-5 space-y-4 shadow-soft">
            <h2 className="font-serif text-lg text-charcoal">תמונות</h2>
            <p className="text-xs text-charcoal/60">
              התמונה הראשונה תשמש ככריכה. ניתן לסדר מחדש בגרירה.
            </p>
            <ImageUploader
              folder="blog"
              images={values.images}
              onChange={(imgs) => set("images", imgs)}
              hint="מומלץ: 1600×900 פיקסל (יחס 16:9, לרוחב)"
            />
          </div>
        </section>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-charcoal/10 bg-cream p-5 space-y-4 shadow-soft">
            <h2 className="font-serif text-lg text-charcoal">פרסום</h2>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs uppercase tracking-wider2 text-charcoal/70 font-medium">
                סטטוס
              </label>
              <Dropdown
                ariaLabel="סטטוס"
                variant="field"
                value={values.status}
                options={[
                  { value: "draft", label: "טיוטה" },
                  { value: "published", label: "מפורסם" },
                ]}
                onChange={(v) => set("status", v as "draft" | "published")}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="publishedAt"
                className="text-xs uppercase tracking-wider2 text-charcoal/70 font-medium"
              >
                תאריך פרסום
              </label>
              <DateTimePicker
                id="publishedAt"
                ariaLabel="תאריך פרסום"
                value={values.publishedAt}
                onChange={(v) => set("publishedAt", v)}
              />
              <p className="text-xs text-charcoal/50">
                ריק = עכשיו (כשעוברים למפורסם).
              </p>
            </div>
            <Input
              id="author"
              label="פורסם על ידי"
              value={values.author}
              onChange={(e) => set("author", e.target.value)}
            />
          </div>

          <div className="rounded-2xl border border-charcoal/10 bg-cream p-5 space-y-3 shadow-soft">
            <h2 className="font-serif text-lg text-charcoal">תגיות</h2>
            {tags.length === 0 ? (
              <p className="text-sm text-charcoal/50">
                אין עדיין תגיות.{" "}
                <a
                  href="/admin/blog/tags"
                  className="text-copper hover:underline"
                >
                  הוסיפו תגיות
                </a>
                .
              </p>
            ) : (
              <ul className="flex flex-wrap gap-2">
                {tags.map((t) => {
                  const active = values.tagIds.includes(t.id);
                  return (
                    <li key={t.id}>
                      <button
                        type="button"
                        onClick={() => toggleTag(t.id)}
                        className={cn(
                          "rounded-full border px-3 py-1 text-sm transition-colors",
                          active
                            ? "border-charcoal bg-charcoal text-cream"
                            : "border-charcoal/25 text-charcoal hover:border-charcoal"
                        )}
                      >
                        {t.name}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
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
              {deleting ? "מוחק…" : "מחיקת הפוסט"}
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <Button href="/admin/blog" variant="outline" size="sm">
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
