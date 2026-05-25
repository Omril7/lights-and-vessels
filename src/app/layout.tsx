import type { Metadata } from "next";
import { Frank_Ruhl_Libre, Assistant } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { AccessibilityWidget } from "@/components/a11y/AccessibilityWidget";
import { MotionPrefsProvider } from "@/lib/motion-prefs";
import "./globals.css";

/** Applies saved accessibility settings before first paint to avoid flicker. */
const a11yBootScript = `(function(){try{var s=JSON.parse(localStorage.getItem('a11y-settings')||'{}');var c=document.documentElement.classList;if(s.fontStep)c.add('a11y-font-'+s.fontStep);if(s.contrast)c.add('a11y-contrast');if(s.dark)c.add('a11y-dark');if(s.grayscale)c.add('a11y-grayscale');if(s.links)c.add('a11y-links');if(s.readable)c.add('a11y-readable');if(s.cursor)c.add('a11y-cursor');if(s.noMotion)c.add('a11y-no-motion');if(s.lineSpacing)c.add('a11y-line-spacing');if(s.letterSpacing)c.add('a11y-letter-spacing');if(s.hideImages)c.add('a11y-hide-images');if(s.underlineHeadings)c.add('a11y-underline-headings');if(s.pauseMedia)c.add('a11y-pause-media');if(s.bold)c.add('a11y-bold');if(s.focus)c.add('a11y-focus');if(s.sepia)c.add('a11y-sepia');}catch(e){}})();`;

const frank = Frank_Ruhl_Libre({
  subsets: ["hebrew", "latin"],
  weight: ["400", "500", "700", "900"],
  variable: "--font-frank",
  display: "swap",
});

const assistant = Assistant({
  subsets: ["hebrew", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-assistant",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "סטודיו — תכשיטים ואורות וכלים",
    template: "%s · סטודיו",
  },
  description:
    "אוסף סטודיו קטן של תכשיטים וחפצים לבית, נוצרים לאט ובעבודת יד.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" dir="rtl" className={`${frank.variable} ${assistant.variable}`}>
      <body className="font-sans antialiased bg-cream text-ink">
        <script dangerouslySetInnerHTML={{ __html: a11yBootScript }} />
        <MotionPrefsProvider>
          {children}
          <AccessibilityWidget />
        </MotionPrefsProvider>
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              background: "var(--charcoal)",
              color: "var(--cream)",
              fontFamily: "var(--font-assistant)",
              borderRadius: "999px",
              fontSize: "0.875rem",
              padding: "0.6rem 1.1rem",
            },
          }}
        />
      </body>
    </html>
  );
}
