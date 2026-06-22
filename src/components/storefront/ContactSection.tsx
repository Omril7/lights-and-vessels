import { getTranslations } from "next-intl/server";
import { EnvelopeIcon } from "@heroicons/react/24/outline";
import { FadeIn } from "@/components/ui/FadeIn";
import { whatsappUrl } from "@/lib/utils";

export async function ContactSection({
  heading,
  text,
  whatsappNumber,
  whatsappMessage,
  email,
}: {
  heading: string;
  text: string;
  whatsappNumber: string;
  whatsappMessage: string;
  email: string;
}) {
  const t = await getTranslations("contact");

  return (
    <section id="contact" className="wash border-t border-charcoal/10">
      <div className="mx-auto max-w-2xl px-5 py-20 text-center md:px-8 md:py-28">
        <FadeIn>
          <p className="text-xs uppercase tracking-wider2 text-copper">
            {t("label")}
          </p>
          <h2 className="mt-3 font-serif text-3xl text-ink md:text-4xl">
            {heading}
          </h2>
          <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-charcoal/80">
            {text}
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            {whatsappNumber && (
              <a
                href={whatsappUrl(whatsappNumber, whatsappMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-7 py-3.5 text-sm font-medium text-white shadow-soft transition hover:shadow-lift"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
                  <path d="M19.05 4.91A9.82 9.82 0 0 0 12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.004c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01zM12.04 20.15a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.18 8.18 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24a8.2 8.2 0 0 1 8.24 8.24c0 4.54-3.7 8.24-8.24 8.24zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.51.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43h-.48a.92.92 0 0 0-.66.31c-.23.25-.87.85-.87 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.25 3.75.59.26 1.06.41 1.42.52.6.19 1.14.16 1.57.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.1-.22-.16-.47-.28z" />
                </svg>
                {t("whatsapp")}
              </a>
            )}
            {email && (
              <a
                href={`mailto:${email}`}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-charcoal/40 px-7 py-3.5 text-sm font-medium text-charcoal transition hover:border-charcoal hover:bg-charcoal/[0.04]"
              >
                <EnvelopeIcon className="h-5 w-5" />
                {email}
              </a>
            )}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
