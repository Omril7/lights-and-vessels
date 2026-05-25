"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  CalendarDaysIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
} from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";

/** Lightweight calendar picker. Value is an ISO date string (YYYY-MM-DD) or "" when empty. */
export function DatePicker({
  value,
  onChange,
  ariaLabel,
  placeholder = "בחר תאריך",
  className,
  min,
  max,
  id,
  allowClear = true,
}: {
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
  placeholder?: string;
  className?: string;
  min?: string;
  max?: string;
  id?: string;
  allowClear?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"days" | "months" | "years">("days");
  const ref = useRef<HTMLDivElement>(null);

  const selected = useMemo(() => parseIso(value), [value]);
  const [cursor, setCursor] = useState<Date>(selected ?? today());

  // Reset to days view whenever the popover closes.
  useEffect(() => {
    if (!open) setView("days");
  }, [open]);

  useEffect(() => {
    if (selected) setCursor(selected);
  }, [selected]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const minDate = parseIso(min);
  const maxDate = parseIso(max);

  function isDisabled(d: Date): boolean {
    if (minDate && d < stripTime(minDate)) return true;
    if (maxDate && d > stripTime(maxDate)) return true;
    return false;
  }

  function pick(d: Date) {
    if (isDisabled(d)) return;
    onChange(toIso(d));
    setOpen(false);
  }

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        id={id}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 rounded-xl border border-charcoal/20 bg-cream px-4 py-3 text-sm text-charcoal transition hover:border-charcoal/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/40"
      >
        <span className={cn(!selected && "text-charcoal/40")}>
          {selected ? formatHe(selected) : placeholder}
        </span>
        <CalendarDaysIcon className="h-4 w-4 text-charcoal/60" aria-hidden />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label={ariaLabel}
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="absolute start-0 z-40 mt-2 w-[19rem] overflow-hidden rounded-2xl border border-charcoal/15 bg-cream p-3 shadow-lift"
          >
            <CalendarHeader
              cursor={cursor}
              setCursor={setCursor}
              view={view}
              setView={setView}
            />
            {view === "days" && (
              <CalendarGrid
                cursor={cursor}
                selected={selected}
                isDisabled={isDisabled}
                onPick={pick}
              />
            )}
            {view === "months" && (
              <MonthGrid
                cursor={cursor}
                selected={selected}
                onPick={(m) => {
                  setCursor(new Date(cursor.getFullYear(), m, 1));
                  setView("days");
                }}
              />
            )}
            {view === "years" && (
              <YearGrid
                cursor={cursor}
                selected={selected}
                onPick={(y) => {
                  setCursor(new Date(y, cursor.getMonth(), 1));
                  setView("months");
                }}
              />
            )}
            <div className="mt-3 flex items-center justify-between gap-2 border-t border-charcoal/10 pt-3 text-xs">
              <button
                type="button"
                onClick={() => {
                  const t = stripTime(today());
                  if (!isDisabled(t)) {
                    onChange(toIso(t));
                    setOpen(false);
                  }
                }}
                className="rounded-full px-3 py-1 text-charcoal/70 hover:bg-sand/50"
              >
                היום
              </button>
              {allowClear && (
                <button
                  type="button"
                  onClick={() => {
                    onChange("");
                    setOpen(false);
                  }}
                  className="rounded-full px-3 py-1 text-charcoal/70 hover:bg-sand/50"
                >
                  ניקוי
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CalendarHeader({
  cursor,
  setCursor,
  view,
  setView,
}: {
  cursor: Date;
  setCursor: (d: Date) => void;
  view: "days" | "months" | "years";
  setView: (v: "days" | "months" | "years") => void;
}) {
  const monthYear = new Intl.DateTimeFormat("he-IL", {
    month: "long",
    year: "numeric",
  }).format(cursor);

  const yearOnly = String(cursor.getFullYear());
  const yearRange = (() => {
    const start = Math.floor(cursor.getFullYear() / 12) * 12;
    return `${start}–${start + 11}`;
  })();

  const label = view === "days" ? monthYear : view === "months" ? yearOnly : yearRange;
  const labelAria = view === "days" ? "בחר חודש או שנה" : view === "months" ? "בחר שנה" : "טווח שנים";

  function step(direction: -1 | 1) {
    if (view === "days") {
      setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + direction, 1));
    } else if (view === "months") {
      setCursor(new Date(cursor.getFullYear() + direction, cursor.getMonth(), 1));
    } else {
      setCursor(new Date(cursor.getFullYear() + direction * 12, cursor.getMonth(), 1));
    }
  }

  function onLabelClick() {
    if (view === "days") setView("months");
    else if (view === "months") setView("years");
    else setView("days");
  }

  return (
    <div className="flex items-center justify-between">
      <button
        type="button"
        aria-label={view === "days" ? "חודש קודם" : view === "months" ? "שנה קודמת" : "שנים קודמות"}
        onClick={() => step(-1)}
        className="rounded-full p-1.5 text-charcoal/70 hover:bg-sand/50"
      >
        <ChevronRightIcon className="h-4 w-4" />
      </button>
      <button
        type="button"
        aria-label={labelAria}
        onClick={onLabelClick}
        className="rounded-lg px-3 py-1 text-sm font-medium text-charcoal hover:bg-sand/50"
      >
        {label}
      </button>
      <button
        type="button"
        aria-label={view === "days" ? "חודש הבא" : view === "months" ? "שנה הבאה" : "שנים הבאות"}
        onClick={() => step(1)}
        className="rounded-full p-1.5 text-charcoal/70 hover:bg-sand/50"
      >
        <ChevronLeftIcon className="h-4 w-4" />
      </button>
    </div>
  );
}

const MONTHS_HE = [
  "ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני",
  "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר",
];

function MonthGrid({
  cursor,
  selected,
  onPick,
}: {
  cursor: Date;
  selected: Date | null;
  onPick: (month: number) => void;
}) {
  const cursorYear = cursor.getFullYear();
  const cursorMonth = cursor.getMonth();
  const selectedYear = selected?.getFullYear();
  const selectedMonth = selected?.getMonth();

  return (
    <div className="mt-3 grid grid-cols-3 gap-1">
      {MONTHS_HE.map((label, i) => {
        const isCursor = i === cursorMonth;
        const isSelected =
          selectedYear === cursorYear && selectedMonth === i;
        return (
          <button
            key={label}
            type="button"
            onClick={() => onPick(i)}
            className={cn(
              "h-12 rounded-lg text-sm transition",
              isSelected
                ? "bg-charcoal text-cream hover:bg-ink"
                : "text-charcoal hover:bg-sand/60",
              isCursor && !isSelected && "ring-1 ring-copper/60",
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

function YearGrid({
  cursor,
  selected,
  onPick,
}: {
  cursor: Date;
  selected: Date | null;
  onPick: (year: number) => void;
}) {
  const start = Math.floor(cursor.getFullYear() / 12) * 12;
  const cursorYear = cursor.getFullYear();
  const selectedYear = selected?.getFullYear();
  const years = Array.from({ length: 12 }, (_, i) => start + i);

  return (
    <div className="mt-3 grid grid-cols-3 gap-1">
      {years.map((y) => {
        const isCursor = y === cursorYear;
        const isSelected = y === selectedYear;
        return (
          <button
            key={y}
            type="button"
            onClick={() => onPick(y)}
            className={cn(
              "h-12 rounded-lg text-sm transition",
              isSelected
                ? "bg-charcoal text-cream hover:bg-ink"
                : "text-charcoal hover:bg-sand/60",
              isCursor && !isSelected && "ring-1 ring-copper/60",
            )}
          >
            {y}
          </button>
        );
      })}
    </div>
  );
}

const WEEKDAYS_HE = ["א׳", "ב׳", "ג׳", "ד׳", "ה׳", "ו׳", "ש׳"]; // Sunday → Saturday

function CalendarGrid({
  cursor,
  selected,
  isDisabled,
  onPick,
}: {
  cursor: Date;
  selected: Date | null;
  isDisabled: (d: Date) => boolean;
  onPick: (d: Date) => void;
}) {
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const first = new Date(year, month, 1);
  const startDow = first.getDay(); // 0 = Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayMidnight = stripTime(today());
  const selectedMidnight = selected ? stripTime(selected) : null;

  const cells: (Date | null)[] = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="mt-3">
      <div className="grid grid-cols-7 text-center text-[0.65rem] uppercase tracking-wider2 text-charcoal/50">
        {WEEKDAYS_HE.map((w) => (
          <div key={w} className="py-1.5">
            {w}
          </div>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (!d) return <div key={i} />;
          const disabled = isDisabled(d);
          const isToday = stripTime(d).getTime() === todayMidnight.getTime();
          const isSelected =
            selectedMidnight && stripTime(d).getTime() === selectedMidnight.getTime();
          return (
            <button
              key={i}
              type="button"
              onClick={() => onPick(d)}
              disabled={disabled}
              className={cn(
                "h-9 rounded-lg text-sm transition",
                disabled && "cursor-not-allowed text-charcoal/25",
                !disabled && !isSelected && "text-charcoal hover:bg-sand/60",
                isToday && !isSelected && "ring-1 ring-copper/60",
                isSelected && "bg-charcoal text-cream hover:bg-ink",
              )}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- helpers ---------------- */

function today(): Date {
  return new Date();
}
function stripTime(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
function parseIso(s: string | undefined | null): Date | null {
  if (!s) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return isNaN(d.getTime()) ? null : d;
}
function toIso(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function formatHe(d: Date): string {
  return new Intl.DateTimeFormat("he-IL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}
