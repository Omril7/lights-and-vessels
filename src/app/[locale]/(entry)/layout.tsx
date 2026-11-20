import { getTranslations } from "next-intl/server";
import { draftMode } from "next/headers";
import { CartDrawer } from "@/components/storefront/CartDrawer";
import { AccessibilityWidget } from "@/components/a11y/AccessibilityWidget";
import { PreviewBanner } from "@/components/storefront/PreviewBanner";

/** Entry page: full-screen, no site header or footer — it carries its own nav. */
export default async function EntryLayout({ children }: { children: React.ReactNode }) {
  const t = await getTranslations("layout");
  return (
    <div className="storefront min-h-screen font-sans">
      <a href="#main-content" className="skip-link">
        {t("skipToContent")}
      </a>
      <main id="main-content" tabIndex={-1}>
        {children}
      </main>
      <CartDrawer />
      <AccessibilityWidget />
      {draftMode().isEnabled && <PreviewBanner />}
    </div>
  );
}
