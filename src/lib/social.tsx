import type { ComponentType, SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { className?: string };

function FacebookIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M13.5 21v-7.5h2.5l.4-3h-2.9V8.6c0-.86.27-1.45 1.53-1.45H16.5V4.5c-.27 0-1.2-.1-2.27-.1-2.25 0-3.73 1.37-3.73 3.88V10.5H8v3h2.5V21h3z" />
    </svg>
  );
}

function InstagramIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function YouTubeIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M22.5 7.2c-.25-1-1-1.8-2-2-1.78-.5-9-.5-9-.5s-7.22 0-9 .5c-1 .2-1.75 1-2 2C0 9 0 12 0 12s0 3 .5 4.8c.25 1 1 1.8 2 2 1.78.5 9 .5 9 .5s7.22 0 9-.5c1-.2 1.75-1 2-2 .5-1.8.5-4.8.5-4.8s0-3-.5-4.8zM9.6 15.6V8.4l6.2 3.6-6.2 3.6z" />
    </svg>
  );
}

function TikTokIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M19.6 6.7a5.4 5.4 0 0 1-3.2-1.1 5.4 5.4 0 0 1-2-3.6H11v13.4a2.6 2.6 0 1 1-1.8-2.5V9.6A5.6 5.6 0 1 0 14.4 15V9.7a8.2 8.2 0 0 0 5.2 1.8z" />
    </svg>
  );
}

function TwitterIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M18.244 2H21.5l-7.39 8.45L22.5 22h-6.9l-5.4-7.06L4 22H.74l7.9-9.03L1.5 2h7.07l4.88 6.45L18.244 2zm-1.2 18h1.9L7.05 4H5.04l12 16z" />
    </svg>
  );
}

function PinterestIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12 2a10 10 0 0 0-3.65 19.31c-.09-.78-.17-1.97.04-2.82.18-.74 1.16-4.71 1.16-4.71s-.3-.6-.3-1.48c0-1.39.8-2.42 1.8-2.42.85 0 1.27.64 1.27 1.41 0 .86-.55 2.14-.83 3.34-.24 1 .5 1.81 1.48 1.81 1.78 0 3.14-1.88 3.14-4.58 0-2.4-1.72-4.07-4.18-4.07-2.85 0-4.52 2.13-4.52 4.34 0 .86.33 1.78.75 2.28a.3.3 0 0 1 .07.29l-.27 1.11c-.04.18-.14.22-.33.13-1.21-.56-1.97-2.33-1.97-3.75 0-3.05 2.22-5.86 6.4-5.86 3.36 0 5.97 2.4 5.97 5.6 0 3.34-2.1 6.03-5.02 6.03-.98 0-1.9-.51-2.22-1.11l-.6 2.3c-.22.84-.81 1.9-1.21 2.54A10 10 0 1 0 12 2z" />
    </svg>
  );
}

function LinkedInIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M4.98 3.5A2.5 2.5 0 1 1 5 8.5a2.5 2.5 0 0 1-.02-5zM3 9.5h4V21H3V9.5zm6 0h3.8v1.57h.05c.53-.95 1.83-1.95 3.77-1.95 4.03 0 4.78 2.65 4.78 6.1V21h-4v-4.74c0-1.13-.02-2.59-1.58-2.59-1.58 0-1.82 1.23-1.82 2.5V21H9V9.5z" />
    </svg>
  );
}

export type SocialPlatform = {
  /** Stable slug stored in the DB. Do not rename without a migration. */
  slug: string;
  /** Hebrew label shown in the admin UI and as aria-label in the footer. */
  label: string;
  Icon: ComponentType<IconProps>;
};

/** Add a new platform here to make it selectable in the admin. */
export const SOCIAL_PLATFORMS: SocialPlatform[] = [
  { slug: "facebook", label: "פייסבוק", Icon: FacebookIcon },
  { slug: "instagram", label: "אינסטגרם", Icon: InstagramIcon },
  { slug: "youtube", label: "יוטיוב", Icon: YouTubeIcon },
  { slug: "tiktok", label: "טיקטוק", Icon: TikTokIcon },
  { slug: "twitter", label: "X / טוויטר", Icon: TwitterIcon },
  { slug: "pinterest", label: "פינטרסט", Icon: PinterestIcon },
  { slug: "linkedin", label: "לינקדאין", Icon: LinkedInIcon },
];

export function getPlatform(slug: string): SocialPlatform | undefined {
  return SOCIAL_PLATFORMS.find((p) => p.slug === slug);
}
