"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  CalendarDaysIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  ChevronUpIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";

/**
 * Datetime picker. Value is "YYYY-MM-DDTHH:mm" (matches <input type="datetime-local">)
 * or "" when empty.
 */
export function DateTimePicker({
  value,
  onChange,
  ariaLabel,
  placeholder = "בחר תאריך ושעה",
  className,
  id,
  allowClear = true,
}: {
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
  placeholder?: string;
  className?: string;
  id?: string;
  allowClear?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"days" | "months" | "years">("days");
  const ref = useRef<HTMLDivElement>(null);

  const parsed = useMemo(() => parseValue(value), [value]);
  const [cursor, setCursor] = useState<Date>(parsed ?? today());
  const [hour, setHour] = useState<number>(parsed?.getHours() ?? 9);
  const [minute, setMinute] = useState<number>(parsed?.getMinutes() ?? 0);

  useEffect(() => {
    if (!open) setView("days");
  }, [open]);

  useEffect(() => {
    if (parsed) {
      setCursor(parsed);
      setHour(parsed.getHours());
      setMinute(parsed.getMinutes());
    }
  }, [parsed]);

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

  function commit(d: Date, h: number, m: number) {
    const next = new Date(d.getFullYear(), d.getMonth(), d.getDate(), h, m);
    onChange(toValue(next));
  }

  function pickDay(d: Date) {
    commit(d, hour, minute);
  }

  function bumpHour(delta: number) {
    const next = (hour + delta + 24) % 24;
    setHour(next);
    if (parsed) commit(parsed, next, minute);
  }
  function bumpMinute(delta: number) {
    const next = (minute + delta + 60) % 60;
    setMinute(next);
    if (parsed) commit(parsed, hour, next);
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
        <span className={cn(!parsed && "text-charcoal/40")}>
          {parsed ? formatHe(parsed) : placeholder}
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
                selected={parsed}
                onPick={pickDay}
              />
            )}
            {view === "months" && (
              <MonthGrid
                cursor={cursor}
                selected={parsed}
                onPick={(m) => {
                  setCursor(new Date(cursor.getFullYear(), m, 1));
                  setView("days");
                }}
              />
            )}
            {view === "years" && (
              <YearGrid
                cursor={cursor}
                selected={parsed}
                onPick={(y) => {
                  setCursor(new Date(y, cursor.getMonth(), 1));
                  setView("months");
                }}
              />
            )}

            <div className="mt-3 flex items-center justify-center gap-3 border-t border-charcoal/10 pt-3">
              <TimeWheel
                value={hour}
                label="שעה"
                onUp={() => bumpHour(1)}
                onDown={() => bumpHour(-1)}
              />
              <span className="text-lg font-medium text-charcoal/50">:</span>
              <TimeWheel
                value={minute}
                label="דקה"
                onUp={() => bumpMinute(5)}
                onDown={() => bumpMinute(-5)}
              />
            </div>

            <div className="mt-3 flex items-center justify-between gap-2 border-t border-charcoal/10 pt-3 text-xs">
              <button
                type="button"
                onClick={() => {
                  const now = new Date();
                  setHour(now.getHours());
                  setMinute(now.getMinutes());
                  onChange(toValue(now));
                  setCursor(now);
                  setOpen(false);
                }}
                className="rounded-full px-3 py-1 text-charcoal/70 hover:bg-sand/50"
              >
                עכשיו
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full bg-charcoal px-3 py-1 text-cream hover:bg-ink"
              >
                סגירה
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

function TimeWheel({
  value,
  label,
  onUp,
  onDown,
}: {
  value: number;
  label: string;
  onUp: () => void;
  onDown: () => void;
}) {
  return (
    <div className="flex flex-col items-center">
      <button
        type="button"
        aria-label={`${label} למעלה`}
        onClick={onUp}
        className="rounded-md p-1 text-charcoal/60 hover:bg-sand/50"
      >
        <ChevronUpIcon className="h-4 w-4" />
      </button>
      <div
        className="w-12 rounded-lg bg-linen/60 py-1 text-center font-mono text-base text-charcoal"
        aria-label={label}
      >
        {String(value).padStart(2, "0")}
      </div>
      <button
        type="button"
        aria-label={`${label} למטה`}
        onClick={onDown}
        className="rounded-md p-1 text-charcoal/60 hover:bg-sand/50"
      >
        <ChevronDownIcon className="h-4 w-4" />
      </button>
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
  const label =
    view === "days" ? monthYear : view === "months" ? yearOnly : yearRange;

  function step(direction: -1 | 1) {
    if (view === "days") {
      setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + direction, 1));
    } else if (view === "months") {
      setCursor(new Date(cursor.getFullYear() + direction, cursor.getMonth(), 1));
    } else {
      setCursor(
        new Date(cursor.getFullYear() + direction * 12, cursor.getMonth(), 1)
      );
    }
  }

  return (
    <div className="flex items-center justify-between">
      <button
        type="button"
        aria-label="הקודם"
        onClick={() => step(-1)}
        className="rounded-full p-1.5 text-charcoal/70 hover:bg-sand/50"
      >
        <ChevronRightIcon className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() =>
          setView(view === "days" ? "months" : view === "months" ? "years" : "days")
        }
        className="rounded-lg px-3 py-1 text-sm font-medium text-charcoal hover:bg-sand/50"
      >
        {label}
      </button>
      <button
        type="button"
        aria-label="הבא"
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
  onPick: (m: number) => void;
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
              isCursor && !isSelected && "ring-1 ring-copper/60"
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
  onPick: (y: number) => void;
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
              isCursor && !isSelected && "ring-1 ring-copper/60"
            )}
          >
            {y}
          </button>
        );
      })}
    </div>
  );
}

const WEEKDAYS_HE = ["א׳", "ב׳", "ג׳", "ד׳", "ה׳", "ו׳", "ש׳"];

function CalendarGrid({
  cursor,
  selected,
  onPick,
}: {
  cursor: Date;
  selected: Date | null;
  onPick: (d: Date) => void;
}) {
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const first = new Date(year, month, 1);
  const startDow = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayMidnight = stripTime(new Date());
  const selectedMidnight = selected ? stripTime(selected) : null;

  const cells: (Date | null)[] = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="mt-3">
      <div className="grid grid-cols-7 text-center text-[0.65rem] uppercase tracking-wider2 text-charcoal/50">
        {WEEKDAYS_HE.map((w) => (
          <div key={w} className="py-1.5">{w}</div>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (!d) return <div key={i} />;
          const isToday = stripTime(d).getTime() === todayMidnight.getTime();
          const isSelected =
            selectedMidnight &&
            stripTime(d).getTime() === selectedMidnight.getTime();
          return (
            <button
              key={i}
              type="button"
              onClick={() => onPick(d)}
              className={cn(
                "h-9 rounded-lg text-sm transition",
                !isSelected && "text-charcoal hover:bg-sand/60",
                isToday && !isSelected && "ring-1 ring-copper/60",
                isSelected && "bg-charcoal text-cream hover:bg-ink"
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

function today() {
  return new Date();
}
function stripTime(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
function parseValue(s: string | undefined | null): Date | null {
  if (!s) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(s);
  if (!m) return null;
  const d = new Date(
    Number(m[1]),
    Number(m[2]) - 1,
    Number(m[3]),
    Number(m[4]),
    Number(m[5])
  );
  return isNaN(d.getTime()) ? null : d;
}
function toValue(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}
function formatHe(d: Date): string {
  return new Intl.DateTimeFormat("he-IL", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}
