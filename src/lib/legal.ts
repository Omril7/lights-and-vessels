import { readFileSync } from "fs";
import { join } from "path";

export type LegalContent = {
  title: string;
  intro: string;
  lastUpdated: string;
  sections: string[];
};

export function readLegalContent(page: string, locale: string): LegalContent {
  const raw = tryRead(page, locale) ?? tryRead(page, "he") ?? "";

  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  const fm = match?.[1] ?? "";
  const body = (match?.[2] ?? raw).trim();

  const fmGet = (key: string) =>
    fm.match(new RegExp(`^${key}:\\s*(.+)$`, "m"))?.[1]?.trim() ?? "";

  const sections = body
    .split(/(?=^## )/m)
    .map((s) => s.trim())
    .filter(Boolean);

  return {
    title: fmGet("title"),
    intro: fmGet("intro"),
    lastUpdated: fmGet("lastUpdated"),
    sections,
  };
}

function tryRead(page: string, locale: string): string | null {
  try {
    const content = readFileSync(
      join(process.cwd(), "src/content/legal", `${page}-${locale}.md`),
      "utf-8"
    );
    return content.trim() ? content : null;
  } catch {
    return null;
  }
}
