"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { XMarkIcon } from "@heroicons/react/24/outline";

export function Modal({
  open,
  onClose,
  children,
  label = "חלון",
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  label?: string;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) {
      document.addEventListener("keydown", onKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-ink/70 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={label}
            className="relative z-10 max-h-[90vh] w-full max-w-3xl overflow-auto rounded-2xl bg-cream shadow-lift"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <button
              onClick={onClose}
              aria-label="סגירה"
              className="absolute end-3 top-3 z-20 rounded-full bg-cream/90 p-2 text-charcoal shadow-soft transition hover:bg-sand"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
