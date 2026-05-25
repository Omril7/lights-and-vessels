"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { MotionConfig, useReducedMotion } from "motion/react";

const Ctx = createContext(false);

/**
 * Combined reduced-motion signal:
 *   OS `prefers-reduced-motion` OR the a11y widget's "עצירת אנימציות" toggle
 *   (which sets `html.a11y-no-motion`).
 * Use this in any Motion component whose animation isn't purely a transform —
 * e.g. opacity-only fades — since `MotionConfig reducedMotion="always"` only
 * suppresses transform-based animations on its own.
 */
export const useShouldReduceMotion = () => useContext(Ctx);

export function MotionPrefsProvider({ children }: { children: React.ReactNode }) {
  const osReduced = useReducedMotion();
  const [widgetReduced, setWidgetReduced] = useState(false);

  useEffect(() => {
    const html = document.documentElement;
    const sync = () => setWidgetReduced(html.classList.contains("a11y-no-motion"));
    sync();
    const obs = new MutationObserver(sync);
    obs.observe(html, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  const reduced = !!osReduced || widgetReduced;

  return (
    <Ctx.Provider value={reduced}>
      <MotionConfig reducedMotion={reduced ? "always" : "never"}>
        {children}
      </MotionConfig>
    </Ctx.Provider>
  );
}
