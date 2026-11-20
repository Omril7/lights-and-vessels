import Link from "next/link";
import { getSiteContentBilingual } from "@/lib/content";
import { CONTENT_GROUPS, groupStatus } from "@/lib/site-content-schema";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "עמודי האתר" };

/** Overview: one card per site page, with how much of it is filled in. */
export default async function AdminSiteContentPage() {
  const values = await getSiteContentBilingual();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header>
        <h1 className="font-serif text-3xl text-ink">עמודי האתר</h1>
        <p className="mt-1 text-sm text-charcoal/70">
          בחרו עמוד כדי לערוך את הטקסטים והתמונות שלו. כל שינוי נשמר לעמוד הזה בלבד.
        </p>
      </header>

      <ul className="grid gap-4 sm:grid-cols-2">
        {CONTENT_GROUPS.map((g) => {
          const { filled, total, missingEn } = groupStatus(g, values);
          const Icon = g.icon;
          const pct = total ? Math.round((filled / total) * 100) : 100;
          return (
            <li key={g.id}>
              <Link
                href={`/admin/site-content/${g.id}`}
                className="group flex h-full flex-col gap-3 border border-charcoal/15 bg-cream p-5 transition-colors hover:border-ink"
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-linen text-charcoal">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <h2 className="font-serif text-xl text-ink group-hover:text-accent">{g.label}</h2>
                    <p className="mt-0.5 text-sm text-charcoal/65">{g.description}</p>
                  </div>
                </div>
                {total > 0 && (
                  <div className="mt-auto space-y-1.5 pt-1">
                    <div className="flex justify-between text-xs text-charcoal/65">
                      <span>
                        {filled} מתוך {total} מולאו
                      </span>
                      {missingEn > 0 && <span className="text-accent">{missingEn} חסרים באנגלית</span>}
                    </div>
                    <div className="h-1 bg-charcoal/10" aria-hidden>
                      <div
                        className={cn("h-full", pct === 100 ? "bg-moss" : "bg-ink")}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
