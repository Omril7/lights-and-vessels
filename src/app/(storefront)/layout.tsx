import { Suspense } from "react";
import { Navbar } from "@/components/storefront/Navbar";
import { NavbarBanner } from "@/components/storefront/NavbarBanner";
import { Footer } from "@/components/storefront/Footer";
import { CartDrawer } from "@/components/storefront/CartDrawer";
import { WhatsAppButton } from "@/components/storefront/WhatsAppButton";
import { getSiteContent, parseSocialLinks } from "@/lib/content";

async function BannerSlot() {
  const content = await getSiteContent();
  const enabled = content.banner_enabled === "true";
  const text = content.banner_text?.trim();
  if (!enabled || !text) return null;
  return <NavbarBanner text={text} href={content.banner_link?.trim() || undefined} />;
}

async function FooterSlot() {
  const content = await getSiteContent();
  return (
    <Footer
      footerText={content.footer_text}
      socialLinks={parseSocialLinks(content.social_links)}
    />
  );
}

async function WhatsAppSlot() {
  const content = await getSiteContent();
  return (
    <WhatsAppButton
      number={content.whatsapp_number}
      message={content.whatsapp_message}
    />
  );
}

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main-content" className="skip-link">
        דלגו לתוכן הראשי
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
    </div>
  );
}
