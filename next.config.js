/** @type {import('next').NextConfig} */
const securityHeaders = [
  // Force HTTPS for 2 years; include subdomains; eligible for browser preload list.
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // Block being embedded in another site's <iframe>. Clickjacking defence.
  { key: "X-Frame-Options", value: "DENY" },
  // Don't let the browser guess MIME types.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Don't leak full URLs (which may carry order IDs) to off-site links.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Opt out of browser APIs we don't use.
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
];

const nextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "fastly.picsum.photos" },
      { protocol: "https", hostname: "images.unsplash.com" },
      {
        protocol: "https",
        hostname: "ysadurdujhhpibudwjdj.supabase.co",
        pathname: "/storage/v1/object/public/site-images/**",
      },
    ],
  },
};

module.exports = nextConfig;
