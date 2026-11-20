import type { ComponentType } from "react";
import {
  SparklesIcon,
  ShoppingBagIcon,
  PhotoIcon,
  UserIcon,
  GlobeAltIcon,
  Cog6ToothIcon,
  MegaphoneIcon,
  TruckIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";

/**
 * Site-content editor schema: which editable keys exist, how they're grouped
 * (one admin screen per site page), and the plain-language hints the admin
 * sees. Shared by the overview page, the editor, and the sidebar.
 */

export type FieldKind =
  | "text"
  | "bilingual_text"
  | "bilingual_textarea"
  | "richtext"
  | "url"
  | "image"
  | "image-list"
  | "testimonials"
  | "social-links"
  | "toggle";

export type ContentField = {
  key: string;
  label: string;
  label_en?: string;
  /** Where this shows up on the site — always shown under the label. */
  where?: string;
  /** What happens when the field is left empty. */
  ifEmpty?: string;
  /** Extra guidance (format, tips). */
  help?: string;
  placeholder?: string;
  /** Recommended image size, shown in the upload box. */
  dimensions?: string;
  kind: FieldKind;
  /** Force LTR on single-language text (email, phone). */
  ltr?: boolean;
  /** Numbers only: numeric keypad on phones. */
  numeric?: boolean;
  /** Toggle only. */
  icon?: ComponentType<{ className?: string }>;
  onLabel?: string;
  offLabel?: string;
};

export type ContentSection = {
  id: string;
  heading: string;
  description?: string;
  fields: ContentField[];
};

export type ContentGroupId = "entry" | "store" | "gallery" | "about" | "site" | "shipping" | "settings";

export type ContentGroup = {
  id: ContentGroupId;
  label: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  /** Public path of the page this group edits (for "view page"). */
  sitePath?: string;
  /** Related admin screen for things not edited here (products, projects). */
  related?: { href: string; label: string };
  sections: ContentSection[];
};

export const BILINGUAL_KINDS: FieldKind[] = ["bilingual_text", "bilingual_textarea", "richtext"];
export const isBilingual = (f: ContentField) => BILINGUAL_KINDS.includes(f.kind);

export const CONTENT_GROUPS: ContentGroup[] = [
  {
    id: "entry",
    label: "דף הכניסה",
    description: "המסך הראשון באתר: תמונה במסך מלא, שורת פתיחה ושלוש כניסות.",
    icon: SparklesIcon,
    sitePath: "/",
    sections: [
      {
        id: "entry-main",
        heading: "תמונה ושורת פתיחה",
        fields: [
          {
            key: "hero_title",
            label: "שורת פתיחה",
            label_en: "Opening line",
            kind: "bilingual_text",
            where: "מתחת ללוגו, בפינה התחתונה של מסך הכניסה.",
            help: "משפט אחד קצר. עד כ־60 תווים נראה הכי טוב.",
            placeholder: "יוצרים שלום בחלל הפנימי שלכם.",
          },
          {
            key: "hero_image",
            label: "תמונת רקע",
            kind: "image",
            where: "רקע מסך הכניסה, במסך מלא.",
            dimensions: "תמונה לרוחב, 2400×1350 לפחות. תמונה כהה עובדת הכי טוב (הטקסט בהיר).",
          },
        ],
      },
      {
        id: "entry-doors",
        heading: "תמונות לכל כניסה",
        description: "כשמרחפים עם העכבר על 'החנות', 'הגלריה' או 'אודות', הרקע מתחלף לתמונה שלה.",
        fields: [
          {
            key: "entry_image_store",
            label: "ריחוף על 'החנות'",
            kind: "image",
            ifEmpty: "תוצג תמונת הרקע הראשית.",
            dimensions: "לרוחב, 2400×1350",
          },
          {
            key: "entry_image_gallery",
            label: "ריחוף על 'הגלריה'",
            kind: "image",
            ifEmpty: "תוצג תמונת הרקע הראשית.",
            dimensions: "לרוחב, 2400×1350",
          },
          {
            key: "entry_image_about",
            label: "ריחוף על 'אודות'",
            kind: "image",
            ifEmpty: "תוצג תמונת הרקע הראשית.",
            dimensions: "לרוחב, 2400×1350",
          },
        ],
      },
    ],
  },
  {
    id: "store",
    label: "החנות",
    description: "הבאנר בראש דף החנות. המוצרים עצמם מנוהלים במסך המוצרים.",
    icon: ShoppingBagIcon,
    sitePath: "/shop",
    related: { href: "/admin/products", label: "לניהול המוצרים" },
    sections: [
      {
        id: "store-banner",
        heading: "באנר",
        fields: [
          {
            key: "store_hero_image",
            label: "תמונת באנר",
            kind: "image",
            where: "רצועה רחבה בראש דף החנות, מאחורי הכותרת 'החנות'.",
            ifEmpty: "תוצג תמונת 'החנות' מדף הכניסה.",
            dimensions: "רחבה ונמוכה, בערך 2400×900",
          },
        ],
      },
    ],
  },
  {
    id: "gallery",
    label: "הגלריה",
    description: "הבאנר בראש דף הגלריה. הפרויקטים והפריטים שנמכרו מנוהלים במסך הגלריה.",
    icon: PhotoIcon,
    sitePath: "/gallery",
    related: { href: "/admin/gallery", label: "לניהול הפרויקטים" },
    sections: [
      {
        id: "gallery-banner",
        heading: "באנר",
        fields: [
          {
            key: "gallery_hero_image",
            label: "תמונת באנר",
            kind: "image",
            where: "רצועה רחבה בראש דף הגלריה.",
            ifEmpty: "תוצג תמונת 'הגלריה' מדף הכניסה.",
            dimensions: "רחבה ונמוכה, בערך 2400×900",
          },
        ],
      },
    ],
  },
  {
    id: "about",
    label: "אודות",
    description: "הסיפור שלך: משפט פתיחה, רשימות, הטקסט המלא, תמונות והמלצות.",
    icon: UserIcon,
    sitePath: "/about",
    sections: [
      {
        id: "about-intro",
        heading: "פתיחה",
        fields: [
          {
            key: "story_teaser",
            label: "משפט פתיחה",
            label_en: "Opening statement",
            kind: "bilingual_textarea",
            where: "באותיות גדולות בראש דף 'אודות'.",
            help: "שניים־שלושה משפטים. זה הדבר הראשון שקוראים.",
          },
          {
            key: "about_portrait",
            label: "תמונה שלך",
            kind: "image",
            where: "ליד משפט הפתיחה.",
            ifEmpty: "המשפט יתפרס על כל הרוחב, בלי תמונה.",
            dimensions: "לאורך, 1200×1500 (יחס 4:5)",
          },
        ],
      },
      {
        id: "about-lists",
        heading: "חומרים ותהליך",
        description: "שתי רשימות קצרות זו לצד זו. כל שורה היא פריט אחד.",
        fields: [
          {
            key: "about_materials",
            label: "חומרים",
            label_en: "Materials",
            kind: "bilingual_textarea",
            help: "שורה לכל חומר, למשל: ברזל חלוד ↵ אריחי טרצו עתיקים",
            ifEmpty: "הרשימה לא תוצג.",
          },
          {
            key: "about_process",
            label: "שלבי העבודה",
            label_en: "Process steps",
            kind: "bilingual_textarea",
            help: "שורה לכל שלב. השלבים ימוספרו אוטומטית.",
            ifEmpty: "הרשימה לא תוצג.",
          },
        ],
      },
      {
        id: "about-story",
        heading: "הסיפור המלא",
        fields: [
          {
            key: "about_text",
            label: "טקסט",
            label_en: "Text",
            kind: "richtext",
            where: "מתחת לרשימות, בעמודה צרה לקריאה.",
            help: "אפשר כותרות, הדגשות וקישורים — הכפתור 'עזרה' בעורך מסביר איך.",
          },
        ],
      },
      {
        id: "about-photos",
        heading: "תמונות מהסטודיו",
        fields: [
          {
            key: "process_gallery",
            label: "תמונות",
            kind: "image-list",
            where: "גלריה קטנה מתחת לסיפור.",
            ifEmpty: "הגלריה לא תוצג.",
            dimensions: "ריבוע, 1000×1000",
          },
        ],
      },
      {
        id: "about-testimonials",
        heading: "המלצות",
        fields: [
          {
            key: "testimonials",
            label: "המלצות לקוחות",
            kind: "testimonials",
            where: "קרוסלה לפני 'צרו קשר'.",
            ifEmpty: "הסקציה לא תוצג.",
            help: "ציטוט חובה. שם, פירוט ותמונה — לבחירתך.",
            dimensions: "ריבוע, 400×400",
          },
        ],
      },
    ],
  },
  {
    id: "site",
    label: "כלל האתר",
    description: "דברים שמופיעים בכל העמודים: באנר עליון, פרטי קשר ופוטר.",
    icon: GlobeAltIcon,
    sections: [
      {
        id: "site-banner",
        heading: "באנר עליון",
        description: "פס הודעה דק מעל התפריט, בכל עמוד.",
        fields: [
          { key: "banner_enabled", label: "להציג את הבאנר", kind: "toggle", icon: MegaphoneIcon },
          {
            key: "banner_text",
            label: "טקסט",
            label_en: "Text",
            kind: "bilingual_text",
            placeholder: "משלוח חינם בהזמנות מעל ₪250",
            help: "שינוי הטקסט מציג את הבאנר מחדש גם למי שסגר אותו.",
          },
          {
            key: "banner_link",
            label: "קישור",
            kind: "url",
            placeholder: "/shop",
            ifEmpty: "הבאנר לא יהיה לחיץ.",
          },
        ],
      },
      {
        id: "site-contact",
        heading: "פרטי קשר",
        description: "מופיעים ב'צרו קשר' בדף אודות, בכפתור הוואטסאפ הצף ובכפתור 'שאלה על הפריט'.",
        fields: [
          {
            key: "whatsapp_number",
            label: "מספר וואטסאפ",
            kind: "text",
            ltr: true,
            placeholder: "972501234567",
            help: "עם קידומת מדינה, בלי 0 ובלי מקפים: 972501234567",
            ifEmpty: "כפתורי הוואטסאפ לא יוצגו.",
          },
          { key: "contact_email", label: "אימייל", kind: "text", ltr: true, placeholder: "studio@example.com" },
          { key: "contact_heading", label: "כותרת 'צרו קשר'", label_en: "Contact heading", kind: "bilingual_text" },
          { key: "contact_text", label: "טקסט הזמנה", label_en: "Invitation text", kind: "bilingual_textarea" },
          {
            key: "whatsapp_message",
            label: "הודעה מוכנה בוואטסאפ",
            label_en: "Pre-filled WhatsApp message",
            kind: "bilingual_textarea",
            where: "הטקסט שכבר כתוב כשלקוח פותח שיחה מהכפתור הצף.",
          },
        ],
      },
      {
        id: "site-footer",
        heading: "פוטר",
        fields: [
          {
            key: "footer_text",
            label: "משפט בפוטר",
            label_en: "Footer line",
            kind: "bilingual_text",
            where: "מתחת ללוגו בתחתית כל עמוד.",
          },
          {
            key: "social_links",
            label: "רשתות חברתיות",
            kind: "social-links",
            where: "אייקונים בתחתית כל עמוד.",
            ifEmpty: "לא יוצגו אייקונים.",
          },
        ],
      },
    ],
  },
  {
    id: "shipping",
    label: "משלוחים",
    description: "מחיר המשלוח, משלוח חינם, זמנים ואיסוף עצמי. משמש בעמוד התשלום, במייל לאישור ההזמנה ובמדיניות המשלוחים.",
    icon: TruckIcon,
    sitePath: "/legal/shipping",
    sections: [
      {
        id: "shipping-price",
        heading: "מחיר",
        fields: [
          {
            key: "shipping_post_price",
            label: "מחיר משלוח בדואר (₪)",
            kind: "text",
            ltr: true,
            numeric: true,
            placeholder: "30",
            where: "נוסף לכל הזמנה בדואר בעמוד התשלום, ומופיע במדיניות המשלוחים.",
            help: "מספר בלבד, בלי ₪.",
            ifEmpty: "ייגבו ₪30.",
          },
          {
            key: "shipping_free_over",
            label: "משלוח חינם בהזמנות מעל (₪)",
            kind: "text",
            ltr: true,
            numeric: true,
            placeholder: "250",
            where: "הזמנה בסכום הזה ומעלה מקבלת משלוח בדואר חינם, אוטומטית בעמוד התשלום.",
            help: "מספר בלבד. אם הבאנר העליון מבטיח משלוח חינם — הסכום כאן חייב להתאים לו.",
            ifEmpty: "אין משלוח חינם; כל הזמנה בדואר משלמת את מחיר המשלוח.",
          },
        ],
      },
      {
        id: "shipping-times",
        heading: "זמנים",
        fields: [
          {
            key: "shipping_processing_days",
            label: "ימי הכנה בסטודיו",
            kind: "text",
            ltr: true,
            placeholder: "1-3",
            where: "מאישור התשלום ועד המסירה לדואר. מופיע במדיניות המשלוחים.",
          },
          {
            key: "shipping_post_eta",
            label: "זמן משלוח בדואר",
            label_en: "Postal delivery time",
            kind: "bilingual_text",
            placeholder: "עד 7 ימי עסקים",
            where: "בעמוד התשלום, במייל לאישור ההזמנה ובמדיניות המשלוחים.",
          },
        ],
      },
      {
        id: "shipping-pickup",
        heading: "איסוף עצמי",
        fields: [
          {
            key: "shipping_pickup_address",
            label: "כתובת לאיסוף",
            label_en: "Pickup address",
            kind: "bilingual_text",
            where: "בעמוד התשלום, בעמוד 'ההזמנה התקבלה' ובמייל — רק ללקוחות שבחרו איסוף.",
            ifEmpty: "ייכתב ללקוח שהכתובת תישלח בוואטסאפ.",
          },
          {
            key: "shipping_pickup_hours",
            label: "שעות איסוף",
            label_en: "Pickup hours",
            kind: "bilingual_text",
            placeholder: "א׳–ה׳, 10:00–17:00, בתיאום מראש",
            ifEmpty: "ייכתב ללקוח שניצור קשר לתיאום שעה.",
          },
        ],
      },
    ],
  },
  {
    id: "settings",
    label: "הגדרות",
    description: "הגדרות טכניות. בדרך כלל אין צורך לשנות.",
    icon: Cog6ToothIcon,
    sections: [
      {
        id: "settings-email",
        heading: "שליחת אימיילים",
        description: "דרך מה נשלחים אישורי ההזמנה ללקוחות. פרטי החיבור עצמם שמורים בשרת.",
        fields: [
          {
            key: "email_use_gmail",
            label: "שליחה דרך Gmail",
            kind: "toggle",
            icon: EnvelopeIcon,
            onLabel: "Gmail — נשלח מחשבון Gmail אישי",
            offLabel: "Resend — נשלח מהדומיין של הסטודיו (מומלץ)",
          },
        ],
      },
    ],
  },
];

export const groupFields = (g: ContentGroup) => g.sections.flatMap((s) => s.fields);

export function getContentGroup(id: string): ContentGroup | undefined {
  return CONTENT_GROUPS.find((g) => g.id === id);
}

type Values = Record<string, { he: string; en: string }>;

const isEmptyValue = (v: string | undefined) => !v || !v.trim() || v.trim() === "[]";

/** Filled / total (toggles don't count) and missing English translations. */
export function groupStatus(g: ContentGroup, values: Values) {
  const fields = groupFields(g).filter((f) => f.kind !== "toggle");
  const filled = fields.filter((f) => !isEmptyValue(values[f.key]?.he)).length;
  const missingEn = fields.filter(
    (f) => isBilingual(f) && !isEmptyValue(values[f.key]?.he) && isEmptyValue(values[f.key]?.en)
  ).length;
  return { filled, total: fields.length, missingEn };
}

export function fieldIsEmpty(values: Values, key: string, lang: "he" | "en" = "he") {
  return isEmptyValue(values[key]?.[lang]);
}
