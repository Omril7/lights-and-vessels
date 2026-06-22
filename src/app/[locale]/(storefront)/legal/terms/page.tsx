import type { Metadata } from "next";
import { FadeIn } from "@/components/ui/FadeIn";
import { Markdown } from "@/components/ui";
import { LegalPage } from "@/components/storefront/LegalPage";
import { readLegalContent } from "@/lib/legal";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const { title, intro } = readLegalContent("terms", locale);
  return {
    title,
    description: intro,
    alternates: {
      canonical: `/${locale}/legal/terms`,
      languages: { he: `/he/legal/terms`, en: `/en/legal/terms` },
    },
  };
}

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { title, intro, lastUpdated, sections } = readLegalContent("terms", locale);
  return (
    <LegalPage title={title} intro={intro} lastUpdated={lastUpdated}>
      {sections.map((s, i) => (
        <FadeIn key={i}>
          <Markdown source={s} className="" />
        </FadeIn>
      ))}
    </LegalPage>
  );
}
