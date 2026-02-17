import { EnergyClass, LocationGrade, Renovations } from "./types";

/** Simple scoring function (0-100) based on property attributes. */
export function computeScore(params: {
  purchasePrice: number;
  monthlyRent: number;
  housegeld: number;
  baujahr: number;
  energyClass: EnergyClass;
  areaSqm: number;
  locationGrade: LocationGrade;
  renovations: Renovations;
}): number {
  let score = 50;

  // Yield factor: annual rent / price
  const annualRent = params.monthlyRent * 12;
  const grossYield = annualRent / params.purchasePrice;
  if (grossYield >= 0.07) score += 15;
  else if (grossYield >= 0.05) score += 10;
  else if (grossYield >= 0.03) score += 3;
  else score -= 5;

  // Hausgeld ratio to rent
  const hausgeldRatio = params.housegeld / params.monthlyRent;
  if (hausgeldRatio <= 0.2) score += 5;
  else if (hausgeldRatio >= 0.5) score -= 10;

  // Price per sqm
  const pricePerSqm = params.purchasePrice / params.areaSqm;
  if (pricePerSqm <= 2000) score += 10;
  else if (pricePerSqm <= 3500) score += 5;
  else if (pricePerSqm >= 6000) score -= 5;

  // Building age
  const age = new Date().getFullYear() - params.baujahr;
  if (age <= 10) score += 8;
  else if (age <= 30) score += 3;
  else if (age >= 60) score -= 5;

  // Energy class
  const energyScores: Record<EnergyClass, number> = {
    "A+": 10, A: 8, B: 6, C: 4, D: 2, E: 0, F: -3, G: -5, H: -8,
  };
  score += energyScores[params.energyClass];

  // Location
  const locationScores: Record<LocationGrade, number> = { A: 10, B: 5, C: 0, D: -5 };
  score += locationScores[params.locationGrade];

  // Renovations needed (each needed one deducts points)
  const renoEntries = Object.values(params.renovations);
  const neededCount = renoEntries.filter(Boolean).length;
  score -= neededCount * 3;

  return Math.max(0, Math.min(100, Math.round(score)));
}

export function scoreTrend(): "up" | "down" | "stable" {
  const r = Math.random();
  if (r < 0.33) return "up";
  if (r < 0.66) return "stable";
  return "down";
}
