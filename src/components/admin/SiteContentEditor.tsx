"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { useDropzone } from "react-dropzone";
import {
  MegaphoneIcon,
  SparklesIcon,
  PaintBrushIcon,
  UserIcon,
  ChatBubbleLeftRightIcon,
  Square3Stack3DIcon,
  ArrowUpTrayIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type FieldKind = "text" | "textarea" | "richtext" | "url" | "image" | "toggle";

type Field = {
  key: string;
  label: string;
  help?: string;
  kind: FieldKind;
  /** When true, field takes a full row in the 2-col grid. */
  wide?: boolean;
};

type Section = {
  id: string;
  heading: string;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  fields: Field[];
};

export const SECTIONS: Section[] = [
  {
    id: "banner",
    heading: "באנר עליון",
    description: "הודעה קצרה שמופיעה מעל הניווט בכל עמוד.",
    icon: MegaphoneIcon,
    fields: [
      { key: "banner_enabled", label: "באנר פעיל", kind: "toggle", wide: true },
      {
        key: "banner_text",
        label: "טקסט הבאנר",
        kind: "text",
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
    icon: SparklesIcon,
    fields: [
      { key: "hero_title", label: "כותרת ראשית", kind: "text" },
      { key: "hero_cta", label: "טקסט כפתור", kind: "text" },
      { key: "hero_subtitle", label: "כותרת משנה", kind: "textarea", wide: true },
      { key: "hero_image", label: "תמונת רקע", kind: "image", wide: true },
    ],
  },
  {
    id: "story",
    heading: "סיפור הסטודיו",
    description: "טקסט קצר שמופיע בדף הבית עם קישור ל'אודות'.",
    icon: PaintBrushIcon,
    fields: [
      { key: "story_teaser", label: "תקציר", kind: "textarea", wide: true },
      { key: "story_image", label: "תמונה", kind: "image", wide: true },
    ],
  },
  {
    id: "about",
    heading: "דף 'אודות'",
    description: "התוכן המלא של עמוד 'אודות' (תומך ב‑Markdown).",
    icon: UserIcon,
    fields: [
      { key: "about_text", label: "תוכן מלא", kind: "richtext", wide: true },
      { key: "about_portrait", label: "פורטרט", kind: "image", wide: true },
    ],
  },
  {
    id: "contact",
    heading: "צרו קשר",
    description: "פרטי הקשר שמופיעים באתר ובכפתור הוואטסאפ הצף.",
    icon: ChatBubbleLeftRightIcon,
    fields: [
      { key: "contact_heading", label: "כותרת", kind: "text" },
      { key: "contact_email", label: "אימייל", kind: "text" },
      { key: "whatsapp_number", label: "מספר וואטסאפ", kind: "text" },
      { key: "contact_text", label: "טקסט הזמנה", kind: "textarea", wide: true },
      {
        key: "whatsapp_message",
        label: "הודעה מוכנה לוואטסאפ",
        kind: "textarea",
        wide: true,
      },
    ],
  },
  {
    id: "footer",
    heading: "פוטר",
    icon: Square3Stack3DIcon,
    fields: [{ key: "footer_text", label: "טקסט הפוטר", kind: "text", wide: true }],
  },
];

export function SiteContentEditor({
  initial,
}: {
  initial: Record<string, string>;
}) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, string>>(initial);
  const [saving, setSaving] = useState(false);
  const [active, setActive] = useState<string>(SECTIONS[0].id);

  const set = (k: string, v: string) =>
    setValues((prev) => ({ ...prev, [k]: v }));

  async function save() {
    setSaving(true);
    try {
      const entries = SECTIONS.flatMap((s) =>
        s.fields.map((f) => ({
          key: f.key,
          value: values[f.key] ?? "",
          type: f.kind === "richtext" ? "richtext" : "text",
        }))
      );
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
          <ul className="sticky top-6 space-y-1">
            {SECTIONS.map((s) => {
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
        </nav>

        {/* Main column */}
        <div className="space-y-6 pb-24">
          {SECTIONS.map((section) => {
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
                        value={values[field.key] ?? ""}
                        onChange={(v) => set(field.key, v)}
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
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-charcoal/10 bg-cream/95 backdrop-blur md:me-64">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <p className="text-xs text-charcoal/60">
            השינויים נכנסים לתוקף מיד באתר.
          </p>
          <Button onClick={save} disabled={saving} size="sm">
            {saving ? "שומר…" : "שמירת השינויים"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function ContentField({
  field,
  value,
  onChange,
}: {
  field: Field;
  value: string;
  onChange: (v: string) => void;
}) {
  if (field.kind === "toggle") {
    const on = value === "true";
    return (
      <button
        type="button"
        onClick={() => onChange(on ? "false" : "true")}
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
            <MegaphoneIcon className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-medium text-charcoal">{field.label}</p>
            <p
              className={cn(
                "text-xs transition-colors",
                on ? "text-olive" : "text-charcoal/50"
              )}
            >
              {on ? "פעיל — מוצג למבקרים" : "כבוי — אינו מוצג"}
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
    );
  }

  if (field.kind === "image") {
    return <ImageField value={value} label={field.label} help={field.help} onChange={onChange} />;
  }

  const inputBase =
    "w-full rounded-xl border border-charcoal/15 bg-cream px-3 py-2.5 text-sm text-ink placeholder:text-charcoal/30 focus:outline-none focus:border-charcoal/50 focus:ring-2 focus:ring-gold/30 transition-colors";

  return (
    <label className="block space-y-1.5">
      <span className="text-[0.7rem] uppercase tracking-wider2 text-charcoal/55 font-medium">
        {field.label}
      </span>
      {field.kind === "textarea" || field.kind === "richtext" ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={field.kind === "richtext" ? 8 : 3}
          className={inputBase}
        />
      ) : (
        <input
          type={field.kind === "url" ? "url" : "text"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          dir={field.kind === "url" ? "ltr" : undefined}
          className={inputBase}
        />
      )}
      {field.help && (
        <span className="block text-xs text-charcoal/50">{field.help}</span>
      )}
    </label>
  );
}

function ImageField({
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
  const [uploading, setUploading] = useState(false);

  async function upload(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
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
        </div>
      )}

      {help && <span className="block text-xs text-charcoal/50">{help}</span>}
    </div>
  );
}
