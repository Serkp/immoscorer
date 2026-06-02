import type { MetadataRoute } from "next";
import { absoluteUrl, SITE } from "@/lib/seo";

/* Steuert, welche Bereiche Suchmaschinen crawlen dürfen.
   Private/eingeloggte Bereiche und APIs werden ausgeschlossen,
   damit nur öffentliche Marketing- und Wissens-Seiten indexiert werden. */
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
        "/analysis",
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
