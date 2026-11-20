import { notFound } from "next/navigation";
import { getSiteContentBilingual } from "@/lib/content";
import { getContentGroup } from "@/lib/site-content-schema";
import { SiteContentEditor } from "@/components/admin/SiteContentEditor";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { group: string } }) {
  return { title: getContentGroup(params.group)?.label ?? "עמודי האתר" };
}

export default async function SiteContentGroupPage({ params }: { params: { group: string } }) {
  const group = getContentGroup(params.group);
  if (!group) notFound();
  const values = await getSiteContentBilingual();
  return <SiteContentEditor groupId={group.id} initial={values} />;
}
