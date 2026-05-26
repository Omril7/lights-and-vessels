/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "fastly.picsum.photos" },
      { protocol: "https", hostname: "images.unsplash.com" },
      {
        protocol: "https",
        hostname: "ysadurdujhhpibudwjdj.supabase.co",
        pathname: "/storage/v1/object/public/products/**",
      },
    ],
  },
};

module.exports = nextConfig;
