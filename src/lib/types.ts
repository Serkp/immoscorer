export type EnergyClass = "A+" | "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H";
export type LocationGrade = "A" | "B" | "C" | "D";

export interface Renovations {
  roof: boolean;
  facade: boolean;
  windows: boolean;
  bathroom: boolean;
  electrical: boolean;
  heating: boolean;
}

export interface Property {
  id: string;
  street: string;
  city: string;
  purchasePrice: number;
  monthlyRent: number;
  housegeld: number;
  baujahr: number;
  energyClass: EnergyClass;
  areaSqm: number;
  locationGrade: LocationGrade;
  renovations: Renovations;
  exposeImageUrl?: string;
  score: number;
  scoringResult?: import("./scoring").ScoringResult;
  trend: "up" | "down" | "stable";
  favorite: boolean;
  createdAt: string;
}
