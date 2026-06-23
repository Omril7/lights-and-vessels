"use client";

import { useState } from "react";
import { IsraelFlag, UsaFlag } from "@/lib/flags";
import { Markdown, MarkdownCheatSheet } from "@/components/ui";
import { cn } from "@/lib/utils";

export function MarkdownEditor({
  locale,
  label,
  value,
  onChange,
  rows = 10,
  placeholder,
}: {
  locale: "he" | "en";
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  const [tab, setTab] = useState<"edit" | "preview">("edit");
  const [showHelp, setShowHelp] = useState(false);
  const Flag = locale === "he" ? IsraelFlag : UsaFlag;
  const isHe = locale === "he";

  const inputBase =
    "w-full rounded-xl border border-charcoal/15 bg-cream px-3 py-2.5 text-sm text-ink placeholder:text-charcoal/30 focus:outline-none focus:border-charcoal/50 focus:ring-2 focus:ring-gold/30";

  return (
    <div className="space-y-1.5" dir={isHe ? undefined : "ltr"}>
      <div className="flex items-center justify-between">
        <span className="text-[0.7rem] uppercase tracking-wider2 text-charcoal/55 font-medium flex items-center gap-1.5">
          <Flag className="h-3 w-4 rounded-sm" />
          {label}
        </span>
        <div className="flex items-center gap-1 text-xs">
          <button
            type="button"
            onClick={() => setShowHelp((v) => !v)}
            className={cn(
              "rounded-full px-3 py-1 text-charcoal/60 hover:bg-charcoal/[0.06]",
              showHelp && "bg-charcoal/[0.06] text-charcoal"
            )}
          >
            {isHe ? "עזרה" : "Help"}
          </button>
          <button
            type="button"
            onClick={() => setTab("edit")}
            className={cn(
              "rounded-full px-3 py-1",
              tab === "edit"
                ? "bg-charcoal text-cream"
                : "text-charcoal/60 hover:bg-charcoal/[0.06]"
            )}
          >
            {isHe ? "עריכה" : "Edit"}
          </button>
          <button
            type="button"
            onClick={() => setTab("preview")}
            className={cn(
              "rounded-full px-3 py-1",
              tab === "preview"
                ? "bg-charcoal text-cream"
                : "text-charcoal/60 hover:bg-charcoal/[0.06]"
            )}
          >
            {isHe ? "תצוגה מקדימה" : "Preview"}
          </button>
        </div>
      </div>

      {showHelp && <MarkdownCheatSheet />}

      {tab === "edit" ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          dir={isHe ? "rtl" : "ltr"}
          className={inputBase}
          placeholder={
            placeholder ??
            (isHe
              ? "כתבו כאן… **מודגש**, *נטוי*, ## כותרת, - רשימה, [קישור](https://…)"
              : "Write here… **bold**, *italic*, ## heading, - list, [link](https://…)")
          }
        />
      ) : (
        <div className="min-h-[14rem] rounded-xl border border-charcoal/10 bg-linen/60 p-4">
          {value ? (
            <Markdown source={value} />
          ) : (
            <p className="text-charcoal/40">
              {isHe ? "אין תוכן עדיין." : "No content yet."}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
