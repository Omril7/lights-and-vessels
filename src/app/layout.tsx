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

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://lights-and-vessels.vercel.app";
const SITE_NAME = "אורות וכלים";
const SITE_DESCRIPTION =
  "אוסף סטודיו קטן של תכשיטים וחפצים לבית, נוצרים לאט ובעבודת יד.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — תכשיטים וחפצים בעבודת יד`,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "תכשיטים בעבודת יד",
    "סטודיו תכשיטים",
    "כלי בית",
    "אומנות ישראלית",
    "מתנות",
    "אורות וכלים",
  ],
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "he_IL",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — תכשיטים וחפצים בעבודת יד`,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/logo-2169x1282-black.png",
        width: 2169,
        height: 1282,
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — תכשיטים וחפצים בעבודת יד`,
    description: SITE_DESCRIPTION,
    images: ["/logo-2169x1282-black.png"],
  },
  icons: {
    icon: "/apple-icon.png",
    apple: { url: "/apple-icon.png", sizes: "180x180" },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
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
