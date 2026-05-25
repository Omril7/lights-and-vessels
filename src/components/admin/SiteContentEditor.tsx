"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import {
  MegaphoneIcon,
  SparklesIcon,
  PaintBrushIcon,
  UserIcon,
  ChatBubbleLeftRightIcon,
  Square3Stack3DIcon,
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
      { key: "hero_image", label: "תמונת רקע (URL)", kind: "image", wide: true },
    ],
  },
  {
    id: "story",
    heading: "סיפור הסטודיו",
    description: "טקסט קצר שמופיע בדף הבית עם קישור ל'אודות'.",
    icon: PaintBrushIcon,
    fields: [
      { key: "story_teaser", label: "תקציר", kind: "textarea", wide: true },
      { key: "story_image", label: "תמונה (URL)", kind: "image", wide: true },
    ],
  },
  {
    id: "about",
    heading: "דף 'אודות'",
    description: "התוכן המלא של עמוד 'אודות' (תומך ב‑Markdown).",
    icon: UserIcon,
    fields: [
      { key: "about_text", label: "תוכן מלא", kind: "richtext", wide: true },
      { key: "about_portrait", label: "פורטרט (URL)", kind: "image", wide: true },
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
      <div className="flex items-center justify-between rounded-xl border border-charcoal/10 bg-linen/40 px-4 py-3">
        <div>
          <p className="text-sm font-medium text-charcoal">{field.label}</p>
          {field.help && (
            <p className="text-xs text-charcoal/50">{field.help}</p>
          )}
        </div>
        <button
          type="button"
          onClick={() => onChange(on ? "false" : "true")}
          aria-pressed={on}
          className={cn(
            "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors",
            on ? "bg-charcoal" : "bg-charcoal/20"
          )}
        >
          <span
            className={cn(
              "inline-block h-5 w-5 transform rounded-full bg-cream shadow transition-transform",
              on ? "translate-x-1" : "translate-x-5"
            )}
          />
        </button>
      </div>
    );
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
          dir={
            field.kind === "url" || field.kind === "image" ? "ltr" : undefined
          }
          className={inputBase}
        />
      )}
      {field.help && (
        <span className="block text-xs text-charcoal/50">{field.help}</span>
      )}
    </label>
  );
}
