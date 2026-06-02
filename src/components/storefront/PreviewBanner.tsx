"use client";

async function exitPreview() {
  await fetch("/api/site-content/preview", { method: "DELETE" });
  window.location.assign("/");
}

export function PreviewBanner() {
  return (
    <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 flex items-center gap-3 rounded-full bg-charcoal px-5 py-2.5 text-sm text-cream shadow-lg">
      <span>מצב תצוגה מקדימה — השינויים עדיין לא נשמרו</span>
      <button
        type="button"
        onClick={exitPreview}
        className="rounded-full bg-cream/15 px-3 py-1 text-xs font-medium text-cream transition-colors hover:bg-cream/25"
      >
        יציאה מתצוגה
      </button>
    </div>
  );
}
