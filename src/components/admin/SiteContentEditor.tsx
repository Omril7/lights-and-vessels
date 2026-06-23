"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { useDropzone } from "react-dropzone";
import { Button, Dropdown, LocalizedInput, LocalizedTextarea } from "@/components/ui";
import { MarkdownEditor } from "@/components/admin/MarkdownEditor";
import {
  MegaphoneIcon,
  SparklesIcon,
  PaintBrushIcon,
  UserIcon,
  ChatBubbleLeftRightIcon,
  Square3Stack3DIcon,
  ArrowUpTrayIcon,
  TrashIcon,
  EnvelopeIcon,
  PhotoIcon,
  PlusIcon,
  // RectangleGroupIcon, // CATEGORIES_DISABLED
  ChatBubbleBottomCenterTextIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
// import { CATEGORIES } from "@/types"; // CATEGORIES_DISABLED
import { cn } from "@/lib/utils";
import { SOCIAL_PLATFORMS } from "@/lib/social";

type FieldKind =
  | "text"
  | "textarea"
  | "bilingual_text"
  | "bilingual_textarea"
  | "richtext"
  | "url"
  | "image"
  | "image-list"
  // | "category-images" // CATEGORIES_DISABLED
  | "testimonials"
  | "social-links"
  | "toggle";

type Field = {
  key: string;
  label: string;
  label_en?: string;
  help?: string;
  /** Force LTR direction on single-locale text/textarea fields (e.g. email, phone). */
  ltr?: boolean;
  /** Recommended pixel dimensions, shown inside the upload dropzone. */
  dimensions?: string;
  kind: FieldKind;
  /** When true, field takes a full row in the 2-col grid. */
  wide?: boolean;
  /** Toggle-only: custom icon + on/off status text. Defaults to Megaphone + פעיל/כבוי. */
  icon?: React.ComponentType<{ className?: string }>;
  onLabel?: string;
  offLabel?: string;
};

type PageId = "home" | "about" | "site" | "settings";

/** Groups for the section nav, in display order. */
const PAGES: { id: PageId; label: string }[] = [
  { id: "home", label: "דף הבית" },
  { id: "about", label: "דף אודות" },
  { id: "site", label: "כלל האתר" },
  { id: "settings", label: "הגדרות" },
];

type Section = {
  id: string;
  heading: string;
  description?: string;
  /** Which page this section belongs to — drives grouping in the nav. */
  page: PageId;
  icon: React.ComponentType<{ className?: string }>;
  fields: Field[];
};

export const SECTIONS: Section[] = [
  {
    id: "banner",
    heading: "באנר עליון",
    description: "הודעה קצרה שמופיעה מעל הניווט בכל עמוד.",
    page: "site",
    icon: MegaphoneIcon,
    fields: [
      { key: "banner_enabled", label: "באנר פעיל", kind: "toggle", wide: true },
      {
        key: "banner_text",
        label: "טקסט הבאנר",
        label_en: "Banner text",
        kind: "bilingual_text",
        wide: true,
        help: "שינוי הטקסט יציג את הבאנר מחדש לכל מי שסגר אותו.",
      },
      {
        key: "banner_link",
        label: "קישור (אופציונלי)",
        kind: "url",
        wide: true,
        help: "ריק = הבאנר אינו לחיץ.",
      },
    ],
  },
  {
    id: "hero",
    heading: "Hero — דף הבית",
    description: "הסקציה הראשונה שהמבקרים רואים.",
    page: "home",
    icon: SparklesIcon,
    fields: [
      { key: "hero_title", label: "כותרת ראשית", label_en: "Main heading", kind: "bilingual_text", wide: true },
      { key: "hero_cta", label: "טקסט כפתור", label_en: "Button text", kind: "bilingual_text", wide: true },
      { key: "hero_subtitle", label: "כותרת משנה", label_en: "Subtitle", kind: "bilingual_textarea", wide: true },
      {
        key: "hero_image",
        label: "תמונת רקע",
        kind: "image",
        wide: true,
        dimensions: "מומלץ: 1920×1080 פיקסל (יחס 16:9, לרוחב)",
      },
    ],
  },
  {
    id: "story",
    heading: "סיפור הסטודיו",
    description: "טקסט קצר שמופיע בדף הבית עם קישור ל'אודות'.",
    page: "home",
    icon: PaintBrushIcon,
    fields: [
      { key: "story_teaser", label: "תקציר", label_en: "Studio teaser", kind: "bilingual_textarea", wide: true },
      {
        key: "story_image",
        label: "תמונה",
        kind: "image",
        wide: true,
        dimensions: "מומלץ: 1200×1500 פיקסל (יחס 4:5, לאורך)",
      },
    ],
  },
  {
    id: "about",
    heading: "דף 'אודות'",
    description: "התוכן המלא של עמוד 'אודות' (תומך ב‑Markdown).",
    page: "about",
    icon: UserIcon,
    fields: [
      { key: "about_text", label: "תוכן מלא", label_en: "Full content", kind: "richtext", wide: true },
      {
        key: "about_portrait",
        label: "פורטרט",
        kind: "image",
        wide: true,
        dimensions: "מומלץ: 1200×1500 פיקסל (יחס 4:5, לאורך)",
      },
    ],
  },
  {
    id: "process_gallery",
    heading: "גלריית הסטודיו (דף 'אודות')",
    description: "תמונות מתוך תהליך העבודה. אם ריק, הגלריה מוסתרת בדף האתר.",
    page: "about",
    icon: PhotoIcon,
    fields: [
      {
        key: "process_gallery",
        label: "תמונות",
        kind: "image-list",
        wide: true,
        dimensions: "מומלץ: 1000×1000 פיקסל (ריבוע)",
        help: "הוספה, הסרה ושינוי טקסט חלופי לכל תמונה.",
      },
    ],
  },
  // CATEGORIES_DISABLED: category_images section removed from nav/editor
  // {
  //   id: "category_images",
  //   heading: "תמונות קטגוריות (דף הבית)",
  //   description: "תמונה לכל קטגוריה ברצועת הקטגוריות בדף הבית. קטגוריה ללא תמונה — לא תוצג.",
  //   page: "home",
  //   icon: RectangleGroupIcon,
  //   fields: [
  //     {
  //       key: "category_images",
  //       label: "קטגוריות",
  //       kind: "category-images",
  //       wide: true,
  //       dimensions: "מומלץ: 1000×1200 פיקסל (יחס 5:6, לאורך)",
  //       help: "התמונות נשמרות ב‑Supabase Storage תחת תיקיית content/.",
  //     },
  //   ],
  // },
  {
    id: "testimonials",
    heading: "המלצות לקוחות (דף הבית)",
    description:
      "המלצות שמופיעות בעמוד הבית. אם הרשימה ריקה, הסקציה מוסתרת.",
    page: "home",
    icon: ChatBubbleBottomCenterTextIcon,
    fields: [
      {
        key: "testimonials",
        label: "המלצות",
        kind: "testimonials",
        wide: true,
        dimensions: "מומלץ: 400×400 פיקסל (ריבוע)",
        help: "ציטוט (חובה), שם, פירוט (אופציונלי), ותמונה (אופציונלי).",
      },
    ],
  },
  {
    id: "contact",
    heading: "צרו קשר",
    description: "פרטי הקשר שמופיעים באתר ובכפתור הוואטסאפ הצף.",
    page: "site",
    icon: ChatBubbleLeftRightIcon,
    fields: [
      { key: "contact_heading", label: "כותרת", label_en: "Heading", kind: "bilingual_text" },
      { key: "contact_email", label: "אימייל", kind: "text", ltr: true },
      { key: "whatsapp_number", label: "מספר וואטסאפ", kind: "text", ltr: true },
      { key: "contact_text", label: "טקסט הזמנה", label_en: "Invitation text", kind: "bilingual_textarea", wide: true },
      {
        key: "whatsapp_message",
        label: "הודעה מוכנה לוואטסאפ",
        label_en: "WhatsApp message",
        kind: "bilingual_textarea",
        wide: true,
      },
    ],
  },
  {
    id: "footer",
    heading: "פוטר",
    page: "site",
    icon: Square3Stack3DIcon,
    fields: [
      { key: "footer_text", label: "טקסט הפוטר", label_en: "Footer text", kind: "bilingual_text", wide: true },
      {
        key: "social_links",
        label: "קישורים לרשתות חברתיות",
        kind: "social-links",
        wide: true,
        help: "כל שורה מוצגת כאייקון בפוטר. השאר ריק כדי להסתיר את כל האייקונים.",
      },
    ],
  },
  {
    id: "email",
    heading: "התראות אימייל",
    description:
      "ספק שליחת האימיילים האוטומטיים ללקוחות (אישור הזמנה). פרטי החיבור עצמם נשמרים ב‑.env.",
    page: "settings",
    icon: EnvelopeIcon,
    fields: [
      {
        key: "email_use_gmail",
        label: "שליחה דרך Gmail",
        kind: "toggle",
        wide: true,
        icon: EnvelopeIcon,
        onLabel: "Gmail SMTP — נשלח מחשבון Gmail אישי",
        offLabel: "Resend — נשלח מהדומיין של הסטודיו",
        help: "כבוי = Resend (מומלץ ברגע שיש דומיין). דלוק = Gmail (חינמי, ללא דומיין, אך נראה פחות מקצועי).",
      },
    ],
  },
];

type BilingualValues = Record<string, { he: string; en: string }>;

export function SiteContentEditor({
  initial,
}: {
  initial: BilingualValues;
}) {
  const router = useRouter();
  const [values, setValues] = useState<BilingualValues>(initial);
  const [saving, setSaving] = useState(false);
  // Sections grouped by the page they belong to, in PAGES order.
  const groupedSections = PAGES.map((p) => ({
    ...p,
    sections: SECTIONS.filter((s) => s.page === p.id),
  })).filter((g) => g.sections.length > 0);
  const orderedSections = groupedSections.flatMap((g) => g.sections);

  const [active, setActive] = useState<string>(orderedSections[0].id);

  const set = (k: string, lang: "he" | "en", v: string) =>
    setValues((prev) => ({ ...prev, [k]: { ...prev[k], [lang]: v } }));

  function buildEntries(vals: BilingualValues) {
    return SECTIONS.flatMap((s) =>
      s.fields.map((f) => ({
        key: f.key,
        value_he: vals[f.key]?.he ?? "",
        value_en: vals[f.key]?.en || null,
        type: f.kind === "richtext" ? "richtext" : "text",
      }))
    );
  }

  async function preview() {
    const w = window.open("", "_blank");
    try {
      const res = await fetch("/api/site-content/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entries: buildEntries(values) }),
      });
      if (!res.ok) throw new Error("שגיאה");
      if (w) w.location.href = "/";
      else toast.error("חסימת חלון קופץ — אפשר חלונות קופצים ונסה שוב");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "שגיאה בתצוגה מקדימה");
      w?.close();
    }
  }

  async function save() {
    setSaving(true);
    try {
      const entries = buildEntries(values);
      const res = await fetch("/api/site-content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entries }),
      });
      if (!res.ok) throw new Error("שגיאה בשמירה");
      toast.success("השינויים נשמרו");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "שגיאה");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="grid lg:grid-cols-[14rem_minmax(0,1fr)] gap-6">
        {/* Sticky section nav */}
        <nav className="hidden lg:block">
          <div className="sticky top-6 space-y-4">
            {groupedSections.map((group) => (
              <div key={group.id}>
                <p className="px-3 pb-1 text-[0.65rem] font-semibold uppercase tracking-wider2 text-charcoal/40">
                  {group.label}
                </p>
                <ul className="space-y-1">
                  {group.sections.map((s) => {
                    const Icon = s.icon;
                    const on = active === s.id;
                    return (
                      <li key={s.id}>
                        <a
                          href={`#${s.id}`}
                          onClick={() => setActive(s.id)}
                          className={cn(
                            "flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors",
                            on
                              ? "bg-charcoal text-cream"
                              : "text-charcoal/70 hover:bg-charcoal/[0.06]"
                          )}
                        >
                          <Icon className="h-4 w-4 shrink-0" aria-hidden />
                          <span>{s.heading}</span>
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </nav>

        {/* Main column */}
        <div className="space-y-6 pb-24">
          {orderedSections.map((section) => {
            const Icon = section.icon;
            return (
              <section
                key={section.id}
                id={section.id}
                className="scroll-mt-6 rounded-2xl border border-charcoal/10 bg-cream p-6 shadow-soft"
              >
                <header className="mb-5 flex items-start gap-3">
                  <div className="rounded-xl bg-linen p-2.5">
                    <Icon className="h-5 w-5 text-charcoal/70" aria-hidden />
                  </div>
                  <div>
                    <h2 className="font-serif text-lg text-charcoal">
                      {section.heading}
                    </h2>
                    {section.description && (
                      <p className="mt-0.5 text-xs text-charcoal/55">
                        {section.description}
                      </p>
                    )}
                  </div>
                </header>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
                  {section.fields.map((field) => (
                    <div
                      key={field.key}
                      className={field.wide ? "sm:col-span-2" : undefined}
                    >
                      <ContentField
                        field={field}
                        valueHe={values[field.key]?.he ?? ""}
                        valueEn={values[field.key]?.en ?? ""}
                        onChangeHe={(v) => set(field.key, "he", v)}
                        onChangeEn={(v) => set(field.key, "en", v)}
                      />
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>

      {/* Floating save bar */}
      <div className="fixed inset-x-0 bottom-16 md:bottom-0 z-40 border-t border-charcoal/10 bg-cream/95 backdrop-blur md:me-64">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <p className="text-xs text-charcoal/60">
            השינויים נכנסים לתוקף מיד באתר.
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={preview} disabled={saving}>
              תצוגה מקדימה
            </Button>
            <Button onClick={save} disabled={saving} size="sm">
              {saving ? "שומר…" : "שמירת השינויים"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ContentField({
  field,
  valueHe,
  valueEn,
  onChangeHe,
  onChangeEn,
}: {
  field: Field;
  valueHe: string;
  valueEn: string;
  onChangeHe: (v: string) => void;
  onChangeEn: (v: string) => void;
}) {
  if (field.kind === "toggle") {
    const on = valueHe === "true";
    const Icon = field.icon ?? MegaphoneIcon;
    const onText = field.onLabel ?? "פעיל — מוצג למבקרים";
    const offText = field.offLabel ?? "כבוי — אינו מוצג";
    return (
      <div className="space-y-1.5">
      <button
        type="button"
        onClick={() => onChangeHe(on ? "false" : "true")}
        aria-pressed={on}
        className={cn(
          "group flex w-full items-center justify-between gap-4 rounded-2xl border px-5 py-4 text-start transition-all",
          on
            ? "border-olive/40 bg-olive/10 shadow-soft"
            : "border-charcoal/15 bg-linen/40 hover:border-charcoal/30"
        )}
      >
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-xl transition-colors",
              on ? "bg-olive text-cream" : "bg-charcoal/10 text-charcoal/60"
            )}
            aria-hidden
          >
            <Icon className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-medium text-charcoal">{field.label}</p>
            <p
              className={cn(
                "text-xs transition-colors",
                on ? "text-olive" : "text-charcoal/50"
              )}
            >
              {on ? onText : offText}
            </p>
          </div>
        </div>

        <span
          className={cn(
            "relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors",
            on ? "bg-olive" : "bg-charcoal/25"
          )}
        >
          <span
            className={cn(
              "inline-block h-6 w-6 transform rounded-full bg-cream shadow transition-transform duration-200",
              on
                ? "translate-x-0.5 rtl:-translate-x-0.5"
                : "translate-x-[1.375rem] rtl:-translate-x-[1.375rem]"
            )}
          />
        </span>
      </button>
        {field.help && (
          <p className="px-1 text-xs text-charcoal/50">{field.help}</p>
        )}
      </div>
    );
  }

  if (field.kind === "image") {
    return <ImageField value={valueHe} label={field.label} help={field.help} hint={field.dimensions} onChange={onChangeHe} />;
  }

  if (field.kind === "image-list") {
    return <ImageListField value={valueHe} label={field.label} help={field.help} hint={field.dimensions} onChange={onChangeHe} />;
  }

  // CATEGORIES_DISABLED:
  // if (field.kind === "category-images") { ... }

  if (field.kind === "testimonials") {
    return <TestimonialsField value={valueHe} label={field.label} help={field.help} hint={field.dimensions} onChange={onChangeHe} />;
  }

  if (field.kind === "social-links") {
    return <SocialLinksField value={valueHe} label={field.label} help={field.help} onChange={onChangeHe} />;
  }

  if (field.kind === "richtext") {
    return (
      <MarkdownField
        valueHe={valueHe}
        valueEn={valueEn}
        label={field.label}
        labelEn={field.label_en}
        help={field.help}
        onChangeHe={onChangeHe}
        onChangeEn={onChangeEn}
      />
    );
  }

  const inputBase =
    "w-full rounded-xl border border-charcoal/15 bg-cream px-3 py-2.5 text-sm text-ink placeholder:text-charcoal/30 focus:outline-none focus:border-charcoal/50 focus:ring-2 focus:ring-gold/30 transition-colors";

  // bilingual_text / bilingual_textarea — two LocalizedInput / LocalizedTextarea side by side
  if (field.kind === "bilingual_text" || field.kind === "bilingual_textarea") {
    const pairs = (
      <div className="grid sm:grid-cols-2 gap-3">
        {field.kind === "bilingual_textarea" ? (
          <>
            <LocalizedTextarea id={`${field.key}-he`} locale="he" label={field.label} value={valueHe} onChange={(e) => onChangeHe(e.target.value)} rows={3} />
            <LocalizedTextarea id={`${field.key}-en`} locale="en" label={field.label_en ?? field.label} value={valueEn} onChange={(e) => onChangeEn(e.target.value)} rows={3} />
          </>
        ) : (
          <>
            <LocalizedInput id={`${field.key}-he`} locale="he" label={field.label} value={valueHe} onChange={(e) => onChangeHe(e.target.value)} />
            <LocalizedInput id={`${field.key}-en`} locale="en" label={field.label_en ?? field.label} value={valueEn} onChange={(e) => onChangeEn(e.target.value)} />
          </>
        )}
      </div>
    );
    return field.help ? (
      <div className="space-y-1.5">
        {pairs}
        <span className="block text-xs text-charcoal/50">{field.help}</span>
      </div>
    ) : pairs;
  }

  // url — single LTR input (links)
  if (field.kind === "url") {
    return (
      <label className="block space-y-1.5">
        <span className="text-[0.7rem] uppercase tracking-wider2 text-charcoal/55 font-medium">
          {field.label}
        </span>
        <input
          type="url"
          value={valueHe}
          onChange={(e) => onChangeHe(e.target.value)}
          dir="ltr"
          className={inputBase}
        />
        {field.help && (
          <span className="block text-xs text-charcoal/50">{field.help}</span>
        )}
      </label>
    );
  }

  // text / textarea — single locale (email, phone, etc.)
  return (
    <label className="block space-y-1.5">
      <span className="text-[0.7rem] uppercase tracking-wider2 text-charcoal/55 font-medium">
        {field.label}
      </span>
      {field.kind === "textarea" ? (
        <textarea
          value={valueHe}
          onChange={(e) => onChangeHe(e.target.value)}
          dir={field.ltr ? "ltr" : "rtl"}
          rows={3}
          className={inputBase}
        />
      ) : (
        <input
          type="text"
          value={valueHe}
          onChange={(e) => onChangeHe(e.target.value)}
          dir={field.ltr ? "ltr" : "rtl"}
          className={inputBase}
        />
      )}
      {field.help && (
        <span className="block text-xs text-charcoal/50">{field.help}</span>
      )}
    </label>
  );
}

function MarkdownField({
  valueHe,
  valueEn,
  label,
  labelEn,
  help,
  onChangeHe,
  onChangeEn,
}: {
  valueHe: string;
  valueEn: string;
  label: string;
  labelEn?: string;
  help?: string;
  onChangeHe: (v: string) => void;
  onChangeEn: (v: string) => void;
}) {
  return (
    <div className="space-y-3">
      <MarkdownEditor locale="he" label={label} value={valueHe} onChange={onChangeHe} />
      <MarkdownEditor locale="en" label={labelEn ?? label} value={valueEn} onChange={onChangeEn} />
      {help && <p className="text-xs text-charcoal/50">{help}</p>}
    </div>
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
      <span className="block text-[0.7rem] uppercase tracking-wider2 text-charcoal/55 font-medium">
        {label}
      </span>

      {value ? (
        <div className="flex items-center gap-4 rounded-xl border border-charcoal/10 bg-linen/40 p-3">
          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-sand">
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
            "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors",
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
      <span className="block text-[0.7rem] uppercase tracking-wider2 text-charcoal/55 font-medium">
        {label}
      </span>

      {items.length > 0 && (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {items.map((item, i) => (
            <li
              key={`${item.url}-${i}`}
              className="overflow-hidden rounded-xl border border-charcoal/10 bg-linen/40"
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
                  className="w-full rounded-md border border-charcoal/15 bg-cream px-2 py-1 text-xs text-charcoal focus:border-charcoal/50 focus:outline-none"
                />
                <input
                  type="text"
                  value={item.alt_en}
                  onChange={(e) => setAlt(i, "alt_en", e.target.value)}
                  dir="ltr"
                  placeholder="Alt text 🇬🇧"
                  className="w-full rounded-md border border-charcoal/15 bg-cream px-2 py-1 text-xs text-charcoal focus:border-charcoal/50 focus:outline-none"
                />
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => move(i, -1)}
                      disabled={i === 0}
                      aria-label="הזזה אחורה"
                      className="rounded-md p-1 text-charcoal/60 transition-colors hover:bg-charcoal/[0.06] disabled:opacity-30"
                    >
                      ‹
                    </button>
                    <button
                      type="button"
                      onClick={() => move(i, 1)}
                      disabled={i === items.length - 1}
                      aria-label="הזזה קדימה"
                      className="rounded-md p-1 text-charcoal/60 transition-colors hover:bg-charcoal/[0.06] disabled:opacity-30"
                    >
                      ›
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(i)}
                    aria-label="הסרה"
                    className="rounded-md p-1 text-terracotta/80 transition-colors hover:bg-terracotta/10"
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
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-6 text-center transition-colors",
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

// CATEGORIES_DISABLED: parseMap only used by CategoryImagesField
// function parseMap(value: string): Record<string, string> {
//   if (!value) return {};
//   try {
//     const obj = JSON.parse(value);
//     if (!obj || typeof obj !== "object" || Array.isArray(obj)) return {};
//     const out: Record<string, string> = {};
//     for (const [k, v] of Object.entries(obj)) { if (typeof v === "string") out[k] = v; }
//     return out;
//   } catch { return {}; }
// }

// CATEGORIES_DISABLED: CategoryImagesField commented out
// function CategoryImagesField({ value, label, help, hint, onChange }: { value: string; label: string; help?: string; hint?: string; onChange: (v: string) => void }) {
//   const map = parseMap(value);
//   const setOne = (slug: string, url: string) => {
//     const next = { ...map };
//     if (url) next[slug] = url; else delete next[slug];
//     onChange(JSON.stringify(next));
//   };
//   return (
//     <div className="space-y-3">
//       <span className="block text-[0.7rem] uppercase tracking-wider2 text-charcoal/55 font-medium">{label}</span>
//       <div className="grid gap-4 sm:grid-cols-2">
//         {CATEGORIES.map((c) => (
//           <ImageField key={c.slug} value={map[c.slug] ?? ""} label={c.label} hint={hint} onChange={(url) => setOne(c.slug, url)} />
//         ))}
//       </div>
//       {help && <p className="text-xs text-charcoal/50">{help}</p>}
//     </div>
//   );
// }

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
      <span className="block text-[0.7rem] uppercase tracking-wider2 text-charcoal/55 font-medium">
        {label}
      </span>

      {items.length > 0 && (
        <ul className="divide-y divide-charcoal/8 rounded-xl border border-charcoal/10 overflow-hidden">
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
                              className="rounded-md p-1 text-charcoal/60 transition-colors hover:bg-charcoal/[0.06] disabled:opacity-30"
                            >
                              ‹
                            </button>
                            <button
                              type="button"
                              onClick={() => move(i, 1)}
                              disabled={i === items.length - 1}
                              aria-label="הזזה קדימה"
                              className="rounded-md p-1 text-charcoal/60 transition-colors hover:bg-charcoal/[0.06] disabled:opacity-30"
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
    "w-full rounded-md border border-charcoal/15 bg-cream px-2.5 py-2 text-sm text-ink placeholder:text-charcoal/35 focus:border-charcoal/50 focus:outline-none focus:ring-2 focus:ring-gold/30";

  return (
    <div className="space-y-3">
      <span className="block text-[0.7rem] uppercase tracking-wider2 text-charcoal/55 font-medium">
        {label}
      </span>

      {items.length > 0 && (
        <ul className="space-y-2">
          {items.map((item, i) => (
            <li
              key={i}
              className="rounded-xl border border-charcoal/10 bg-linen/40 p-3"
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
                    className="rounded-md p-1 text-charcoal/60 transition-colors hover:bg-charcoal/[0.06] disabled:opacity-30"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    onClick={() => move(i, 1)}
                    disabled={i === items.length - 1}
                    aria-label="הזזה קדימה"
                    className="rounded-md p-1 text-charcoal/60 transition-colors hover:bg-charcoal/[0.06] disabled:opacity-30"
                  >
                    ›
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(i)}
                    aria-label="הסרה"
                    className="rounded-md p-1 text-terracotta transition-colors hover:bg-terracotta/10"
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
