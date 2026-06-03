"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  XMarkIcon,
  MinusIcon,
  PlusIcon,
  ArrowPathIcon,
  SunIcon,
  MoonIcon,
  SwatchIcon,
  LinkIcon,
  BookOpenIcon,
  CursorArrowRaysIcon,
  PauseIcon,
  Bars3BottomLeftIcon,
  LanguageIcon,
  EyeSlashIcon,
  H1Icon,
  FilmIcon,
  BoldIcon,
  ViewfinderCircleIcon,
  PaintBrushIcon,
  MinusSmallIcon,
  ArrowsPointingOutIcon,
} from "@heroicons/react/24/outline";

type Settings = {
  fontStep: number; // 0..3
  contrast: boolean;
  dark: boolean;
  grayscale: boolean;
  sepia: boolean;
  links: boolean;
  readable: boolean;
  cursor: boolean;
  noMotion: boolean;
  lineSpacing: boolean;
  letterSpacing: boolean;
  hideImages: boolean;
  underlineHeadings: boolean;
  pauseMedia: boolean;
  bold: boolean;
  focus: boolean;
  readingGuide: boolean;
};

const KEY = "a11y-settings";
const POS_KEY = "a11y-pos";
const BTN_SIZE = 56; // h-14 w-14 in px
const MAX_FONT = 3;
const GRID_COLS = 2;

const DEFAULTS: Settings = {
  fontStep: 0,
  contrast: false,
  dark: false,
  grayscale: false,
  sepia: false,
  links: false,
  readable: false,
  cursor: false,
  noMotion: false,
  lineSpacing: false,
  letterSpacing: false,
  hideImages: false,
  underlineHeadings: false,
  pauseMedia: false,
  bold: false,
  focus: false,
  readingGuide: false,
};

const CLASS_MAP: Record<Exclude<keyof Settings, "fontStep">, string> = {
  contrast: "a11y-contrast",
  dark: "a11y-dark",
  grayscale: "a11y-grayscale",
  sepia: "a11y-sepia",
  links: "a11y-links",
  readable: "a11y-readable",
  cursor: "a11y-cursor",
  noMotion: "a11y-no-motion",
  lineSpacing: "a11y-line-spacing",
  letterSpacing: "a11y-letter-spacing",
  hideImages: "a11y-hide-images",
  underlineHeadings: "a11y-underline-headings",
  pauseMedia: "a11y-pause-media",
  bold: "a11y-bold",
  focus: "a11y-focus",
  // readingGuide doesn't use a class — it renders a ruler element from JS
  readingGuide: "",
};

function AccessIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden focusable="false">
      <circle cx="12" cy="3.6" r="2.1" fill="currentColor" />
      <path
        d="M4 7.4c2.6 1.1 5.2 1.6 8 1.6s5.4-.5 8-1.6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
      />
      <path
        d="M12 8.4v6.1m0 0-2.7 6.8m2.7-6.8 2.7 6.8"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function applySettings(s: Settings) {
  const c = document.documentElement.classList;
  for (let i = 1; i <= MAX_FONT; i++) c.remove(`a11y-font-${i}`);
  if (s.fontStep > 0) c.add(`a11y-font-${s.fontStep}`);
  (Object.keys(CLASS_MAP) as Array<keyof typeof CLASS_MAP>).forEach((k) => {
    const cls = CLASS_MAP[k];
    if (cls) c.toggle(cls, s[k]);
  });

  if (s.pauseMedia) {
    document.querySelectorAll("video").forEach((v) => v.pause());
  }
}

type ToggleKey = Exclude<keyof Settings, "fontStep">;

/**
 * Palette modes are mutually exclusive — enabling one disables the others,
 * since two palette overrides would fight over the same CSS variables.
 */
const PALETTE_GROUP: readonly ToggleKey[] = [
  "contrast",
  "dark",
  "grayscale",
  "sepia",
];

function toggleKey(s: Settings, key: ToggleKey): Settings {
  const next = !s[key];
  const updated: Settings = { ...s, [key]: next };
  if (next && PALETTE_GROUP.includes(key)) {
    for (const other of PALETTE_GROUP) {
      if (other !== key) (updated as Record<ToggleKey, boolean>)[other] = false;
    }
  }
  return updated;
}

const TOGGLE_OPTIONS: ReadonlyArray<{
  key: ToggleKey;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
}> = [
  { key: "contrast", label: "ניגודיות גבוהה", Icon: SunIcon },
  { key: "dark", label: "מצב כהה", Icon: MoonIcon },
  { key: "sepia", label: "גוון חם", Icon: PaintBrushIcon },
  { key: "grayscale", label: "גווני אפור", Icon: SwatchIcon },
  { key: "links", label: "הדגשת קישורים", Icon: LinkIcon },
  { key: "underlineHeadings", label: "קו תחת כותרות", Icon: H1Icon },
  { key: "readable", label: "גופן קריא", Icon: BookOpenIcon },
  { key: "bold", label: "טקסט מודגש", Icon: BoldIcon },
  { key: "letterSpacing", label: "ריווח אותיות", Icon: LanguageIcon },
  { key: "lineSpacing", label: "ריווח שורות", Icon: Bars3BottomLeftIcon },
  { key: "cursor", label: "סמן מוגדל", Icon: CursorArrowRaysIcon },
  { key: "focus", label: "הדגשת מיקוד", Icon: ViewfinderCircleIcon },
  { key: "readingGuide", label: "קו הקראה", Icon: MinusSmallIcon },
  { key: "noMotion", label: "עצירת אנימציות", Icon: PauseIcon },
  { key: "pauseMedia", label: "עצירת מדיה", Icon: FilmIcon },
  { key: "hideImages", label: "הסתרת תמונות", Icon: EyeSlashIcon },
];

/** Horizontal ruler that follows the cursor — helps focus a line of text. */
function ReadingGuide() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e: PointerEvent) => {
      el.style.top = `${e.clientY}px`;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);
  return <div ref={ref} className="a11y-reading-guide" aria-hidden />;
}

type Pos = { x: number; y: number };

function clampPos(x: number, y: number): Pos {
  return {
    x: Math.max(0, Math.min(x, window.innerWidth - BTN_SIZE)),
    y: Math.max(0, Math.min(y, window.innerHeight - BTN_SIZE)),
  };
}

export function AccessibilityWidget() {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin") ?? false;
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const [focusIdx, setFocusIdx] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [pos, setPos] = useState<Pos | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Load saved drag position or default to bottom-left
  useEffect(() => {
    const defaultPos = { x: 20, y: window.innerHeight - 20 - BTN_SIZE };
    try {
      const raw = localStorage.getItem(POS_KEY);
      if (raw) {
        const p = JSON.parse(raw) as Pos;
        setPos(clampPos(p.x, p.y));
        return;
      }
    } catch { /* ignore */ }
    setPos(defaultPos);
  }, []);

  // Clamp position on resize
  useEffect(() => {
    const onResize = () => {
      setPos((p) => p ? clampPos(p.x, p.y) : p);
    };
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const drawerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const toggleRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const dragOrigin = useRef<{ px: number; py: number; bx: number; by: number } | null>(null);
  const hasMoved = useRef(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = { ...DEFAULTS, ...JSON.parse(raw) } as Settings;
        setSettings(parsed);
        applySettings(parsed);
      }
    } catch {
      /* ignore corrupt storage */
    }
  }, []);

  const update = useCallback((next: Settings) => {
    setSettings(next);
    applySettings(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* storage may be unavailable */
    }
  }, []);

  const reset = () => {
    update(DEFAULTS);
    setFocusIdx(0);
    const defaultPos = { x: 20, y: window.innerHeight - 20 - BTN_SIZE };
    setPos(defaultPos);
    try { localStorage.removeItem(POS_KEY); } catch { /* ignore */ }
  };

  // Escape closes; lock body scroll while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  // When drawer opens, move keyboard focus to the first toggle.
  useEffect(() => {
    if (open) {
      const t = setTimeout(() => toggleRefs.current[0]?.focus(), 60);
      return () => clearTimeout(t);
    }
  }, [open]);

  /** Arrow-key roving focus across the 2-col grid (RTL-aware). */
  const onGridKeyDown = (e: React.KeyboardEvent, i: number) => {
    const total = TOGGLE_OPTIONS.length;
    const move = (next: number) => {
      const wrapped = (next + total) % total;
      setFocusIdx(wrapped);
      toggleRefs.current[wrapped]?.focus();
      e.preventDefault();
    };
    switch (e.key) {
      // RTL: physical Right key = previous; Left = next
      case "ArrowRight":
        return move(i - 1);
      case "ArrowLeft":
        return move(i + 1);
      case "ArrowDown":
        return move(i + GRID_COLS);
      case "ArrowUp":
        return move(i - GRID_COLS);
      case "Home":
        return move(0);
      case "End":
        return move(total - 1);
    }
  };

  const activeCount =
    (settings.fontStep > 0 ? 1 : 0) +
    (Object.keys(CLASS_MAP) as ToggleKey[]).reduce(
      (n, k) => n + (settings[k] ? 1 : 0),
      0
    );
  const active = activeCount > 0;
  const expanded = isHovered || isDragging;

  const onPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!pos) return;
    dragOrigin.current = { px: e.clientX, py: e.clientY, bx: pos.x, by: pos.y };
    hasMoved.current = false;
    (e.currentTarget as HTMLButtonElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragOrigin.current) return;
    const dx = e.clientX - dragOrigin.current.px;
    const dy = e.clientY - dragOrigin.current.py;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
      hasMoved.current = true;
      if (!isDragging) setIsDragging(true);
    }
    if (hasMoved.current) {
      setPos(clampPos(dragOrigin.current.bx + dx, dragOrigin.current.by + dy));
    }
  };

  const onPointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragOrigin.current) return;
    (e.currentTarget as HTMLButtonElement).releasePointerCapture(e.pointerId);
    if (!hasMoved.current) {
      setOpen((v) => !v);
    } else {
      try { localStorage.setItem(POS_KEY, JSON.stringify(pos)); } catch { /* ignore */ }
    }
    setIsDragging(false);
    dragOrigin.current = null;
  };

  if (isAdmin) return null;

  return (
    <>
      {/* Floating trigger */}
      <button
        ref={buttonRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerEnter={() => setIsHovered(true)}
        onPointerLeave={() => { if (!isDragging) setIsHovered(false); }}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label="אפשרויות נגישות"
        style={pos ? { left: pos.x, top: pos.y } : undefined}
        className={[
          "fixed z-[85] flex h-14 items-center justify-center rounded-full bg-charcoal text-cream shadow-lift outline-none",
          "focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-cream",
          "touch-none transition-[width,box-shadow] duration-200",
          expanded ? "w-24 cursor-grab gap-2 px-3" : "w-14",
          isDragging ? "cursor-grabbing shadow-2xl scale-105" : "",
          !pos ? "opacity-0 pointer-events-none" : "",
        ].join(" ")}
      >
        {expanded && (
          <ArrowsPointingOutIcon className="h-5 w-5 shrink-0 opacity-70" aria-hidden />
        )}
        <AccessIcon className="h-7 w-7 shrink-0" />
        {active && (
          <span
            aria-hidden
            className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-charcoal bg-copper px-1 text-[0.65rem] font-semibold text-cream"
          >
            {activeCount}
          </span>
        )}
      </button>

      {/* Reading guide overlay — outside the drawer so it shows everywhere */}
      {settings.readingGuide && <ReadingGuide />}

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 z-[88] bg-ink/40 backdrop-blur-[2px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setOpen(false)}
            />

            <motion.div
              ref={drawerRef}
              role="dialog"
              aria-modal="true"
              aria-label="תפריט נגישות"
              initial={isMobile ? { y: "100%" } : { x: "-100%" }}
              animate={isMobile ? { y: 0 } : { x: 0 }}
              exit={isMobile ? { y: "100%" } : { x: "-100%" }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className={
                isMobile
                  ? "fixed inset-x-0 bottom-0 z-[90] flex max-h-[88vh] w-full flex-col rounded-t-3xl bg-cream shadow-lift"
                  : "fixed inset-y-0 left-0 z-[90] flex h-full w-[min(24rem,100vw)] flex-col bg-cream shadow-lift"
              }
            >
              {isMobile && (
                <div
                  aria-hidden
                  className="mx-auto mt-2 h-1.5 w-12 shrink-0 rounded-full bg-charcoal/20"
                />
              )}
              <header className="flex items-center justify-between border-b border-charcoal/15 px-5 py-4">
                <h2 className="flex items-center gap-2 font-serif text-xl text-ink">
                  <AccessIcon className="h-5 w-5 text-copper" />
                  נגישות
                </h2>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="סגירה"
                  className="rounded-full p-1.5 text-charcoal transition hover:bg-sand"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </header>

              <div className="flex-1 overflow-y-auto px-5 py-5">
                {/* Font size stepper */}
                <section className="mb-5">
                  <p className="mb-2 text-sm font-medium text-charcoal">
                    גודל הטקסט
                  </p>
                  <div className="flex items-center justify-between rounded-xl border border-charcoal/20 p-1.5">
                    <button
                      onClick={() =>
                        update({
                          ...settings,
                          fontStep: Math.max(0, settings.fontStep - 1),
                        })
                      }
                      disabled={settings.fontStep <= 0}
                      aria-label="הקטנת טקסט"
                      className="rounded-lg p-2 text-charcoal transition hover:bg-sand disabled:opacity-30"
                    >
                      <MinusIcon className="h-5 w-5" />
                    </button>
                    <div className="flex items-center gap-1.5">
                      {[0, 1, 2, 3].map((step) => (
                        <span
                          key={step}
                          className={`h-1.5 rounded-full transition-all ${
                            step <= settings.fontStep
                              ? "w-5 bg-copper"
                              : "w-3 bg-charcoal/20"
                          }`}
                        />
                      ))}
                    </div>
                    <button
                      onClick={() =>
                        update({
                          ...settings,
                          fontStep: Math.min(MAX_FONT, settings.fontStep + 1),
                        })
                      }
                      disabled={settings.fontStep >= MAX_FONT}
                      aria-label="הגדלת טקסט"
                      className="rounded-lg p-2 text-charcoal transition hover:bg-sand disabled:opacity-30"
                    >
                      <PlusIcon className="h-5 w-5" />
                    </button>
                  </div>
                </section>

                <section>
                  <p className="mb-2 text-sm font-medium text-charcoal">
                    התאמות תצוגה
                  </p>
                  <div
                    role="group"
                    aria-label="התאמות נגישות"
                    className="grid grid-cols-2 gap-2.5"
                  >
                    {TOGGLE_OPTIONS.map(({ key, label, Icon }, i) => {
                      const checked = settings[key] as boolean;
                      const isFocusTarget = i === focusIdx;
                      return (
                        <button
                          key={key}
                          ref={(el) => {
                            toggleRefs.current[i] = el;
                          }}
                          type="button"
                          role="checkbox"
                          aria-checked={checked}
                          tabIndex={isFocusTarget ? 0 : -1}
                          onFocus={() => setFocusIdx(i)}
                          onKeyDown={(e) => onGridKeyDown(e, i)}
                          onClick={() =>
                            update(toggleKey(settings, key))
                          }
                          className={`group relative flex items-center gap-2 rounded-xl border px-2.5 py-3.5 text-start transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-copper focus-visible:ring-offset-1 focus-visible:ring-offset-cream ${
                            checked
                              ? "border-copper bg-copper/10 text-ink shadow-soft"
                              : "border-charcoal/15 bg-cream text-charcoal hover:border-charcoal/35 hover:bg-sand/40"
                          }`}
                        >
                          <Icon
                            className={`h-5 w-5 shrink-0 transition-colors ${
                              checked ? "text-copper" : "text-charcoal/70"
                            }`}
                          />
                          <span className="flex-1 truncate text-[0.78rem] font-medium leading-tight">
                            {label}
                          </span>
                          {checked && (
                            <span
                              aria-hidden
                              className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-copper text-cream"
                            >
                              <svg
                                viewBox="0 0 12 12"
                                className="h-2.5 w-2.5"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M2.5 6.5l2.4 2.4L9.5 3.7" />
                              </svg>
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <p className="mt-2 text-[0.8rem] text-charcoal/50">
                    טיפ: ניתן לנווט בין האפשרויות באמצעות מקשי החיצים.
                  </p>
                </section>
              </div>

              <footer className="border-t border-charcoal/15 px-5 py-4">
                <button
                  onClick={reset}
                  disabled={!active}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-charcoal/25 py-2.5 text-sm text-charcoal transition hover:bg-sand disabled:opacity-40"
                >
                  <ArrowPathIcon className="h-4 w-4" />
                  איפוס הגדרות
                </button>
                <div className="mt-3 flex items-center justify-between text-xs text-charcoal/55">
                  <Link
                    href="/legal/accessibility"
                    onClick={() => setOpen(false)}
                    className="underline-offset-2 transition hover:text-copper hover:underline"
                  >
                    הצהרת נגישות
                  </Link>
                  <span>ההגדרות נשמרות במכשיר שלך</span>
                </div>
              </footer>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
