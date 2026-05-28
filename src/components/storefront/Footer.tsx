import Link from "next/link";
import { CATEGORIES } from "@/types";
import { type SocialLink } from "@/lib/content";
import { getPlatform } from "@/lib/social";

export function Footer({
  footerText,
  socialLinks,
}: {
  footerText: string;
  socialLinks: SocialLink[];
}) {
  const year = new Date().getFullYear();
  const items = socialLinks
    .map((l) => ({ ...l, platform: getPlatform(l.platform) }))
    .filter((l): l is { platform: NonNullable<ReturnType<typeof getPlatform>>; url: string } => !!l.platform);

  return (
    <footer className="mt-24 border-t border-charcoal/10 bg-linen paper-grain">
      <div className="mx-auto grid max-w-editorial gap-10 px-5 py-14 md:grid-cols-3 md:px-8">
        <div>
          <p className="font-serif text-2xl text-ink">
            סטודיו <span className="text-copper">·</span> אורות וכלים
          </p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-charcoal/70">
            {footerText}
          </p>
          {items.length > 0 && (
            <ul className="mt-5 flex items-center gap-3">
              {items.map(({ platform, url }) => (
                <li key={platform.slug}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={platform.label}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-charcoal/15 text-charcoal/70 transition hover:border-copper hover:text-copper"
                  >
                    <platform.Icon className="h-4 w-4" />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h3 className="text-xs uppercase tracking-wider2 text-charcoal/60">
            ניווט
          </h3>
          <ul className="mt-4 space-y-2 text-sm text-charcoal/80">
            <li>
              <Link href="/" className="hover:text-ink">
                בית
              </Link>
            </li>
            <li>
              <Link href="/shop" className="hover:text-ink">
                החנות
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-ink">
                הסיפור שלי
              </Link>
            </li>
            <li>
              <Link href="/cart" className="hover:text-ink">
                עגלת הקניות
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-xs uppercase tracking-wider2 text-charcoal/60">
            קטגוריות
          </h3>
          <ul className="mt-4 space-y-2 text-sm text-charcoal/80">
            {CATEGORIES.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/shop?category=${c.slug}`}
                  className="hover:text-ink"
                >
                  {c.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-charcoal/10">
        <div className="mx-auto flex max-w-editorial flex-col items-center justify-between gap-2 px-5 py-5 text-xs text-charcoal/60 md:flex-row md:px-8">
          <p>© {year} סטודיו אורות וכלים. כל הזכויות שמורות.</p>
          <p>נוצר באהבה, פריט אחר פריט.</p>
        </div>
      </div>
    </footer>
  );
}
