import { getSiteContent } from "@/lib/content";
import { SiteContentEditor } from "@/components/admin/SiteContentEditor";

export const dynamic = "force-dynamic";
export const metadata = { title: "תוכן האתר" };

export default async function AdminSiteContentPage() {
  const content = await getSiteContent();
  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-wider2 text-charcoal/50">
          ניהול
        </p>
        <h1 className="mt-1 font-serif text-3xl text-charcoal">תוכן האתר</h1>
        <p className="mt-1 text-sm text-charcoal/60">
          עריכת הטקסטים והתמונות שמופיעים בחזית האתר.
        </p>
      </header>
      <SiteContentEditor initial={content} />
    </div>
  );
}
