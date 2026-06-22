"use client";

import { Button, Input } from "@/components/ui";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

export type BlogTagRow = {
  id: string;
  name_he: string;
  name_en: string | null;
  slug: string;
  order: number;
};

export function BlogTagManager({ initial }: { initial: BlogTagRow[] }) {
  const router = useRouter();
  const [tags, setTags] = useState<BlogTagRow[]>(initial);
  const [nameHe, setNameHe] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [slug, setSlug] = useState("");
  const [saving, setSaving] = useState(false);

  async function addTag(e: React.FormEvent) {
    e.preventDefault();
    if (!nameHe.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/blog/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: nameHe.trim(),
          name_en: nameEn.trim() || null,
          slug: slug.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "שגיאה");
      setTags((prev) => [...prev, data.tag]);
      setNameHe("");
      setNameEn("");
      setSlug("");
      toast.success("תגית נוספה");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "שגיאה");
    } finally {
      setSaving(false);
    }
  }

  async function removeTag(id: string) {
    if (!confirm("למחוק את התגית?")) return;
    try {
      const res = await fetch(`/api/admin/blog/tags/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("שגיאה");
      setTags((prev) => prev.filter((t) => t.id !== id));
      toast.success("נמחק");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "שגיאה");
    }
  }

  async function updateTag(
    id: string,
    patch: { name?: string; name_en?: string | null; slug?: string; order?: number }
  ) {
    const res = await fetch(`/api/admin/blog/tags/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error || "שגיאה");
      return;
    }
    setTags((prev) => prev.map((t) => (t.id === id ? data.tag : t)));
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={addTag}
        className="rounded-2xl border border-charcoal/10 bg-cream p-5 shadow-soft space-y-3"
      >
        <h2 className="font-serif text-lg text-charcoal">תגית חדשה</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <Input
            id="tag-name-he"
            label="שם בעברית"
            value={nameHe}
            onChange={(e) => setNameHe(e.target.value)}
            placeholder="תכשיטים"
            required
          />
          <Input
            id="tag-name-en"
            label="Name in English"
            value={nameEn}
            onChange={(e) => setNameEn(e.target.value)}
            dir="ltr"
            placeholder="Jewelry"
          />
        </div>
        <Input
          id="tag-slug"
          label="slug (אופציונלי)"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          dir="ltr"
          placeholder="jewelry"
        />
        <div className="flex justify-end">
          <Button type="submit" size="sm" disabled={saving}>
            <PlusIcon className="h-4 w-4" /> הוספה
          </Button>
        </div>
      </form>

      <div className="rounded-2xl border border-charcoal/10 bg-cream shadow-soft overflow-hidden">
        {tags.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-charcoal/50">
            עדיין אין תגיות.
          </p>
        ) : (
          <ul className="divide-y divide-charcoal/5">
            {tags.map((t) => (
              <li
                key={t.id}
                className="flex flex-wrap items-center gap-3 px-5 py-3"
              >
                {/* Hebrew name */}
                <input
                  type="text"
                  value={t.name_he}
                  onChange={(e) =>
                    setTags((prev) =>
                      prev.map((x) =>
                        x.id === t.id ? { ...x, name_he: e.target.value } : x
                      )
                    )
                  }
                  onBlur={() => updateTag(t.id, { name: t.name_he })}
                  dir="rtl"
                  placeholder="עברית"
                  className="flex-1 min-w-[8rem] rounded-lg border border-charcoal/10 bg-cream px-3 py-2 text-sm"
                />
                {/* English name */}
                <input
                  type="text"
                  value={t.name_en ?? ""}
                  onChange={(e) =>
                    setTags((prev) =>
                      prev.map((x) =>
                        x.id === t.id ? { ...x, name_en: e.target.value } : x
                      )
                    )
                  }
                  onBlur={() =>
                    updateTag(t.id, { name_en: t.name_en || null })
                  }
                  dir="ltr"
                  placeholder="English"
                  className="flex-1 min-w-[8rem] rounded-lg border border-charcoal/10 bg-cream px-3 py-2 text-sm"
                />
                {/* Slug */}
                <input
                  type="text"
                  dir="ltr"
                  value={t.slug}
                  onChange={(e) =>
                    setTags((prev) =>
                      prev.map((x) =>
                        x.id === t.id ? { ...x, slug: e.target.value } : x
                      )
                    )
                  }
                  onBlur={() => updateTag(t.id, { slug: t.slug })}
                  className="w-36 rounded-lg border border-charcoal/10 bg-cream px-3 py-2 text-sm"
                />
                {/* Order */}
                <input
                  type="number"
                  value={t.order}
                  onChange={(e) =>
                    setTags((prev) =>
                      prev.map((x) =>
                        x.id === t.id
                          ? { ...x, order: Number(e.target.value) }
                          : x
                      )
                    )
                  }
                  onBlur={() => updateTag(t.id, { order: t.order })}
                  className="w-20 rounded-lg border border-charcoal/10 bg-cream px-3 py-2 text-sm"
                  aria-label="סדר"
                />
                <button
                  type="button"
                  onClick={() => removeTag(t.id)}
                  className="rounded-md p-2 text-terracotta hover:bg-terracotta/10"
                  aria-label="מחיקה"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
