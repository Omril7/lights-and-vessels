import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ניהול אורות וכלים",
    short_name: "אורות וכלים",
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
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
