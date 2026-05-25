import { prisma } from "@/lib/prisma";

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
};

export type SiteContentMap = Record<string, string>;

export async function getSiteContent(): Promise<SiteContentMap> {
  const rows = await prisma.siteContent.findMany();
  const map: SiteContentMap = { ...FALLBACKS };
  for (const row of rows) map[row.key] = row.value;
  return map;
}
