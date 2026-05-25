"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDownIcon, CheckIcon } from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";

export type DropdownOption = { value: string; label: string };

/** Custom-styled select — a themed popup instead of the generic OS dropdown. */
export function Dropdown({
  value,
  options,
  onChange,
  ariaLabel,
  className,
  variant = "pill",
  placeholder,
  id,
}: {
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
  ariaLabel: string;
  className?: string;
  /** "pill" = rounded chip (filters); "field" = full-width input-style trigger (forms). */
  variant?: "pill" | "field";
  placeholder?: string;
  id?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = options.find((o) => o.value === value);

  const triggerClass =
    variant === "field"
      ? "flex w-full items-center justify-between gap-2 rounded-xl border border-charcoal/20 bg-cream px-4 py-3 text-sm text-charcoal transition hover:border-charcoal/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/40"
      : "flex items-center gap-2 rounded-full border border-charcoal/25 bg-cream px-4 py-1.5 text-sm text-charcoal transition hover:border-charcoal focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/40";

  const menuClass =
    variant === "field"
      ? "absolute start-0 end-0 z-40 mt-2 overflow-hidden rounded-xl border border-charcoal/15 bg-cream py-1 shadow-lift"
      : "absolute end-0 z-40 mt-2 min-w-full overflow-hidden rounded-xl border border-charcoal/15 bg-cream py-1 shadow-lift";

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
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

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => setOpen((o) => !o)}
        className={triggerClass}
      >
        <span className={cn("whitespace-nowrap", !current && "text-charcoal/40")}>
          {current?.label ?? placeholder ?? ""}
        </span>
        <ChevronDownIcon
          className={cn(
            "h-4 w-4 text-charcoal/60 transition-transform duration-300 ease-grace",
            open && "rotate-180"
          )}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            aria-label={ariaLabel}
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className={menuClass}
          >
            {options.map((o) => {
              const selected = o.value === value;
              return (
                <li key={o.value}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onClick={() => {
                      onChange(o.value);
                      setOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center justify-between gap-6 whitespace-nowrap px-4 py-2.5 text-start text-sm transition-colors",
                      selected
                        ? "bg-sand/70 text-ink"
                        : "text-charcoal hover:bg-sand/45"
                    )}
                  >
                    {o.label}
                    {selected && (
                      <CheckIcon className="h-4 w-4 shrink-0 text-copper" />
                    )}
                  </button>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
