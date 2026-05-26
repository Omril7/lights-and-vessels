import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "אורות וכלים — תכשיטים וחפצים בעבודת יד",
    short_name: "אורות וכלים",
    description:
      "אוסף סטודיו קטן של תכשיטים וחפצים לבית, נוצרים לאט ובעבודת יד.",
    start_url: "/",
    display: "standalone",
    background_color: "#f7f1e6",
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
