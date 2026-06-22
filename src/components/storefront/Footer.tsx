import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { type SocialLink } from "@/lib/content";
import { getPlatform } from "@/lib/social";
import { LanguageSwitcher } from "@/components/storefront/LanguageSwitcher";

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
  const items = socialLinks
    .map((l) => ({ ...l, platform: getPlatform(l.platform) }))
    .filter((l): l is { platform: NonNullable<ReturnType<typeof getPlatform>>; url: string } => !!l.platform);

  const NAV_LINKS = [
    { href: "/", label: tNav("home") },
    { href: "/shop", label: tNav("shop") },
    { href: "/about", label: t("aboutLink") },
    { href: "/cart", label: t("cartLink") },
  ];

  const LEGAL_LINKS = [
    { href: "/legal/terms", label: t("terms") },
    { href: "/legal/privacy", label: t("privacy") },
    { href: "/legal/returns", label: t("returns") },
    { href: "/legal/shipping", label: t("shipping") },
    { href: "/legal/accessibility", label: t("accessibility") },
  ];

  return (
    <footer className="mt-24 border-t border-charcoal/10 bg-linen paper-grain">
      <div className="mx-auto max-w-editorial px-5 py-8 md:px-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <p className="font-serif text-xl text-ink">
              {t("studioName")}
            </p>
            <p className="mt-1 text-sm text-charcoal/65">{footerText}</p>
          </div>
          {items.length > 0 && (
            <ul className="flex items-center gap-2">
              {items.map(({ platform, url }) => (
                <li key={platform.slug}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={platform.label}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-charcoal/15 text-charcoal/70 transition hover:border-copper hover:text-copper"
                  >
                    <platform.Icon className="h-4 w-4" />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-6 grid gap-4 border-t border-charcoal/10 pt-5 text-xs text-charcoal/70 md:grid-cols-2 md:gap-10">
          <nav aria-label={t("navLabel")}>
            <p className="mb-2 text-[0.65rem] uppercase tracking-wider2 text-charcoal/45">
              {t("navLabel")}
            </p>
            <InlineLinks links={NAV_LINKS} />
          </nav>
          <nav aria-label={t("legalLabel")}>
            <p className="mb-2 text-[0.65rem] uppercase tracking-wider2 text-charcoal/45">
              {t("legalLabel")}
            </p>
            <InlineLinks links={LEGAL_LINKS} />
          </nav>
        </div>
      </div>

      <div className="border-t border-charcoal/10">
        <div className="mx-auto flex max-w-editorial flex-col items-center justify-between gap-2 px-5 py-3 text-[0.7rem] text-charcoal/55 md:flex-row md:px-8">
          <p>{t("copyright", { year })}</p>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <p>{t("tagline")}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

function InlineLinks({
  links,
}: {
  links: { href: string; label: string }[];
}) {
  return (
    <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
      {links.map((l, i) => (
        <span key={l.href} className="flex items-center gap-x-3">
          <Link href={l.href} className="hover:text-ink">
            {l.label}
          </Link>
          {i < links.length - 1 && (
            <span className="text-charcoal/25">·</span>
          )}
        </span>
      ))}
    </span>
  );
}
