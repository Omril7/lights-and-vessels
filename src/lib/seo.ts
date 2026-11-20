import { routing } from "@/i18n/routing";

/**
 * Public path for a locale. Hebrew (the default) has no prefix — "/shop" —
 * English lives under "/en" — "/en/shop". `path` starts with "/" ("/" = home).
 */
export function localePath(locale: string, path: string): string {
  if (locale === routing.defaultLocale) return path;
  return path === "/" ? `/${locale}` : `/${locale}${path}`;
}

/** Next.js `alternates` metadata: canonical for this locale + hreflang links. */
export function alternatesFor(locale: string, path: string) {
  return {
    canonical: localePath(locale, path),
    languages: Object.fromEntries(
      routing.locales.map((l) => [l, localePath(l, path)])
    ) as Record<string, string>,
  };
}
