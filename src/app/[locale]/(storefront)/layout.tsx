import { Suspense } from "react";
import { getTranslations, getLocale } from "next-intl/server";
import { Navbar } from "@/components/storefront/Navbar";
import { NavbarBanner } from "@/components/storefront/NavbarBanner";
import { Footer } from "@/components/storefront/Footer";
import { CartDrawer } from "@/components/storefront/CartDrawer";
import { WhatsAppButton } from "@/components/storefront/WhatsAppButton";
import { AccessibilityWidget } from "@/components/a11y/AccessibilityWidget";
import { draftMode } from "next/headers";
import { getSiteContent, parseSocialLinks } from "@/lib/content";
import { PreviewBanner } from "@/components/storefront/PreviewBanner";

async function BannerSlot() {
  const locale = await getLocale();
  const content = await getSiteContent({ locale });
  const enabled = content.banner_enabled === "true";
  const text = content.banner_text?.trim();
  if (!enabled || !text) return null;
  return <NavbarBanner text={text} href={content.banner_link?.trim() || undefined} />;
}

async function FooterSlot() {
  const locale = await getLocale();
  const content = await getSiteContent({ locale });
  return (
    <Footer
      footerText={content.footer_text}
      socialLinks={parseSocialLinks(content.social_links)}
    />
  );
}

async function WhatsAppSlot() {
  const locale = await getLocale();
  const content = await getSiteContent({ locale });
  return (
    <WhatsAppButton
      number={content.whatsapp_number}
      message={content.whatsapp_message}
    />
  );
}

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isPreview = draftMode().isEnabled;
  const t = await getTranslations("layout");
  const skipToContent = t("skipToContent");
  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main-content" className="skip-link">
        {skipToContent}
      </a>
      <Suspense fallback={null}>
        <BannerSlot />
      </Suspense>
      <Navbar />
      <main id="main-content" tabIndex={-1} className="flex-1">
        {children}
      </main>
      <Suspense fallback={null}>
        <FooterSlot />
      </Suspense>
      <CartDrawer />
      <Suspense fallback={null}>
        <WhatsAppSlot />
      </Suspense>
      <AccessibilityWidget />
      {isPreview && <PreviewBanner />}
    </div>
  );
}
