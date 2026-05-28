"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Dropdown } from "@/components/ui/Dropdown";
import { DateTimePicker } from "@/components/ui/DateTimePicker";
import { makeSlug, cn } from "@/lib/utils";
import { Markdown, MarkdownCheatSheet } from "@/components/ui/Markdown";
import {
  ImageUploader,
  type UploadedImage,
} from "@/components/admin/ImageUploader";

export type BlogFormValues = {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  images: UploadedImage[];
  author: string;
  status: "draft" | "published";
  publishedAt: string;
  tagIds: string[];
};

const EMPTY: BlogFormValues = {
  title: "",
  slug: "",
  excerpt: "",
  body: "",
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
  const [bodyTab, setBodyTab] = useState<"edit" | "preview">("edit");
  const [showBodyHelp, setShowBodyHelp] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const set = <K extends keyof BlogFormValues>(k: K, v: BlogFormValues[K]) =>
    setValues((prev) => ({ ...prev, [k]: v }));

  const onTitleChange = (title: string) =>
    setValues((p) => ({
      ...p,
      title,
      slug: slugTouched ? p.slug : makeSlug(title),
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
    if (!values.title.trim()) {
      toast.error("כותרת חובה");
      return;
    }
    if (values.images.length === 0) {
      toast.error("צריך לפחות תמונה אחת");
      return;
    }
    setSaving(true);
    const payload = {
      title: values.title.trim(),
      slug: values.slug.trim() || makeSlug(values.title),
      excerpt: values.excerpt.trim(),
      body: values.body,
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
            <Input
              id="title"
              label="כותרת"
              value={values.title}
              onChange={(e) => onTitleChange(e.target.value)}
              required
            />
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
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="excerpt"
                className="text-xs uppercase tracking-wider2 text-charcoal/70 font-medium"
              >
                תקציר
              </label>
              <textarea
                id="excerpt"
                rows={2}
                value={values.excerpt}
                onChange={(e) => set("excerpt", e.target.value)}
                className="w-full rounded-xl border border-charcoal/20 bg-cream p-3 text-sm focus:outline-none focus:border-charcoal/60 focus:ring-2 focus:ring-gold/30"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider2 text-charcoal/70 font-medium">
                  תוכן (Markdown)
                </span>
                <div className="flex gap-1 text-xs">
                  <button
                    type="button"
                    onClick={() => setShowBodyHelp((v) => !v)}
                    className={cn(
                      "rounded-full px-3 py-1 text-charcoal/60 hover:bg-charcoal/[0.06]",
                      showBodyHelp && "bg-charcoal/[0.06] text-charcoal"
                    )}
                  >
                    עזרה
                  </button>
                  <button
                    type="button"
                    onClick={() => setBodyTab("edit")}
                    className={cn(
                      "rounded-full px-3 py-1",
                      bodyTab === "edit"
                        ? "bg-charcoal text-cream"
                        : "text-charcoal/60 hover:bg-charcoal/[0.06]"
                    )}
                  >
                    עריכה
                  </button>
                  <button
                    type="button"
                    onClick={() => setBodyTab("preview")}
                    className={cn(
                      "rounded-full px-3 py-1",
                      bodyTab === "preview"
                        ? "bg-charcoal text-cream"
                        : "text-charcoal/60 hover:bg-charcoal/[0.06]"
                    )}
                  >
                    תצוגה מקדימה
                  </button>
                </div>
              </div>
              {showBodyHelp && (
                <div className="mt-2">
                  <MarkdownCheatSheet />
                </div>
              )}
              {bodyTab === "edit" ? (
                <textarea
                  value={values.body}
                  onChange={(e) => set("body", e.target.value)}
                  rows={16}
                  className="mt-1.5 w-full rounded-xl border border-charcoal/20 bg-cream p-3 font-sans text-sm focus:outline-none focus:border-charcoal/60 focus:ring-2 focus:ring-gold/30"
                  placeholder="כתבו פוסט עשיר…  **מודגש**, *נטוי*, ## כותרת, - רשימה, [קישור](https://…), ![תיאור](url-תמונה)"
                />
              ) : (
                <div className="mt-1.5 min-h-[16rem] rounded-xl border border-charcoal/10 bg-linen/60 p-4">
                  {values.body ? (
                    <Markdown source={values.body} />
                  ) : (
                    <p className="text-charcoal/40">אין תוכן עדיין.</p>
                  )}
                </div>
              )}
            </div>
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
