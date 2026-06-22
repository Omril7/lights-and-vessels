"use client";

import { useEffect } from "react";

export function LocaleHtml({ locale }: { locale: string }) {
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "he" ? "rtl" : "ltr";
  }, [locale]);
  return null;
}
