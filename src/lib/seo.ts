/* ─── Zentrale SEO-Konfiguration ───
   Eine Quelle der Wahrheit für Domain, Titel, Beschreibungen und
   strukturierte Daten. Wird von layout.tsx, sitemap.ts, robots.ts,
   manifest.ts und den OG-Bildern genutzt. */

export const SITE = {
  name: "ImmoScorer",
  /** Kanonische Domain ohne abschließenden Slash (Live-Host: apex leitet auf www um). */
  url: "https://www.immoscorer.de",
  /** Standardtitel der Startseite. */
  defaultTitle:
    "ImmoScorer — Immobilien als Kapitalanlage bewerten mit KI-Score",
  /** Vorlage für Unterseiten: "Seitentitel | ImmoScorer". */
  titleTemplate: "%s | ImmoScorer",
  description:
    "ImmoScorer bewertet Anlageimmobilien in Sekunden: KI-gestützter Score aus Rendite, Risiko, Finanzierbarkeit, Lage und Energie — mit Verhandlungs-Tipps und Vergleich. Kostenlos starten.",
  locale: "de_DE",
  /** Brand-Akzentfarbe (Dark-Theme) für Manifest, OG-Bilder, Theme-Color. */
  themeColor: "#7C6AFF",
  backgroundColor: "#08090E",
  twitter: "@immoscorer",
} as const;

/** Erzeugt eine absolute URL aus einem Pfad ("/wissen" → "https://immoscorer.de/wissen"). */
export function absoluteUrl(path = ""): string {
  if (!path) return SITE.url;
  return `${SITE.url}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Suchbegriffe, auf die ImmoScorer organisch ranken soll. */
export const SITE_KEYWORDS: string[] = [
  "Immobilie bewerten",
  "Kapitalanlage Immobilie",
  "Immobilien Score",
  "Rendite berechnen Immobilie",
  "Immobilien Renditerechner",
  "Anlageimmobilie analysieren",
  "Immobilienbewertung Tool",
  "Immobilien Finanzierbarkeit prüfen",
  "Kaufpreisfaktor berechnen",
  "Immobilien Cashflow Rechner",
  "Immobilien Investment Analyse",
];

/* ─── Strukturierte Daten (JSON-LD) Bausteine ─── */

/** BreadcrumbList aus einer Liste von Schritten {name, path}. */
export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

/** Article-Markup für einen Wissens-Artikel (Basis für Google Rich Results). */
export function articleJsonLd(opts: {
  title: string;
  description: string;
  path: string;
  section?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: opts.title,
    description: opts.description,
    inLanguage: "de-DE",
    ...(opts.section ? { articleSection: opts.section } : {}),
    url: absoluteUrl(opts.path),
    mainEntityOfPage: { "@type": "WebPage", "@id": absoluteUrl(opts.path) },
    image: absoluteUrl("/opengraph-image"),
    isAccessibleForFree: true,
    author: { "@type": "Organization", name: SITE.name, url: SITE.url },
    publisher: {
      "@type": "Organization",
      name: SITE.name,
      url: SITE.url,
      logo: { "@type": "ImageObject", url: absoluteUrl("/icon") },
    },
  };
}
