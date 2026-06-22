import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { PlusIcon, PencilSquareIcon, ChevronRightIcon, ChevronLeftIcon } from "@heroicons/react/24/outline";
import { formatDate, cn } from "@/lib/utils";
import { BlogFilterBar, buildBlogHref } from "@/components/admin/BlogFilterBar";

export const dynamic = "force-dynamic";
export const metadata = { title: "בלוג" };

const PAGE_SIZE = 20;

type SearchParams = { q?: string; status?: string; page?: string };

function pageNumbers(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const out: (number | "…")[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) out.push("…");
  for (let i = start; i <= end; i++) out.push(i);
  if (end < total - 1) out.push("…");
  out.push(total);
  return out;
}

export default async function AdminBlogPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const q = (searchParams.q ?? "").trim();
  const status = searchParams.status ?? "all";
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10) || 1);

  const where: Record<string, unknown> = {};
  if (status && status !== "all") where.status = status;
  if (q) {
    where.OR = [
      { title_he: { contains: q } },
      { slug: { contains: q } },
      { excerpt_he: { contains: q } },
    ];
  }

  const total = await prisma.blogPost.count({ where });
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  const posts = await prisma.blogPost.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip: (safePage - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    include: {
      tags: { include: { tag: true } },
      images: { orderBy: { order: "asc" }, take: 1 },
    },
  });

  const filtersActive = q !== "" || status !== "all";

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wider2 text-charcoal/50">ניהול</p>
          <h1 className="mt-1 font-serif text-3xl text-charcoal">בלוג</h1>
          <p className="mt-1 text-sm text-charcoal/60">
            {filtersActive ? `${total} תוצאות` : `${total} פוסטים`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button href="/admin/blog/tags" size="sm" variant="outline">תגיות</Button>
          <Button href="/admin/blog/new" size="sm">
            <PlusIcon className="h-4 w-4" /> פוסט חדש
          </Button>
        </div>
      </header>

      <BlogFilterBar
        initialQ={q}
        initialStatus={status}
        filtersActive={filtersActive}
      />

      <section className="rounded-2xl border border-charcoal/10 bg-cream shadow-soft overflow-hidden">
        {posts.length === 0 ? (
          <p className="px-5 py-12 text-center text-sm text-charcoal/50">
            {filtersActive ? (
              <>אין תוצאות תואמות. <Link href="/admin/blog" className="text-copper hover:underline">ניקוי המסננים</Link></>
            ) : (
              <>אין עדיין פוסטים. <Link href="/admin/blog/new" className="text-copper hover:underline">לכתוב את הראשון</Link>.</>
            )}
          </p>
        ) : (
          <ul className="divide-y divide-charcoal/5">
            {posts.map((p) => (
              <li key={p.id} className="flex items-center gap-4 px-5 py-3">
                <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-md bg-linen">
                  {p.images[0]?.url && (
                    <Image src={p.images[0].url} alt={p.title_he} fill className="object-cover" sizes="80px" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <Link href={`/admin/blog/${p.id}/edit`} className="font-medium text-charcoal hover:text-copper">
                    {p.title_he}
                  </Link>
                  <p className="text-xs text-charcoal/50" dir="ltr">/{p.slug}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    {p.status === "published" ? (
                      <Badge tone="neutral">מפורסם</Badge>
                    ) : (
                      <Badge tone="accent">טיוטה</Badge>
                    )}
                    {p.tags.map((t) => (
                      <span key={t.tagId} className="rounded-full bg-linen/80 px-2 py-0.5 text-[0.65rem] text-charcoal/70">
                        {t.tag.name_he}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="hidden sm:block text-xs text-charcoal/50">
                  {p.publishedAt ? formatDate(p.publishedAt) : "—"}
                </div>
                <Link href={`/admin/blog/${p.id}/edit`} className="inline-flex items-center gap-1 text-xs text-charcoal/60 hover:text-charcoal">
                  <PencilSquareIcon className="h-4 w-4" /> עריכה
                </Link>
              </li>
            ))}
          </ul>
        )}

        {totalPages > 1 && (
          <nav className="flex items-center justify-between gap-3 border-t border-charcoal/10 bg-linen/40 px-4 py-3 text-sm">
            <p className="text-charcoal/60">עמוד {safePage} מתוך {totalPages}</p>
            <div className="flex items-center gap-1">
              <PageLink params={searchParams} target={safePage - 1} disabled={safePage <= 1} aria-label="עמוד קודם">
                <ChevronRightIcon className="h-4 w-4" aria-hidden />
              </PageLink>
              {pageNumbers(safePage, totalPages).map((n, i) =>
                n === "…" ? (
                  <span key={`gap-${i}`} className="px-2 text-charcoal/40" aria-hidden>…</span>
                ) : (
                  <PageLink key={n} params={searchParams} target={n} active={n === safePage}>{n}</PageLink>
                )
              )}
              <PageLink params={searchParams} target={safePage + 1} disabled={safePage >= totalPages} aria-label="עמוד הבא">
                <ChevronLeftIcon className="h-4 w-4" aria-hidden />
              </PageLink>
            </div>
          </nav>
        )}
      </section>
    </div>
  );
}

function PageLink({
  params,
  target,
  active,
  disabled,
  children,
  ...rest
}: {
  params: SearchParams;
  target: number;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
} & React.AriaAttributes) {
  const className = cn(
    "inline-flex h-8 min-w-[2rem] items-center justify-center rounded-lg px-2 text-sm transition-colors",
    active ? "bg-charcoal text-cream" : "text-charcoal/70 hover:bg-charcoal/[0.06]",
    disabled && "pointer-events-none opacity-30"
  );
  if (disabled) return <span className={className} {...rest}>{children}</span>;
  return (
    <Link
      href={buildBlogHref({ ...params, page: String(target) })}
      className={className}
      {...rest}
    >
      {children}
    </Link>
  );
}
