import { findCityData } from "@/data/german-cities";

/**
 * Estimate current market value based on city avg price/sqm and correction factors.
 */
export function estimateMarketValue(params: {
  city: string;
  area: number;
  buildYear: number;
  energyClass: string;
  locationGrade?: string;
}): number {
  const cityData = findCityData(params.city);
  const basePricePerSqm = cityData?.avgPricePerSqm || 2500; // fallback

  let factor = 1.0;

  // Building year correction
  if (params.buildYear < 1960) factor *= 0.85;
  else if (params.buildYear < 1990) factor *= 0.90;
  else if (params.buildYear < 2010) factor *= 0.95;
  else factor *= 1.05;

  // Energy class correction
  const ec = params.energyClass?.toUpperCase() || "";
  if (["A+", "A", "B"].includes(ec)) factor *= 1.05;
  else if (["E", "F", "G", "H"].includes(ec)) factor *= 0.90;

  // Location grade correction
  const lg = (params.locationGrade || "B").toUpperCase();
  if (lg === "A") factor *= 1.15;
  else if (lg === "B") factor *= 1.00;
  else if (lg === "C") factor *= 0.85;
  else if (lg === "D") factor *= 0.70;

  return Math.round(basePricePerSqm * params.area * factor);
}

/**
 * Calculate months until fixed rate expires.
 * Returns null if no date provided, negative if already expired.
 */
export function monthsUntilFixedRateExpiry(fixedRateUntil: string | null | undefined): number | null {
  if (!fixedRateUntil) return null;
  const [month, year] = fixedRateUntil.split("/").map(Number);
  if (!month || !year) return null;
  const expiryDate = new Date(year, month - 1, 1);
  const now = new Date();
  const diff = (expiryDate.getFullYear() - now.getFullYear()) * 12 + (expiryDate.getMonth() - now.getMonth());
  return diff;
}

/**
 * Get interest rate warning info based on months until expiry.
 */
export function getZinsbindungWarning(months: number | null): {
  level: "none" | "yellow" | "orange" | "red" | "expired";
  text: string;
  cta: string;
} | null {
  if (months === null) return null;
  if (months < 0) return { level: "expired", text: "Zinsbindung abgelaufen! Variable Verzinsung aktiv.", cta: "Anschlussfinanzierung anfragen" };
  if (months < 12) return { level: "red", text: `Zinsbindung läuft in ${months} Monaten ab! Dringend handeln!`, cta: "Anschlussfinanzierung anfragen" };
  if (months < 18) return { level: "orange", text: `Zinsbindung läuft in ${months} Monaten ab. Jetzt Anschlussfinanzierung sichern!`, cta: "Anschlussfinanzierung anfragen" };
  if (months <= 24) return { level: "yellow", text: `Zinsbindung läuft in ${months} Monaten ab. Guter Zeitpunkt für erste Angebote.`, cta: "Angebote einholen" };
  return null;
}

/**
 * Generate strategy recommendations based on portfolio property data.
 */
export function getStrategyRecommendations(p: {
  fixedRateUntil?: string | null;
  cashflow: number;
  marketValue: number;
  purchasePrice: number;
  rentPerSqm: number;
  avgRentPerSqm: number | null;
  energyClass: string;
  repaymentRate: number;
  loanAmount: number;
}): { text: string; action?: string }[] {
  const recs: { text: string; action?: string }[] = [];

  const months = monthsUntilFixedRateExpiry(p.fixedRateUntil);
  if (months !== null && months < 18) {
    recs.push({
      text: "Anschlussfinanzierung sichern. Aktuelle Zinsen vergleichen und Forward-Darlehen prüfen.",
      action: "Kostenlose Finanzierungsberatung",
    });
  }

  if (p.cashflow < 0 && p.marketValue > p.purchasePrice * 1.2) {
    recs.push({
      text: "Negativer Cashflow bei deutlicher Wertsteigerung. Verkauf oder Umfinanzierung prüfen.",
    });
  }

  if (p.avgRentPerSqm && p.rentPerSqm < p.avgRentPerSqm * 0.85) {
    recs.push({
      text: "Mietanpassungspotenzial: Ihre Miete liegt unter dem Marktdurchschnitt. Mieterhöhung prüfen.",
    });
  }

  const ecIdx = ["A+", "A", "B", "C", "D", "E", "F", "G", "H"].indexOf(p.energyClass);
  if (ecIdx >= 5) {
    recs.push({
      text: "Energetische Sanierung empfohlen. KfW-Förderung und steuerliche Absetzbarkeit prüfen.",
    });
  }

  if (p.repaymentRate > 0 && p.repaymentRate < 2) {
    recs.push({
      text: "Niedrige Tilgungsrate. Sondertilgung nutzen um schneller zu entschulden.",
    });
  }

  if (p.loanAmount > 0 && p.marketValue > 0 && p.loanAmount / p.marketValue > 0.8) {
    recs.push({
      text: "Hohe Beleihung. Sondertilgung oder Aufwertung empfohlen.",
    });
  }

  if (recs.length === 0) {
    recs.push({ text: "Solide Aufstellung. Regelmäßig Marktmiete und Zinsentwicklung beobachten." });
  }

  return recs;
}
