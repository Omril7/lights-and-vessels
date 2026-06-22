import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function Markdown({ source, className = "blog-prose" }: { source: string; className?: string }) {
  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
          img: ({ src, alt }) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={src ?? ""} alt={alt ?? ""} loading="lazy" />
          ),
        }}
      >
        {source}
      </ReactMarkdown>
    </div>
  );
}

export function MarkdownCheatSheet() {
  const rows: { syntax: string; result: string }[] = [
    { syntax: "**מודגש**", result: "טקסט עבה" },
    { syntax: "*נטוי*", result: "טקסט נטוי" },
    { syntax: "# כותרת ראשית", result: "כותרת גדולה" },
    { syntax: "## כותרת משנית", result: "כותרת בינונית" },
    { syntax: "### כותרת קטנה", result: "כותרת קטנה" },
    { syntax: "- פריט", result: "רשימה (קו מקף בתחילת כל שורה)" },
    { syntax: "1. פריט", result: "רשימה ממוספרת" },
    { syntax: "[טקסט](https://...)", result: "קישור" },
    { syntax: "![תיאור](url-תמונה)", result: "תמונה" },
    { syntax: "> ציטוט", result: "ציטוט מודגש" },
    { syntax: "---", result: "קו מפריד" },
    { syntax: "`קוד`", result: "טקסט מודגש כקוד" },
  ];
  return (
    <div className="rounded-xl border border-charcoal/10 bg-linen/40 p-3 text-xs">
      <p className="mb-2 font-medium text-charcoal/70">
        מדריך Markdown מהיר:
      </p>
      <ul className="grid gap-1.5 sm:grid-cols-2">
        {rows.map((r) => (
          <li key={r.syntax} className="flex items-baseline gap-2">
            <code
              className="rounded bg-cream px-1.5 py-0.5 font-mono text-[0.7rem] text-charcoal"
              dir="ltr"
            >
              {r.syntax}
            </code>
            <span className="text-charcoal/60">{r.result}</span>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-[0.7rem] text-charcoal/50">
        שורה ריקה בין פסקאות. תומך גם בטבלאות, רשימות משימות ([x]/[ ]), וקישורים בתוך טקסט.
      </p>
    </div>
  );
}
