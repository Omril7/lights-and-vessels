import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { type SocialLink } from "@/lib/content";
import { getPlatform } from "@/lib/social";

/**
 * Dark footer bar — always dark, whatever the colour theme, so the page ends
 * the way the entry page begins.
 */
export async function Footer({
  footerText,
  socialLinks,
}: {
  footerText: string;
  socialLinks: SocialLink[];
}) {
  const [t, tNav] = await Promise.all([
    getTranslations("footer"),
    getTranslations("nav"),
  ]);
  const year = new Date().getFullYear();
  const social = socialLinks
    .map((l) => ({ ...l, platform: getPlatform(l.platform) }))
    .filter(
      (l): l is { platform: NonNullable<ReturnType<typeof getPlatform>>; url: string } =>
        !!l.platform
    );

  const NAV_LINKS = [
    { href: "/shop", label: tNav("shop") },
    { href: "/gallery", label: t("galleryLink") },
    { href: "/about", label: tNav("about") },
    { href: "/blog", label: t("blogLink") },
  ];
  const LEGAL_LINKS = [
    { href: "/legal/terms", label: t("terms") },
    { href: "/legal/privacy", label: t("privacy") },
    { href: "/legal/returns", label: t("returns") },
    { href: "/legal/shipping", label: t("shipping") },
    { href: "/legal/accessibility", label: t("accessibility") },
  ];

  return (
    <footer className="on-dark mt-24 bg-[#120e0b] text-[#8c8270]">
      <div className="flex flex-col gap-10 px-5 pb-10 pt-16 sm:px-[5vw]">
        <div className="flex flex-wrap items-start justify-between gap-8">
          <div className="flex flex-col gap-3">
            <Image
              src="/logo-2169x1282-black.png"
              alt={t("studioName")}
              width={140}
              height={83}
              className="h-auto w-[140px]"
              style={{ filter: "invert(0.9) sepia(0.25)", mixBlendMode: "screen" }}
            />
            {footerText && (
              <p className="max-w-xs text-sm font-light text-[#b5aa94]">{footerText}</p>
            )}
          </div>

          <div className="flex flex-wrap gap-x-14 gap-y-6 text-sm font-light">
            <LinkList label={t("navLabel")} links={NAV_LINKS} />
            <LinkList label={t("legalLabel")} links={LEGAL_LINKS} />
          </div>
        </div>

        <div className="h-px bg-[#2a211b]" />

        <div className="flex flex-wrap items-center justify-between gap-4 text-[0.8rem] font-light">
          <p>{t("tagline")}</p>
          <div className="flex flex-wrap items-center gap-5">
            {social.map(({ platform, url }) => (
              <a
                key={platform.slug}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={platform.label}
                className="text-[#b5aa94] transition-colors hover:text-[#f2ebda]"
              >
                <platform.Icon className="h-4 w-4" />
              </a>
            ))}
            <p>{t("copyright", { year })}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

function LinkList({ label, links }: { label: string; links: { href: string; label: string }[] }) {
  return (
    <nav aria-label={label}>
      <p className="mb-3 text-xs text-[#6e6457]">{label}</p>
      <ul className="flex flex-col gap-2">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="text-[#b5aa94] transition-colors hover:text-[#f2ebda]">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
