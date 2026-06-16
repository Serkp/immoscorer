import { CITIES, getMarketRange, type CityData } from "@/data/german-cities";

/* ──────────────────────────────────────────────────────────────
   Programmatische Stadt-Landingpages „Immobilie als Kapitalanlage in [Stadt]".
   Alle Kennzahlen und Aussagen leiten sich AUS den kuratierten Marktdaten ab
   (german-cities.ts) — keine erfundenen Fakten, nur Rechnung + Einordnung.
   ────────────────────────────────────────────────────────────── */

export function citySlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
    .replace(/[()]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getCityBySlug(slug: string): CityData | null {
  return CITIES.find((c) => citySlug(c.city) === slug) || null;
}

export function allCitySlugs(): { stadt: string }[] {
  return CITIES.map((c) => ({ stadt: citySlug(c.city) }));
}

export interface CityMetrics {
  grossYield: number; // % brutto
  factor: number; // Kaufpreisfaktor
  exArea: number;
  exPrice: number;
  exRent: number;
  exYearly: number;
}

export function cityMetrics(c: CityData): CityMetrics {
  const grossYield = ((c.avgRentPerSqm * 12) / c.avgPricePerSqm) * 100;
  const factor = c.avgPricePerSqm / (c.avgRentPerSqm * 12);
  const exArea = 70;
  return {
    grossYield: Math.round(grossYield * 100) / 100,
    factor: Math.round(factor * 10) / 10,
    exArea,
    exPrice: Math.round((c.avgPricePerSqm * exArea) / 1000) * 1000,
    exRent: Math.round((c.avgRentPerSqm * exArea) / 10) * 10,
    exYearly: Math.round((c.avgRentPerSqm * exArea * 12) / 100) * 100,
  };
}

const TIER_PROFILE: Record<CityData["tier"], { label: string; blurb: string }> = {
  A: { label: "Top-Metropole", blurb: "höchste Preise, hohe Wertstabilität, dafür niedrige Anfangsrenditen" },
  B: { label: "starke Großstadt", blurb: "solide Nachfrage und ein ausgewogenes Verhältnis aus Chance und Risiko" },
  C: { label: "solider Mittelstadt-Markt", blurb: "günstigere Einstiegspreise und tendenziell höhere Anfangsrenditen" },
  D: { label: "günstiger Markt", blurb: "niedrige Einstiegspreise und hohe rechnerische Renditen — Nachfrage und Leerstand aber genau prüfen" },
};

export function tierProfile(c: CityData) {
  return TIER_PROFILE[c.tier];
}

export function yieldVerdict(y: number): string {
  if (y < 3) return "sehr niedrig — hier zahlst du vor allem für Lage und Wertstabilität, nicht für laufenden Cashflow";
  if (y < 3.5) return "niedrig, aber typisch für stark gefragte Top-Lagen";
  if (y < 4.5) return "moderat — ein solides Verhältnis aus Sicherheit und Ertrag";
  if (y < 5.5) return "attraktiv — überdurchschnittlicher laufender Ertrag";
  return "hoch — rechnerisch stark, aber prüfe Substanz, Lage und Vermietbarkeit besonders genau";
}

export function demandVerdict(c: CityData): string {
  const v = c.vacancyRate;
  const vTxt = `${v.toLocaleString("de-DE")} %`;
  if (c.populationTrend === "growing" && v < 1)
    return `Die Bevölkerung wächst und der Leerstand ist mit ${vTxt} sehr niedrig — das spricht für stabile Mieten und ein geringes Vermietungsrisiko.`;
  if (c.populationTrend === "growing")
    return `Die wachsende Bevölkerung stützt die Mietnachfrage; der Leerstand liegt bei rund ${vTxt}.`;
  if (c.populationTrend === "stable")
    return `Die Nachfrage ist stabil, der Leerstand liegt bei rund ${vTxt} — ein berechenbarer Markt.`;
  return `Die Bevölkerung ist rückläufig und der Leerstand liegt bei rund ${vTxt} — Lage und Vermietbarkeit solltest du hier besonders kritisch prüfen.`;
}

/** Bis zu n weitere Städte im selben Bundesland (für interne Verlinkung). */
export function sameStatePeers(c: CityData, n = 6): CityData[] {
  return CITIES.filter((x) => x.state === c.state && x.city !== c.city).slice(0, n);
}

/** Tier-Peers (ähnliches Marktsegment) als zusätzliche interne Links. */
export function tierPeers(c: CityData, n = 6): CityData[] {
  return CITIES.filter((x) => x.tier === c.tier && x.city !== c.city)
    .sort((a, b) => b.population - a.population)
    .slice(0, n);
}

export function cityFaq(c: CityData, m: CityMetrics): { q: string; a: string }[] {
  const eur = (n: number) => n.toLocaleString("de-DE");
  const r = getMarketRange(c);
  return [
    {
      q: `Lohnt sich eine Immobilie als Kapitalanlage in ${c.city}?`,
      a: `${c.city} ist ${tierProfile(c).label === "Top-Metropole" ? "eine" : "ein"} ${tierProfile(c).label} mit ${tierProfile(c).blurb}. Die Brutto-Anfangsrendite liegt im Mittel bei rund ${m.grossYield.toLocaleString("de-DE")} % (Kaufpreisfaktor ca. ${m.factor.toLocaleString("de-DE")}). ${demandVerdict(c)} Ob sich ein konkretes Objekt lohnt, hängt vom Einzelfall ab — rechne es mit dem ImmoScorer in Sekunden durch.`,
    },
    {
      q: `Wie hoch ist die Mietrendite in ${c.city}?`,
      a: `Aus dem durchschnittlichen Kaufpreis von ca. ${eur(c.avgPricePerSqm)} €/m² und einer Durchschnittsmiete von ca. ${c.avgRentPerSqm.toLocaleString("de-DE")} €/m² ergibt sich eine Brutto-Anfangsrendite von rund ${m.grossYield.toLocaleString("de-DE")} %. Das entspricht einem Kaufpreisfaktor von etwa ${m.factor.toLocaleString("de-DE")} — ${yieldVerdict(m.grossYield)}.`,
    },
    {
      q: `Was kostet eine Eigentumswohnung in ${c.city}?`,
      a: `Der durchschnittliche Quadratmeterpreis liegt bei ca. ${eur(c.avgPricePerSqm)} €/m², je nach Lage und Zustand typischerweise zwischen ${eur(r.priceMin)} und ${eur(r.priceMax)} €/m². Eine ${m.exArea}-m²-Wohnung kostet damit im Mittel rund ${eur(m.exPrice)} €.`,
    },
    {
      q: `Wie bewerte ich ein konkretes Objekt in ${c.city}?`,
      a: `Gib Kaufpreis, Miete und Eckdaten in den kostenlosen ImmoScorer ein — du bekommst in Sekunden einen Score, Rendite- und Risiko-Kennzahlen sowie Verhandlungs-Tipps. Für die Besichtigung führt dich der Besichtigungs-Begleiter per Sprache durch die wichtigsten Prüfpunkte.`,
    },
  ];
}
