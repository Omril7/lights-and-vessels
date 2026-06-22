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
  const { title, intro } = readLegalContent("privacy", locale);
  return {
    title,
    description: intro,
    alternates: {
      canonical: `/${locale}/legal/privacy`,
      languages: { he: `/he/legal/privacy`, en: `/en/legal/privacy` },
    },
  };
}

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { title, intro, lastUpdated, sections } = readLegalContent("privacy", locale);
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
