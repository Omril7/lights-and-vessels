import { getTranslations } from "next-intl/server";
import { FadeIn } from "@/components/ui/FadeIn";
import { Link } from "@/i18n/navigation";

export async function LegalPage({
  title,
  intro,
  lastUpdated,
  children,
}: {
  title: string;
  intro: string;
  lastUpdated: string;
  children: React.ReactNode;
}) {
  const t = await getTranslations("legal");
  return (
    <main className="mx-auto max-w-3xl px-5 py-16 sm:py-24">
      <FadeIn>
        <p className="text-xs uppercase tracking-wider2 text-charcoal/55">
          {t("document")}
        </p>
        <h1 className="mt-2 font-serif text-4xl text-ink sm:text-5xl">{title}</h1>
        <p className="mt-2 text-sm text-charcoal/55">
          {t("lastUpdated")}
          {lastUpdated}
        </p>
        <p className="mt-4 text-charcoal/75">{intro}</p>
      </FadeIn>

      <div className="prose-art mt-10 space-y-8 text-charcoal">{children}</div>

      <FadeIn>
        <div className="mt-14 border-t border-charcoal/10 pt-8 text-center text-sm text-charcoal/65">
          {t("question")}
          <Link href="/about" className="text-copper hover:underline">
            {t("contactLink")}
          </Link>
          {t("contactSuffix")}
        </div>
        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-charcoal/60 transition hover:text-ink">
            {t("backToHome")}
          </Link>
        </div>
      </FadeIn>
    </main>
  );
}
