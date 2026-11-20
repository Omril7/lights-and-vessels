import { readFileSync } from "fs";
import { join } from "path";
import { getSiteContent } from "@/lib/content";

export const LEGAL_PAGES = ["terms", "shipping", "returns", "privacy", "accessibility"] as const;
export type LegalPageId = (typeof LEGAL_PAGES)[number];

export type LegalContent = {
  title: string;
  intro: string;
  lastUpdated: string;
  sections: string[];
};

/**
 * Legal documents live in src/content/legal/<page>-<locale>.md (frontmatter +
 * "## " sections). They may contain {{placeholders}} that are filled from the
 * live site settings, so prices, times and contact details always match the
 * checkout and the admin — e.g. {{post_price}}, {{email}}.
 */
export async function getLegalContent(page: LegalPageId, locale: string): Promise<LegalContent> {
  const vars = await legalVars(locale);
  const raw = fill(tryRead(page, locale) ?? tryRead(page, "he") ?? "", vars);

  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  const fm = match?.[1] ?? "";
  const body = (match?.[2] ?? raw).trim();
  const fmGet = (key: string) => fm.match(new RegExp(`^${key}:\\s*(.+)$`, "m"))?.[1]?.trim() ?? "";

  return {
    title: fmGet("title"),
    intro: fmGet("intro"),
    lastUpdated: fmGet("lastUpdated"),
    sections: body
      .split(/(?=^## )/m)
      .map((s) => s.trim())
      .filter(Boolean),
  };
}

async function legalVars(locale: string): Promise<Record<string, string>> {
  const c = await getSiteContent({ allowDraft: false, locale });
  const he = locale !== "en";
  const price = Number(c.shipping_post_price || "30") || 30;
  const freeOver = Number(c.shipping_free_over || "") || 0;
  const digits = (c.whatsapp_number || "").replace(/\D/g, "");
  return {
    email: c.contact_email || "",
    whatsapp: digits ? `https://wa.me/${digits}` : "",
    post_price: `₪${price}`,
    post_eta: c.shipping_post_eta || (he ? "עד 7 ימי עסקים" : "up to 7 business days"),
    processing_days: c.shipping_processing_days || "1-3",
    free_shipping: freeOver
      ? he
        ? `בהזמנות מעל ₪${freeOver} המשלוח בדואר **חינם** — ההנחה מחושבת אוטומטית בעמוד התשלום.`
        : `Post shipping is **free** on orders over ₪${freeOver} — applied automatically at checkout.`
      : he
        ? "כרגע אין מבצע משלוח חינם. אם יופעל, הוא יחושב אוטומטית בעמוד התשלום."
        : "There is no free-shipping offer at the moment. If one runs, it is applied automatically at checkout.",
  };
}

function fill(text: string, vars: Record<string, string>): string {
  return text.replace(/\{\{(\w+)\}\}/g, (m, k: string) => (k in vars ? vars[k] : m));
}

function tryRead(page: string, locale: string): string | null {
  try {
    const content = readFileSync(join(process.cwd(), "src/content/legal", `${page}-${locale}.md`), "utf-8");
    return content.trim() ? content : null;
  } catch {
    return null;
  }
}
