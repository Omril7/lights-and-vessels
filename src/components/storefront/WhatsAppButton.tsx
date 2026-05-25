import { whatsappUrl } from "@/lib/utils";

function WhatsAppGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M19.05 4.91A9.82 9.82 0 0 0 12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.004c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01zM12.04 20.15h-.003a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.18 8.18 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24a8.2 8.2 0 0 1 8.24 8.24c0 4.54-3.7 8.24-8.24 8.24zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.51.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43h-.48a.92.92 0 0 0-.66.31c-.23.25-.87.85-.87 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.25 3.75.59.26 1.06.41 1.42.52.6.19 1.14.16 1.57.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.1-.22-.16-.47-.28z" />
    </svg>
  );
}

/** Fixed floating WhatsApp button — bottom-right, opposite the a11y widget. */
export function WhatsAppButton({
  number,
  message,
}: {
  number: string;
  message: string;
}) {
  if (!number) return null;
  return (
    <a
      href={whatsappUrl(number, message)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="פתיחת שיחה בוואטסאפ"
      className="group fixed bottom-5 right-5 z-[80] flex items-center gap-0 rounded-full bg-[#25D366] text-white shadow-lift outline-none transition-all duration-300 ease-grace hover:gap-2 hover:pe-5 focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
    >
      <span className="relative flex h-14 w-14 items-center justify-center">
        <span className="absolute inset-0 animate-ping rounded-full bg-[#25D366] opacity-30" />
        <WhatsAppGlyph className="relative h-7 w-7" />
      </span>
      <span className="max-w-0 overflow-hidden whitespace-nowrap text-sm font-medium transition-all duration-300 ease-grace group-hover:max-w-[10rem]">
        כתבו לי בוואטסאפ
      </span>
    </a>
  );
}
