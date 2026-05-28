"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { TrashIcon, PlusIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export type BlogTagRow = {
  id: string;
  name: string;
  slug: string;
  order: number;
};

export function BlogTagManager({ initial }: { initial: BlogTagRow[] }) {
  const router = useRouter();
  const [tags, setTags] = useState<BlogTagRow[]>(initial);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [saving, setSaving] = useState(false);

  async function addTag(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/blog/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), slug: slug.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "שגיאה");
      setTags((prev) => [...prev, data.tag]);
      setName("");
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

  async function updateTag(id: string, patch: Partial<BlogTagRow>) {
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
            id="tag-name"
            label="שם"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="רהיטים"
            required
          />
          <Input
            id="tag-slug"
            label="slug (אופציונלי)"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            dir="ltr"
            placeholder="furniture"
          />
        </div>
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
                <input
                  type="text"
                  value={t.name}
                  onChange={(e) =>
                    setTags((prev) =>
                      prev.map((x) =>
                        x.id === t.id ? { ...x, name: e.target.value } : x
                      )
                    )
                  }
                  onBlur={() => updateTag(t.id, { name: t.name })}
                  className="flex-1 min-w-[10rem] rounded-lg border border-charcoal/10 bg-cream px-3 py-2 text-sm"
                />
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
                  className="w-40 rounded-lg border border-charcoal/10 bg-cream px-3 py-2 text-sm"
                />
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
