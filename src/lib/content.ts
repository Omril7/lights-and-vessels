import { cache } from "react";
import { unstable_cache } from "next/cache";
import { draftMode } from "next/headers";
import { prisma } from "@/lib/prisma";

// Cross-request cache: site content rows are cached for 60s so the layout doesn't
// hit Supabase on every navigation. Tagged so the admin API can revalidate instantly.
const getCachedContentRows = unstable_cache(
  () => prisma.siteContent.findMany(),
  ["site-content-rows"],
  { revalidate: 60, tags: ["site-content"] }
);

// Within a single render pass, deduplicate draft row reads (draft mode only).
const fetchDraftRows = cache(async () => prisma.siteContentDraft.findMany());

/** Fallback copy so the storefront still renders if a key is missing. */
const FALLBACKS: Record<string, string> = {
  hero_title: "חפצים שנוצרים לאט, ביד",
  hero_subtitle: "אוסף סטודיו קטן של תכשיטים וחפצים לבית.",
  hero_image: "https://picsum.photos/seed/hero-studio/1600/1200",
  hero_cta: "לגלות את האוסף",
  story_teaser: "הכול כאן מתחיל על שולחן עץ בלוי לצד חלון.",
  story_image: "https://picsum.photos/seed/studio-bench/900/1100",
  about_text: "## הסיפור שלי\n\nתוכן בקרוב.",
  about_portrait: "https://picsum.photos/seed/artist-portrait/900/1100",
  whatsapp_number: "972500000000",
  whatsapp_message: "היי! הגעתי דרך האתר ואשמח לשמוע עוד על העבודות.",
  contact_email: "studio@example.com",
  contact_heading: "בואו נדבר",
  contact_text:
    "יש לכם שאלה על פריט, רעיון להגיד שלום, או רעיון להזמנה אישית? אני קורא כל הודעה בעצמי.",
  footer_text: "נוצר ביד במנות קטנות.",
  // JSON array of { platform, url }. platform is one of SOCIAL_PLATFORMS in src/lib/social.ts.
  social_links: "[]",
  banner_enabled: "false",
  banner_text: "משלוח חינם בהזמנות מעל ₪250",
  banner_link: "",
  // Shipping
  shipping_post_price: "30",
  shipping_post_eta: "עד 7 ימי עסקים",
  shipping_free_over: "",
  shipping_pickup_address: "",
  shipping_pickup_hours: "",
  shipping_processing_days: "1-3",
  // Email
  email_use_gmail: "false", // false = Resend (default), true = Gmail SMTP
  // About → process gallery. JSON array of { url, alt }.
  process_gallery: "[]",
  // Homepage CategoryStrip — JSON map { "<slug>": "<image-url>" }. Missing/empty = category hidden.
  category_images: "{}",
  // Homepage testimonials — JSON array of { quote, name, detail, image? }.
  testimonials: "[]",
};

export type GalleryItem = { url: string; alt: string };

export function parseCategoryImages(
  value: string | undefined | null
): Record<string, string> {
  if (!value) return {};
  try {
    const obj = JSON.parse(value);
    if (!obj || typeof obj !== "object" || Array.isArray(obj)) return {};
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(obj)) {
      if (typeof v === "string" && v.trim()) out[k] = v;
    }
    return out;
  } catch {
    return {};
  }
}

export type Testimonial = {
  quote: string;
  name: string;
  detail: string;
  image: string;
};

export function parseTestimonials(
  value: string | undefined | null,
  locale = "he"
): Testimonial[] {
  if (!value) return [];
  try {
    const arr = JSON.parse(value);
    if (!Array.isArray(arr)) return [];
    return arr
      .filter((x) => x && typeof x.quote === "string" && x.quote.trim())
      .map((x) => ({
        quote: (locale !== "he" && x.quote_en) ? String(x.quote_en) : String(x.quote),
        name: (locale !== "he" && x.name_en) ? String(x.name_en) : (typeof x.name === "string" ? x.name : ""),
        detail: (locale !== "he" && x.detail_en) ? String(x.detail_en) : (typeof x.detail === "string" ? x.detail : ""),
        image: typeof x.image === "string" ? x.image : "",
      }));
  } catch {
    return [];
  }
}

export function parseGallery(
  value: string | undefined | null,
  locale = "he"
): GalleryItem[] {
  if (!value) return [];
  try {
    const arr = JSON.parse(value);
    if (!Array.isArray(arr)) return [];
    return arr
      .filter((x) => x && typeof x.url === "string" && x.url.trim())
      .map((x) => ({
        url: String(x.url),
        alt: (locale !== "he" && x.alt_en) ? String(x.alt_en) : (typeof x.alt === "string" ? x.alt : ""),
      }));
  } catch {
    return [];
  }
}

export type SocialLink = { platform: string; url: string };

export function parseSocialLinks(value: string | undefined | null): SocialLink[] {
  if (!value) return [];
  try {
    const arr = JSON.parse(value);
    if (!Array.isArray(arr)) return [];
    return arr
      .filter(
        (x) =>
          x &&
          typeof x.platform === "string" &&
          x.platform.trim() &&
          typeof x.url === "string" &&
          x.url.trim(),
      )
      .map((x) => ({ platform: String(x.platform), url: String(x.url) }));
  } catch {
    return [];
  }
}

export type SiteContentMap = Record<string, string>;

export async function getSiteContent(
  opts: { allowDraft?: boolean; locale?: string } = {}
): Promise<SiteContentMap> {
  const { allowDraft = true, locale = "he" } = opts;
  const inDraftMode = allowDraft && draftMode().isEnabled;
  const map: SiteContentMap = { ...FALLBACKS };
  // In normal mode, rows come from the 60s cross-request cache (no DB hit per nav).
  // In draft mode, bypass the cache so edits appear immediately.
  const rows = inDraftMode ? await prisma.siteContent.findMany() : await getCachedContentRows();
  for (const row of rows) {
    map[row.key] = (locale !== "he" && row.value_en) ? row.value_en : row.value_he;
  }
  if (inDraftMode) {
    const drafts = await fetchDraftRows();
    for (const row of drafts) {
      map[row.key] = (locale !== "he" && row.value_en) ? row.value_en : row.value_he;
    }
  }
  return map;
}

export type SiteContentBilingualMap = Record<string, { he: string; en: string }>;

export async function getSiteContentBilingual(): Promise<SiteContentBilingualMap> {
  const map: SiteContentBilingualMap = {};
  for (const [key, val] of Object.entries(FALLBACKS)) {
    map[key] = { he: val, en: "" };
  }
  const rows = await prisma.siteContent.findMany();
  for (const row of rows) {
    map[row.key] = { he: row.value_he, en: row.value_en ?? "" };
  }
  return map;
}
