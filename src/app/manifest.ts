import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ניהול אורות וכלים",
    short_name: "ניהול",
    description: "פאנל הניהול של סטודיו אורות וכלים.",
    start_url: "/admin",
    scope: "/admin",
    display: "standalone",
    background_color: "#efe6d6",
    theme_color: "#3b352d",
    lang: "he",
    dir: "rtl",
    orientation: "portrait",
    icons: [
      {
        src: "/logo-2169x1282-black.png",
        sizes: "any",
        type: "image/png",
      },
    ],
  };
}
