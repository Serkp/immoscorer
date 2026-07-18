import type { MetadataRoute } from "next";
import { absoluteUrl, SITE } from "@/lib/seo";

/* Steuert, welche Bereiche Suchmaschinen crawlen dürfen.
   Private/eingeloggte Bereiche und APIs werden ausgeschlossen,
   damit nur öffentliche Marketing- und Wissens-Seiten indexiert werden.
   Hinweis: /analysis ist NICHT mehr disallowed — die Seite ist aus Navbar
   und Stadtseiten intern verlinkt, ein robots-Disallow würde Google das
   serverseitige noindex (src/app/analysis/layout.tsx) nicht sehen lassen und
   könnte zu "indexiert trotz robots-Blockade" führen. Der Ausschluss läuft
   dort jetzt sauber über noindex statt robots-Disallow. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/auth/",
        "/dashboard",
        "/portfolio",
        "/properties",
        "/settings",
        "/compare",
        "/expose-analyse",
        "/ki-berater",
        "/reset-password",
      ],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
    host: SITE.url,
  };
}
