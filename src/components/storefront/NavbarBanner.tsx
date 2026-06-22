"use client";

import { Link } from "@/i18n/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useTranslations } from "next-intl";

/**
 * Top-of-page announcement banner, content controlled by the artist via
 * SiteContent (keys: `banner_enabled`, `banner_text`, `banner_link`).
 * Dismissible per-text, scoped to the browser session (sessionStorage):
 *   - A new browser session always shows the banner again.
 *   - Even within the same session, changing `banner_text` re-shows the
 *     banner because the dismiss key includes the current text.
 */
export function NavbarBanner({
  text,
  href,
}: {
  text: string;
  href?: string;
}) {
  const t = useTranslations("banner");
  const [dismissed, setDismissed] = useState(true); // start hidden to avoid flash
  const storageKey = `banner-dismissed:${text}`;

  useEffect(() => {
    try {
      setDismissed(sessionStorage.getItem(storageKey) === "1");
    } catch {
      setDismissed(false);
    }
  }, [storageKey]);

  const dismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem(storageKey, "1");
    } catch {
      /* storage may be unavailable */
    }
  };

  const Inner = (
    <span className="text-center text-[0.78rem] font-medium tracking-wide sm:text-sm">
      {text}
    </span>
  );

  return (
    <AnimatePresence initial={false}>
      {!dismissed && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden bg-charcoal text-cream"
          role="region"
          aria-label={t("ariaLabel")}
        >
          <div className="relative mx-auto flex max-w-editorial items-center justify-center px-10 py-2">
            {href ? (
              <Link
                href={href}
                className="underline-offset-4 transition hover:underline"
              >
                {Inner}
              </Link>
            ) : (
              Inner
            )}
            <button
              type="button"
              onClick={dismiss}
              aria-label={t("closeLabel")}
              className="absolute end-2 inline-flex h-7 w-7 items-center justify-center rounded-full text-cream/70 transition hover:bg-cream/10 hover:text-cream"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
