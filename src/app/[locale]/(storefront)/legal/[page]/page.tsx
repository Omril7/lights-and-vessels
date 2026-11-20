import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LegalPage } from "@/components/storefront/LegalPage";
import { getLegalContent, LEGAL_PAGES, type LegalPageId } from "@/lib/legal";
import { alternatesFor } from "@/lib/seo";

// Reads live settings (shipping price, contact details) into the text.
export const dynamic = "force-dynamic";

const isLegalPage = (p: string): p is LegalPageId => (LEGAL_PAGES as readonly string[]).includes(p);

export async function generateMetadata({
  params,
}: {
  params: { locale: string; page: string };
}): Promise<Metadata> {
  if (!isLegalPage(params.page)) return {};
  const { title, intro } = await getLegalContent(params.page, params.locale);
  return {
    title,
    description: intro,
    alternates: alternatesFor(params.locale, `/legal/${params.page}`),
  };
}

export default async function LegalDocumentPage({
  params,
}: {
  params: { locale: string; page: string };
}) {
  if (!isLegalPage(params.page)) notFound();
  const content = await getLegalContent(params.page, params.locale);
  return <LegalPage page={params.page} {...content} />;
}
