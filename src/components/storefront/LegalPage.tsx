import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getSiteContent } from "@/lib/content";
import { LEGAL_PAGES, type LegalContent, type LegalPageId } from "@/lib/legal";
import { whatsappUrl, cn } from "@/lib/utils";

/**
 * Legal document layout: switcher between the five documents, title + date,
 * hairline-separated sections, and a contact block that links straight to
 * WhatsApp / email.
 */
export async function LegalPage({
  page,
  title,
  intro,
  lastUpdated,
  sections,
}: LegalContent & { page: LegalPageId }) {
  const [t, tFooter, locale] = await Promise.all([
    getTranslations("legal"),
    getTranslations("footer"),
    getLocale(),
  ]);
  const content = await getSiteContent({ locale });

  return (
    <div className="paper-grain px-5 pb-16 pt-10 sm:px-[5vw] md:pt-14">
      <div className="mx-auto w-[min(46rem,100%)]">
        {/* Document switcher */}
        <nav aria-label={t("documents")} className="flex flex-wrap gap-2">
          {LEGAL_PAGES.map((p) => (
            <Link
              key={p}
              href={`/legal/${p}`}
              aria-current={p === page ? "page" : undefined}
              className={cn(
                "flex min-h-[40px] items-center border px-3.5 text-sm font-light transition-colors",
                p === page ? "border-ink bg-ink text-cream" : "border-stone text-ink hover:border-ink"
              )}
            >
              {tFooter(p)}
            </Link>
          ))}
        </nav>

        <header className="mt-12 border-b border-stone pb-8">
          <h1 className="font-serif text-4xl leading-tight text-ink md:text-5xl">{title}</h1>
          {lastUpdated && (
            <p className="mt-3 text-xs tracking-[0.04em] text-charcoal/65">
              {t("lastUpdated")}
              {lastUpdated}
            </p>
          )}
          {intro && <p className="mt-5 text-base font-light leading-relaxed text-ink-2">{intro}</p>}
        </header>

        <div className="legal-prose">
          {sections.map((s, i) => (
            <section key={i} className="border-b border-stone py-8">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  a: ({ href = "", children }) =>
                    href.startsWith("/") ? (
                      <Link href={href}>{children}</Link>
                    ) : (
                      <a href={href} target="_blank" rel="noopener noreferrer">
                        {children}
                      </a>
                    ),
                }}
              >
                {s}
              </ReactMarkdown>
            </section>
          ))}
        </div>

        {/* Contact */}
        <div className="mt-12 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-serif text-xl text-ink">{t("question")}</p>
          <div className="flex flex-wrap gap-2.5">
            {content.whatsapp_number && (
              <a
                href={whatsappUrl(content.whatsapp_number)}
                target="_blank"
                rel="noopener noreferrer"
                className="ink flex min-h-[44px] items-center border-[1.5px] border-stamp px-5 text-sm font-bold text-stamp transition-opacity hover:opacity-70"
              >
                {t("whatsapp")}
              </a>
            )}
            {content.contact_email && (
              <a
                href={`mailto:${content.contact_email}`}
                className="ink flex min-h-[44px] items-center border-[1.5px] border-stamp px-5 text-sm font-bold text-stamp transition-opacity hover:opacity-70"
              >
                {t("email")}
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
