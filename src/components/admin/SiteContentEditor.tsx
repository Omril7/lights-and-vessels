"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useDropzone } from "react-dropzone";
import { Button, Dropdown, LocalizedInput, LocalizedTextarea } from "@/components/ui";
import { MarkdownEditor } from "@/components/admin/MarkdownEditor";
import {
  ArrowUpTrayIcon,
  ArrowTopRightOnSquareIcon,
  TrashIcon,
  PlusIcon,
  ChevronDownIcon,
  MegaphoneIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";
import { SOCIAL_PLATFORMS } from "@/lib/social";
import {
  type ContentField,
  type ContentGroup,
  getContentGroup,
  groupFields,
  isBilingual,
  fieldIsEmpty,
} from "@/lib/site-content-schema";

type Lang = "he" | "en";
type BilingualValues = Record<string, { he: string; en: string }>;

/**
 * One site page's editable content (see lib/site-content-schema.ts).
 * - One language at a time: Hebrew shows everything; English shows only the
 *   texts that need translating (images and settings are shared).
 * - Saves only this page's fields; warns before leaving with unsaved changes.
 */
export function SiteContentEditor({
  groupId,
  initial,
}: {
  groupId: ContentGroup["id"];
  initial: BilingualValues;
}) {
  const group = getContentGroup(groupId)!;
  const router = useRouter();
  const [values, setValues] = useState<BilingualValues>(initial);
  const [saved, setSaved] = useState<BilingualValues>(initial);
  const [lang, setLang] = useState<Lang>("he");
  const [saving, setSaving] = useState(false);

  const fields = useMemo(() => groupFields(group), [group]);
  const hasBilingual = fields.some(isBilingual);

  const changedKeys = fields
    .map((f) => f.key)
    .filter(
      (k) =>
        (values[k]?.he ?? "") !== (saved[k]?.he ?? "") ||
        (values[k]?.en ?? "") !== (saved[k]?.en ?? "")
    );
  const dirty = changedKeys.length > 0;

  const missingEn = fields.filter(
    (f) => isBilingual(f) && !fieldIsEmpty(values, f.key, "he") && fieldIsEmpty(values, f.key, "en")
  ).length;

  // Warn before closing the tab / navigating away with unsaved changes.
  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  const set = (k: string, l: Lang, v: string) =>
    setValues((prev) => ({ ...prev, [k]: { he: prev[k]?.he ?? "", en: prev[k]?.en ?? "", [l]: v } }));

  const entriesFor = (keys: string[]) =>
    keys.map((key) => {
      const f = fields.find((x) => x.key === key);
      return {
        key,
        value_he: values[key]?.he ?? "",
        value_en: values[key]?.en || null,
        type: f?.kind === "richtext" ? "richtext" : "text",
      };
    });

  async function save() {
    setSaving(true);
    try {
      const res = await fetch("/api/site-content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entries: entriesFor(fields.map((f) => f.key)) }),
      });
      if (!res.ok) throw new Error("השמירה נכשלה");
      setSaved(values);
      toast.success("נשמר — השינויים כבר באתר");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "שגיאה");
    } finally {
      setSaving(false);
    }
  }

  async function preview() {
    const w = window.open("", "_blank");
    try {
      // Draft = every value currently on screen, layered over the live site.
      const res = await fetch("/api/site-content/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entries: entriesFor(Object.keys(values)) }),
      });
      if (!res.ok) throw new Error("שגיאה בתצוגה המקדימה");
      if (w) w.location.href = group.sitePath ?? "/";
      else toast.error("הדפדפן חסם חלון חדש — אפשרו חלונות קופצים ונסו שוב");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "שגיאה");
      w?.close();
    }
  }

  const visibleSections = group.sections
    .map((s) => ({ ...s, fields: lang === "he" ? s.fields : s.fields.filter(isBilingual) }))
    .filter((s) => s.fields.length > 0);

  return (
    <div className="mx-auto max-w-3xl pb-32">
      {/* Page header */}
      <header className="mb-6 space-y-3">
        <Link href="/admin/site-content" className="text-sm text-charcoal/60 hover:text-ink">
          → כל עמודי האתר
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="font-serif text-3xl text-ink">{group.label}</h1>
            <p className="mt-1 text-sm text-charcoal/70">{group.description}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {group.related && (
              <Button href={group.related.href} variant="outline" size="sm">
                {group.related.label}
              </Button>
            )}
            {group.sitePath && (
              <a
                href={group.sitePath}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 border border-charcoal/40 px-4 py-2 text-xs font-medium text-charcoal transition-colors hover:border-charcoal"
              >
                צפייה בדף
                <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" aria-hidden />
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Language switch */}
      {hasBilingual && (
        <div className="sticky top-14 z-20 -mx-4 mb-6 border-b border-charcoal/10 bg-linen/95 px-4 py-2 backdrop-blur md:top-0 md:mx-0 md:px-0">
          <div role="tablist" aria-label="שפה" className="flex gap-1">
            {(["he", "en"] as const).map((l) => (
              <button
                key={l}
                type="button"
                role="tab"
                aria-selected={lang === l}
                onClick={() => setLang(l)}
                className={cn(
                  "flex items-center gap-2 border px-4 py-2 text-sm transition-colors",
                  lang === l
                    ? "border-ink bg-ink text-cream"
                    : "border-charcoal/25 text-charcoal hover:border-charcoal/60"
                )}
              >
                {l === "he" ? "עברית" : "English"}
                {l === "en" && missingEn > 0 && (
                  <span
                    className={cn(
                      "px-1.5 text-[0.7rem]",
                      lang === l ? "bg-cream/20" : "bg-accent/15 text-accent"
                    )}
                  >
                    {missingEn} חסרים
                  </span>
                )}
              </button>
            ))}
          </div>
          {lang === "en" && (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-charcoal/60">
              <InformationCircleIcon className="h-4 w-4 shrink-0" aria-hidden />
              מוצגים רק טקסטים לתרגום. תמונות והגדרות משותפות לשתי השפות. טקסט שלא תורגם יוצג באתר האנגלי בעברית.
            </p>
          )}
        </div>
      )}

      {/* Sections */}
      <div className="space-y-6">
        {visibleSections.map((section) => (
          <section
            key={section.id}
            id={section.id}
            className="scroll-mt-28 border border-charcoal/10 bg-cream p-5 md:p-6"
          >
            <header className="mb-5">
              <h2 className="font-serif text-xl text-ink">{section.heading}</h2>
              {section.description && (
                <p className="mt-1 text-sm text-charcoal/65">{section.description}</p>
              )}
            </header>
            <div className="space-y-6">
              {section.fields.map((field) => (
                <FieldBlock
                  key={field.key}
                  field={field}
                  lang={lang}
                  value={values[field.key]?.[isBilingual(field) ? lang : "he"] ?? ""}
                  hebrew={values[field.key]?.he ?? ""}
                  changed={changedKeys.includes(field.key)}
                  onChange={(v) => set(field.key, isBilingual(field) ? lang : "he", v)}
                />
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Save bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-charcoal/15 bg-cream/95 backdrop-blur md:ms-64">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <p className={cn("text-sm", dirty ? "text-accent" : "text-charcoal/60")} aria-live="polite">
            {dirty
              ? `${changedKeys.length === 1 ? "שינוי אחד" : `${changedKeys.length} שינויים`} שלא נשמרו`
              : "הכל שמור"}
          </p>
          <div className="flex items-center gap-2">
            {dirty && (
              <button
                type="button"
                onClick={() => setValues(saved)}
                disabled={saving}
                className="px-3 py-2 text-sm text-charcoal/70 hover:text-ink disabled:opacity-50"
              >
                ביטול שינויים
              </button>
            )}
            {group.sitePath && (
              <Button variant="outline" size="sm" onClick={preview} disabled={saving}>
                תצוגה מקדימה
              </Button>
            )}
            <Button size="sm" onClick={save} disabled={saving || !dirty}>
              {saving ? "שומר…" : "שמירה"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Label + "where it appears" + the input + empty/translation hints. */
function FieldBlock({
  field,
  lang,
  value,
  hebrew,
  changed,
  onChange,
}: {
  field: ContentField;
  lang: Lang;
  value: string;
  hebrew: string;
  changed: boolean;
  onChange: (v: string) => void;
}) {
  const empty = !value.trim() || value.trim() === "[]";
  const label = lang === "en" && field.label_en ? field.label_en : field.label;

  return (
    <div className="space-y-2">
      {field.kind !== "toggle" && (
        <div className="space-y-0.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-ink">{label}</span>
            {changed && <span className="bg-accent/10 px-1.5 text-[0.7rem] text-accent">שונה</span>}
            {empty && field.ifEmpty && (
              <span className="bg-charcoal/[0.07] px-1.5 text-[0.7rem] text-charcoal/70">
                ריק · {field.ifEmpty}
              </span>
            )}
          </div>
          {field.where && <p className="text-xs text-charcoal/60">{field.where}</p>}
        </div>
      )}

      <FieldInput field={field} lang={lang} value={value} onChange={onChange} />

      {lang === "en" && isBilingual(field) && hebrew.trim() && (
        <p className="text-xs text-charcoal/55">
          <span className="text-charcoal/40">בעברית: </span>
          <span className="line-clamp-2">{hebrew}</span>
        </p>
      )}
      {field.help && <p className="text-xs text-charcoal/55">{field.help}</p>}
    </div>
  );
}

function FieldInput({
  field,
  lang,
  value,
  onChange,
}: {
  field: ContentField;
  lang: Lang;
  value: string;
  onChange: (v: string) => void;
}) {
  const inputBase =
    "w-full border border-charcoal/35 bg-cream px-3 py-2.5 text-sm text-ink placeholder:text-charcoal/35 focus:border-ink focus:outline-none transition-colors";

  switch (field.kind) {
    case "toggle":
      return <ToggleField field={field} on={value === "true"} onChange={(on) => onChange(on ? "true" : "false")} />;
    case "image":
      return <ImageField value={value} label={field.label} hint={field.dimensions} onChange={onChange} />;
    case "image-list":
      return <ImageListField value={value} label={field.label} hint={field.dimensions} onChange={onChange} />;
    case "testimonials":
      return <TestimonialsField value={value} label={field.label} hint={field.dimensions} onChange={onChange} />;
    case "social-links":
      return <SocialLinksField value={value} label={field.label} onChange={onChange} />;
    case "richtext":
      return (
        <MarkdownEditor
          locale={lang}
          label={lang === "en" && field.label_en ? field.label_en : field.label}
          value={value}
          onChange={onChange}
        />
      );
    case "bilingual_textarea":
      return (
        <textarea
          aria-label={field.label}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          dir={lang === "en" ? "ltr" : "rtl"}
          rows={4}
          placeholder={lang === "he" ? field.placeholder : undefined}
          className={inputBase}
        />
      );
    case "bilingual_text":
      return (
        <input
          type="text"
          aria-label={field.label}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          dir={lang === "en" ? "ltr" : "rtl"}
          placeholder={lang === "he" ? field.placeholder : undefined}
          className={inputBase}
        />
      );
    case "url":
      return (
        <input
          type="text"
          inputMode="url"
          aria-label={field.label}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          dir="ltr"
          placeholder={field.placeholder}
          className={inputBase}
        />
      );
    default:
      return (
        <input
          type="text"
          aria-label={field.label}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          dir={field.ltr ? "ltr" : "rtl"}
          placeholder={field.placeholder}
          className={inputBase}
        />
      );
  }
}

function ToggleField({
  field,
  on,
  onChange,
}: {
  field: ContentField;
  on: boolean;
  onChange: (on: boolean) => void;
}) {
  const Icon = field.icon ?? MegaphoneIcon;
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className={cn(
        "flex w-full items-center justify-between gap-4 border px-4 py-3.5 text-start transition-colors",
        on ? "border-moss/50 bg-moss/10" : "border-charcoal/20 bg-linen/40 hover:border-charcoal/40"
      )}
    >
      <span className="flex items-center gap-3">
        <span
          aria-hidden
          className={cn(
            "flex h-9 w-9 items-center justify-center",
            on ? "bg-moss text-cream" : "bg-charcoal/10 text-charcoal/60"
          )}
        >
          <Icon className="h-5 w-5" />
        </span>
        <span>
          <span className="block text-sm font-medium text-ink">{field.label}</span>
          <span className={cn("block text-xs", on ? "text-moss" : "text-charcoal/55")}>
            {on ? field.onLabel ?? "מוצג באתר" : field.offLabel ?? "מוסתר"}
          </span>
        </span>
      </span>
      <span
        aria-hidden
        className={cn(
          "relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors",
          on ? "bg-moss" : "bg-charcoal/25"
        )}
      >
        <span
          className={cn(
            "inline-block h-6 w-6 rounded-full bg-cream shadow transition-transform duration-200",
            on ? "translate-x-0.5 rtl:-translate-x-0.5" : "translate-x-[1.375rem] rtl:-translate-x-[1.375rem]"
          )}
        />
      </span>
    </button>
  );
}


function ImageField({
  value,
  label,
  help,
  hint,
  onChange,
}: {
  value: string;
  label: string;
  help?: string;
  hint?: string;
  onChange: (v: string) => void;
}) {
  const [uploading, setUploading] = useState(false);

  async function upload(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("folder", "content");
      fd.append("files", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const body = await res.json().catch(() => null);
      if (!res.ok) throw new Error(body?.error || "שגיאה בהעלאה");
      const url = body?.files?.[0]?.url;
      if (!url) throw new Error("שגיאה בהעלאה");
      onChange(url);
      toast.success("התמונה הועלתה");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "שגיאה");
    } finally {
      setUploading(false);
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "image/jpeg": [],
      "image/png": [],
      "image/webp": [],
      "image/avif": [],
    },
    maxFiles: 1,
    multiple: false,
    disabled: uploading,
    onDrop: (files) => files[0] && upload(files[0]),
  });

  return (
    <div className="space-y-1.5">

      {value ? (
        <div className="flex items-center gap-4 border border-charcoal/10 bg-linen/40 p-3">
          <div className="relative h-24 w-24 shrink-0 overflow-hidden bg-sand">
            <Image
              src={value}
              alt={label}
              fill
              sizes="96px"
              className="object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-charcoal/60" dir="ltr">
              {value}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <div {...getRootProps()}>
                <input {...getInputProps()} />
                <button
                  type="button"
                  disabled={uploading}
                  className="inline-flex items-center gap-1.5 rounded-full border border-charcoal/20 px-3 py-1.5 text-xs text-charcoal transition-colors hover:bg-charcoal/[0.06] disabled:opacity-50"
                >
                  <ArrowUpTrayIcon className="h-3.5 w-3.5" />
                  {uploading ? "מעלה…" : "החלפת תמונה"}
                </button>
              </div>
              <button
                type="button"
                onClick={() => onChange("")}
                disabled={uploading}
                className="inline-flex items-center gap-1.5 rounded-full border border-terracotta/40 px-3 py-1.5 text-xs text-terracotta transition-colors hover:bg-terracotta/10 disabled:opacity-50"
              >
                <TrashIcon className="h-3.5 w-3.5" />
                הסרה
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-2 border-2 border-dashed px-4 py-8 text-center transition-colors",
            isDragActive
              ? "border-charcoal/50 bg-linen"
              : "border-charcoal/20 bg-linen/40 hover:border-charcoal/40",
            uploading && "pointer-events-none opacity-60"
          )}
        >
          <input {...getInputProps()} />
          <ArrowUpTrayIcon className="h-6 w-6 text-charcoal/50" aria-hidden />
          <p className="text-sm text-charcoal/70">
            {uploading
              ? "מעלה תמונה…"
              : isDragActive
              ? "שחררו את הקובץ"
              : "גררו תמונה לכאן או לחצו לבחירה"}
          </p>
          <p className="text-xs text-charcoal/40">JPG · PNG · WebP · AVIF · עד 8MB</p>
          {hint && <p className="text-xs font-medium text-copper">{hint}</p>}
        </div>
      )}

      {hint && value && (
        <span className="block text-xs text-charcoal/45">{hint}</span>
      )}
      {help && <span className="block text-xs text-charcoal/50">{help}</span>}
    </div>
  );
}

type GalleryItem = { url: string; alt: string; alt_en: string };

function parseList(value: string): GalleryItem[] {
  if (!value) return [];
  try {
    const arr = JSON.parse(value);
    if (!Array.isArray(arr)) return [];
    return arr
      .filter((x) => x && typeof x.url === "string" && x.url.trim())
      .map((x) => ({
        url: String(x.url),
        alt: typeof x.alt === "string" ? x.alt : "",
        alt_en: typeof x.alt_en === "string" ? x.alt_en : "",
      }));
  } catch {
    return [];
  }
}

function ImageListField({
  value,
  label,
  help,
  hint,
  onChange,
}: {
  value: string;
  label: string;
  help?: string;
  hint?: string;
  onChange: (v: string) => void;
}) {
  const items = parseList(value);
  const [uploading, setUploading] = useState(false);

  const persist = (next: GalleryItem[]) => onChange(JSON.stringify(next));

  async function uploadFiles(files: File[]) {
    if (!files.length) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("folder", "content");
      for (const f of files) fd.append("files", f);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const body = await res.json().catch(() => null);
      if (!res.ok) throw new Error(body?.error || "שגיאה בהעלאה");
      const added: GalleryItem[] = (body?.files || []).map((f: { url: string }) => ({
        url: f.url,
        alt: "",
        alt_en: "",
      }));
      persist([...items, ...added]);
      toast.success(`${added.length} תמונות נוספו`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "שגיאה");
    } finally {
      setUploading(false);
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "image/jpeg": [],
      "image/png": [],
      "image/webp": [],
      "image/avif": [],
    },
    multiple: true,
    disabled: uploading,
    onDrop: (files) => uploadFiles(files),
  });

  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    persist(next);
  }

  function remove(i: number) {
    persist(items.filter((_, idx) => idx !== i));
  }

  function setAlt(i: number, field: "alt" | "alt_en", value: string) {
    persist(items.map((it, idx) => (idx === i ? { ...it, [field]: value } : it)));
  }

  return (
    <div className="space-y-3">

      {items.length > 0 && (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {items.map((item, i) => (
            <li
              key={`${item.url}-${i}`}
              className="overflow-hidden border border-charcoal/10 bg-linen/40"
            >
              <div className="relative aspect-square bg-sand">
                <Image
                  src={item.url}
                  alt={item.alt || `תמונה ${i + 1}`}
                  fill
                  sizes="200px"
                  className="object-cover"
                />
              </div>
              <div className="space-y-1.5 p-2">
                <input
                  type="text"
                  value={item.alt}
                  onChange={(e) => setAlt(i, "alt", e.target.value)}
                  dir="rtl"
                  placeholder="טקסט חלופי 🇮🇱"
                  className="w-full border border-charcoal/15 bg-cream px-2 py-1 text-xs text-charcoal focus:border-charcoal/50 focus:outline-none"
                />
                <input
                  type="text"
                  value={item.alt_en}
                  onChange={(e) => setAlt(i, "alt_en", e.target.value)}
                  dir="ltr"
                  placeholder="Alt text 🇬🇧"
                  className="w-full border border-charcoal/15 bg-cream px-2 py-1 text-xs text-charcoal focus:border-charcoal/50 focus:outline-none"
                />
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => move(i, -1)}
                      disabled={i === 0}
                      aria-label="הזזה אחורה"
                      className="p-1 text-charcoal/60 transition-colors hover:bg-charcoal/[0.06] disabled:opacity-30"
                    >
                      ‹
                    </button>
                    <button
                      type="button"
                      onClick={() => move(i, 1)}
                      disabled={i === items.length - 1}
                      aria-label="הזזה קדימה"
                      className="p-1 text-charcoal/60 transition-colors hover:bg-charcoal/[0.06] disabled:opacity-30"
                    >
                      ›
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(i)}
                    aria-label="הסרה"
                    className="p-1 text-terracotta/80 transition-colors hover:bg-terracotta/10"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div
        {...getRootProps()}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 border-2 border-dashed px-4 py-6 text-center transition-colors",
          isDragActive
            ? "border-charcoal/50 bg-linen"
            : "border-charcoal/20 bg-linen/40 hover:border-charcoal/40",
          uploading && "pointer-events-none opacity-60"
        )}
      >
        <input {...getInputProps()} />
        <PlusIcon className="h-6 w-6 text-charcoal/50" aria-hidden />
        <p className="text-sm text-charcoal/70">
          {uploading
            ? "מעלה תמונות…"
            : isDragActive
            ? "שחררו את הקבצים"
            : "הוספת תמונות — גררו לכאן או לחצו לבחירה"}
        </p>
        <p className="text-xs text-charcoal/40">ניתן להעלות מספר תמונות בבת אחת</p>
        {hint && <p className="text-xs font-medium text-copper">{hint}</p>}
      </div>

      {help && <p className="text-xs text-charcoal/50">{help}</p>}
    </div>
  );
}

type TestimonialItem = {
  quote: string;
  name: string;
  detail: string;
  image: string;
  quote_en: string;
  name_en: string;
  detail_en: string;
};

function parseTestimonialList(value: string): TestimonialItem[] {
  if (!value) return [];
  try {
    const arr = JSON.parse(value);
    if (!Array.isArray(arr)) return [];
    return arr.map((x) => ({
      quote: typeof x?.quote === "string" ? x.quote : "",
      name: typeof x?.name === "string" ? x.name : "",
      detail: typeof x?.detail === "string" ? x.detail : "",
      image: typeof x?.image === "string" ? x.image : "",
      quote_en: typeof x?.quote_en === "string" ? x.quote_en : "",
      name_en: typeof x?.name_en === "string" ? x.name_en : "",
      detail_en: typeof x?.detail_en === "string" ? x.detail_en : "",
    }));
  } catch {
    return [];
  }
}

function TestimonialsField({
  value,
  label,
  help,
  hint,
  onChange,
}: {
  value: string;
  label: string;
  help?: string;
  hint?: string;
  onChange: (v: string) => void;
}) {
  const items = parseTestimonialList(value);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const persist = (next: TestimonialItem[]) => onChange(JSON.stringify(next));

  const update = (i: number, patch: Partial<TestimonialItem>) =>
    persist(items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));

  const remove = (i: number) => {
    persist(items.filter((_, idx) => idx !== i));
    setOpenIndex(null);
  };

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    persist(next);
    setOpenIndex(j);
  };

  const add = () => {
    persist([...items, { quote: "", name: "", detail: "", image: "", quote_en: "", name_en: "", detail_en: "" }]);
    setOpenIndex(items.length);
  };

  return (
    <div className="space-y-2">

      {items.length > 0 && (
        <ul className="divide-y divide-charcoal/8 border border-charcoal/10 overflow-hidden">
          {items.map((item, i) => {
            const isOpen = openIndex === i;
            const preview = item.name || item.quote
              ? [item.name, item.quote ? `"${item.quote.slice(0, 50)}${item.quote.length > 50 ? "…" : ""}"` : ""].filter(Boolean).join(" · ")
              : `המלצה ${i + 1}`;
            return (
              <li key={i} className="bg-linen/40">
                {/* Accordion header */}
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-3 px-4 py-3 text-start hover:bg-charcoal/[0.04] transition-colors"
                >
                  <span className="flex items-center gap-2 min-w-0">
                    <span className="text-xs font-medium text-charcoal/40 shrink-0 tabular-nums">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="truncate text-sm text-charcoal">{preview}</span>
                  </span>
                  <ChevronDownIcon
                    className={cn(
                      "h-4 w-4 shrink-0 text-charcoal/40 transition-transform duration-200",
                      isOpen && "rotate-180"
                    )}
                  />
                </button>

                {/* Accordion body */}
                {isOpen && (
                  <div className="border-t border-charcoal/8 px-4 pb-4 pt-3">
                    <div className="grid gap-3 sm:grid-cols-[7rem_minmax(0,1fr)]">
                      <ImageField
                        value={item.image}
                        label="תמונה"
                        hint={hint}
                        onChange={(url) => update(i, { image: url })}
                      />
                      <div className="space-y-3">
                        <LocalizedTextarea
                          id={`t${i}-quote-he`}
                          locale="he"
                          label="ציטוט"
                          value={item.quote}
                          onChange={(e) => update(i, { quote: e.target.value })}
                          rows={3}
                          placeholder="ציטוט"
                        />
                        <div className="grid gap-2 sm:grid-cols-2">
                          <LocalizedInput
                            id={`t${i}-name-he`}
                            locale="he"
                            label="שם"
                            value={item.name}
                            onChange={(e) => update(i, { name: e.target.value })}
                            placeholder="שם"
                          />
                          <LocalizedInput
                            id={`t${i}-detail-he`}
                            locale="he"
                            label="פירוט"
                            value={item.detail}
                            onChange={(e) => update(i, { detail: e.target.value })}
                            placeholder="עיר / לקוח חוזר וכו'"
                          />
                        </div>
                        <LocalizedTextarea
                          id={`t${i}-quote-en`}
                          locale="en"
                          label="Quote"
                          value={item.quote_en}
                          onChange={(e) => update(i, { quote_en: e.target.value })}
                          rows={3}
                          placeholder="Quote in English"
                        />
                        <div className="grid gap-2 sm:grid-cols-2">
                          <LocalizedInput
                            id={`t${i}-name-en`}
                            locale="en"
                            label="Name"
                            value={item.name_en}
                            onChange={(e) => update(i, { name_en: e.target.value })}
                            placeholder="Name"
                          />
                          <LocalizedInput
                            id={`t${i}-detail-en`}
                            locale="en"
                            label="Detail"
                            value={item.detail_en}
                            onChange={(e) => update(i, { detail_en: e.target.value })}
                            placeholder="City / returning customer"
                          />
                        </div>
                        <div className="flex items-center justify-between gap-2 pt-1">
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => move(i, -1)}
                              disabled={i === 0}
                              aria-label="הזזה אחורה"
                              className="p-1 text-charcoal/60 transition-colors hover:bg-charcoal/[0.06] disabled:opacity-30"
                            >
                              ‹
                            </button>
                            <button
                              type="button"
                              onClick={() => move(i, 1)}
                              disabled={i === items.length - 1}
                              aria-label="הזזה קדימה"
                              className="p-1 text-charcoal/60 transition-colors hover:bg-charcoal/[0.06] disabled:opacity-30"
                            >
                              ›
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => remove(i)}
                            className="inline-flex items-center gap-1.5 rounded-full border border-terracotta/40 px-3 py-1 text-xs text-terracotta transition-colors hover:bg-terracotta/10"
                          >
                            <TrashIcon className="h-3.5 w-3.5" />
                            הסרה
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <button
        type="button"
        onClick={add}
        className="inline-flex items-center gap-1.5 rounded-full border border-charcoal/20 px-4 py-2 text-sm text-charcoal transition-colors hover:bg-charcoal/[0.06]"
      >
        <PlusIcon className="h-4 w-4" />
        הוספת המלצה
      </button>

      {help && <p className="text-xs text-charcoal/50">{help}</p>}
    </div>
  );
}

type SocialLinkItem = { platform: string; url: string };

function parseSocialLinkList(value: string): SocialLinkItem[] {
  try {
    const arr = JSON.parse(value);
    if (!Array.isArray(arr)) return [];
    return arr
      .filter((x) => x && typeof x.platform === "string")
      .map((x) => ({
        platform: String(x.platform),
        url: typeof x.url === "string" ? x.url : "",
      }));
  } catch {
    return [];
  }
}

function SocialLinksField({
  value,
  label,
  help,
  onChange,
}: {
  value: string;
  label: string;
  help?: string;
  onChange: (v: string) => void;
}) {
  const items = parseSocialLinkList(value);
  const persist = (next: SocialLinkItem[]) => onChange(JSON.stringify(next));

  const update = (i: number, patch: Partial<SocialLinkItem>) =>
    persist(items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));

  const remove = (i: number) => persist(items.filter((_, idx) => idx !== i));

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    persist(next);
  };

  const add = () =>
    persist([...items, { platform: SOCIAL_PLATFORMS[0]?.slug ?? "facebook", url: "" }]);

  const inputBase =
    "w-full border border-charcoal/15 bg-cream px-2.5 py-2 text-sm text-ink placeholder:text-charcoal/35 focus:border-charcoal/50 focus:outline-none focus:ring-2 focus:ring-gold/30";

  return (
    <div className="space-y-3">

      {items.length > 0 && (
        <ul className="space-y-2">
          {items.map((item, i) => (
            <li
              key={i}
              className="border border-charcoal/10 bg-linen/40 p-3"
            >
              <div className="grid gap-2 sm:grid-cols-[10rem_minmax(0,1fr)_auto]">
                <Dropdown
                  ariaLabel="רשת חברתית"
                  variant="field"
                  value={item.platform}
                  onChange={(v) => update(i, { platform: v })}
                  options={SOCIAL_PLATFORMS.map((p) => ({ value: p.slug, label: p.label }))}
                />
                <input
                  type="url"
                  value={item.url}
                  onChange={(e) => update(i, { url: e.target.value })}
                  placeholder="https://..."
                  dir="ltr"
                  className={inputBase}
                />
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => move(i, -1)}
                    disabled={i === 0}
                    aria-label="הזזה אחורה"
                    className="p-1 text-charcoal/60 transition-colors hover:bg-charcoal/[0.06] disabled:opacity-30"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    onClick={() => move(i, 1)}
                    disabled={i === items.length - 1}
                    aria-label="הזזה קדימה"
                    className="p-1 text-charcoal/60 transition-colors hover:bg-charcoal/[0.06] disabled:opacity-30"
                  >
                    ›
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(i)}
                    aria-label="הסרה"
                    className="p-1 text-terracotta transition-colors hover:bg-terracotta/10"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={add}
        className="inline-flex items-center gap-1.5 rounded-full border border-charcoal/20 px-4 py-2 text-sm text-charcoal transition-colors hover:bg-charcoal/[0.06]"
      >
        <PlusIcon className="h-4 w-4" />
        הוספת רשת חברתית
      </button>

      {help && <p className="text-xs text-charcoal/50">{help}</p>}
    </div>
  );
}
