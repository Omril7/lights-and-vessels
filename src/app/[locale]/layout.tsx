import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { LocaleHtml } from "@/components/LocaleHtml";

const SITE_NAME: Record<string, string> = {
  he: "אורות וכלים",
  en: "Lights and Vessels",
};

const SITE_DESCRIPTION: Record<string, string> = {
  he: "אוסף סטודיו קטן של תכשיטים וחפצים לבית, נוצרים לאט ובעבודת יד.",
  en: "A small studio collection of handcrafted jewellery and home objects, made slowly by hand.",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const siteName = SITE_NAME[locale] ?? SITE_NAME.he;
  const description = SITE_DESCRIPTION[locale] ?? SITE_DESCRIPTION.he;
  return {
    title: { template: `%s · ${siteName}`, default: siteName },
    description,
    openGraph: {
      locale: locale === "en" ? "en_US" : "he_IL",
      siteName,
      description,
    },
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }
  const messages = await getMessages();
  return (
    <NextIntlClientProvider messages={messages}>
      <LocaleHtml locale={locale} />
      {children}
    </NextIntlClientProvider>
  );
}
