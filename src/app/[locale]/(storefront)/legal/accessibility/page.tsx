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
  const { title, intro } = readLegalContent("accessibility", locale);
  return {
    title,
    description: intro,
    alternates: {
      canonical: `/${locale}/legal/accessibility`,
      languages: { he: `/he/legal/accessibility`, en: `/en/legal/accessibility` },
    },
  };
}

export default async function AccessibilityStatementPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { title, intro, lastUpdated, sections } = readLegalContent("accessibility", locale);
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
