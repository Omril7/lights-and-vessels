import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['he', 'en'],
  defaultLocale: 'he',
  // Hebrew lives at "/" (no prefix); English at "/en".
  localePrefix: 'as-needed',
  // Always start in Hebrew — don't redirect based on the browser language.
  localeDetection: false,
});
