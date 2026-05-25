import { Navbar } from "@/components/storefront/Navbar";
import { NavbarBanner } from "@/components/storefront/NavbarBanner";
import { Footer } from "@/components/storefront/Footer";
import { CartDrawer } from "@/components/storefront/CartDrawer";
import { WhatsAppButton } from "@/components/storefront/WhatsAppButton";
import { getSiteContent } from "@/lib/content";

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const content = await getSiteContent();
  const bannerEnabled = content.banner_enabled === "true";
  const bannerText = content.banner_text?.trim();

  return (
    <div className="flex min-h-screen flex-col">
      {bannerEnabled && bannerText && (
        <NavbarBanner
          text={bannerText}
          href={content.banner_link?.trim() || undefined}
        />
      )}
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer footerText={content.footer_text} />
      <CartDrawer />
      <WhatsAppButton
        number={content.whatsapp_number}
        message={content.whatsapp_message}
      />
    </div>
  );
}
