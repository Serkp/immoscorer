import type { MetadataRoute } from "next";
import { SITE } from "@/lib/seo";

/* Web-App-Manifest: ermöglicht "Zur Startseite hinzufügen" auf Mobilgeräten
   und legt die Basis für eine spätere PWA / App-Store-Veröffentlichung. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE.name} — Immobilien als Kapitalanlage bewerten`,
    short_name: SITE.name,
    description: SITE.description,
    start_url: "/",
    display: "standalone",
    background_color: SITE.backgroundColor,
    theme_color: SITE.themeColor,
    lang: "de",
    categories: ["finance", "business", "productivity"],
    icons: [
      {
        src: "/icon",
        sizes: "any",
        type: "image/png",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
