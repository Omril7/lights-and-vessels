import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function NotFound() {
  const t = await getTranslations("errors");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 px-5 text-center">
      <p className="font-serif text-7xl text-clay">404</p>
      <h1 className="font-serif text-3xl text-ink">{t("notFound")}</h1>
      <p className="max-w-sm text-charcoal/60">
        {t("notFoundMessage")}
      </p>
      <Link
        href="/"
        className="rounded-full bg-charcoal px-6 py-3 text-sm text-cream transition hover:bg-ink"
      >
        {t("notFoundBack")}
      </Link>
    </div>
  );
}
