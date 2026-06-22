import slugify from "slugify";

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency: "ILS",
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
}

export function formatDate(date: Date | string, locale = "he"): string {
  return new Intl.DateTimeFormat(locale === "he" ? "he-IL" : "en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export function makeSlug(input: string): string {
  return slugify(input, { lower: true, strict: true, trim: true });
}

/**
 * Very small markdown → HTML renderer for product/site copy.
 * Supports headings, bold, italics, links, unordered lists and paragraphs.
 */
export function renderMarkdown(md: string): string {
  const escape = (s: string) =>
    s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

  const inline = (s: string) =>
    escape(s)
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(
        /\[(.+?)\]\((.+?)\)/g,
        '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
      );

  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const html: string[] = [];
  let listOpen = false;
  let para: string[] = [];

  const flushPara = () => {
    if (para.length) {
      html.push(`<p>${inline(para.join(" "))}</p>`);
      para = [];
    }
  };
  const closeList = () => {
    if (listOpen) {
      html.push("</ul>");
      listOpen = false;
    }
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      flushPara();
      closeList();
      continue;
    }
    if (line.startsWith("### ")) {
      flushPara();
      closeList();
      html.push(`<h3>${inline(line.slice(4))}</h3>`);
    } else if (line.startsWith("## ")) {
      flushPara();
      closeList();
      html.push(`<h2>${inline(line.slice(3))}</h2>`);
    } else if (line.startsWith("- ")) {
      flushPara();
      if (!listOpen) {
        html.push("<ul>");
        listOpen = true;
      }
      html.push(`<li>${inline(line.slice(2))}</li>`);
    } else {
      closeList();
      para.push(line);
    }
  }
  flushPara();
  closeList();
  return html.join("");
}

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function localize<T extends Record<string, unknown>>(
  obj: T,
  field: string,
  locale: string
): string {
  const localized = obj[`${field}_${locale}`] as string | null | undefined;
  const fallback = obj[`${field}_he`] as string;
  return localized ?? fallback;
}

/** Builds a wa.me link from a number (any format) and an optional message. */
export function whatsappUrl(rawNumber: string, message?: string): string {
  const digits = (rawNumber || "").replace(/\D/g, "");
  const base = `https://wa.me/${digits}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
