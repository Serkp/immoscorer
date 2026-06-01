/* ─── Zentrale SEO-Konfiguration ───
   Eine Quelle der Wahrheit für Domain, Titel, Beschreibungen und
   strukturierte Daten. Wird von layout.tsx, sitemap.ts, robots.ts,
   manifest.ts und den OG-Bildern genutzt. */

export const SITE = {
  name: "ImmoScorer",
  /** Kanonische Domain ohne abschließenden Slash. */
  url: "https://immoscorer.de",
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
